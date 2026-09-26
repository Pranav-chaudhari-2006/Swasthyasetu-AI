import { db } from '../db/database';
import { config } from '../config';
import { RouteMatchQuery, RankedFacilityResult, FacilityWithCapabilities, CapabilityStatus } from '../types';

export class RoutingService {
  /**
   * Calculates Haversine great-circle distance between two GPS points in kilometers
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's mean radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Evaluates freshness of capability records
   */
  evaluateFreshness(lastVerifiedAt: Date): 'FRESH' | 'STALE' {
    const hoursSinceVerification =
      (Date.now() - new Date(lastVerifiedAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceVerification <= config.FRESHNESS_THRESHOLD_HOURS ? 'FRESH' : 'STALE';
  }

  /**
   * Capability-Based Routing Engine: Matches, ranks, and explains facility suitability
   */
  async matchAndRankFacilities(query: RouteMatchQuery): Promise<RankedFacilityResult[]> {
    const allFacilities = await db.listAllFacilitiesWithCapabilities();
    const maxDistance = query.maxDistanceKm || config.DEFAULT_MAX_DISTANCE_KM;
    const requiredCaps = query.requiredCapabilities.map((c) => c.toUpperCase());

    const scoredFacilities: RankedFacilityResult[] = [];

    for (const facilityWithCaps of allFacilities) {
      const { latitude, longitude } = facilityWithCaps;
      const distanceKm = this.calculateDistanceKm(
        query.userLatitude,
        query.userLongitude,
        latitude,
        longitude
      );

      // Distance threshold check
      if (distanceKm > maxDistance) continue;

      const activeCaps = facilityWithCaps.capabilities.filter(
        (c) => c.status === 'VERIFIED_AVAILABLE' || c.status === 'LOW_CAPACITY'
      );

      const matchedCaps: string[] = [];
      const missingCaps: string[] = [];
      const matchReasons: string[] = [];
      let staleCount = 0;

      for (const reqCap of requiredCaps) {
        const found = activeCaps.find((c) => c.capabilityCode.toUpperCase() === reqCap);
        if (found) {
          matchedCaps.push(reqCap);
          const freshness = this.evaluateFreshness(found.lastVerifiedAt);
          if (freshness === 'STALE') {
            staleCount++;
            matchReasons.push(`Verified capability '${reqCap}' (verification > 48h old)`);
          } else {
            matchReasons.push(`Verified fresh capability '${reqCap}'`);
          }
        } else {
          missingCaps.push(reqCap);
        }
      }

      const isAllCapabilitiesMet = requiredCaps.length === 0 || missingCaps.length === 0;

      // Base score calculation
      // 1. Coverage percentage (0 - 60 pts)
      const coverageRatio = requiredCaps.length > 0 ? matchedCaps.length / requiredCaps.length : 1;
      let matchScore = coverageRatio * 60;

      // 2. Proximity bonus (0 - 30 pts)
      // Closer distance yields higher score: e.g. 0km -> 30pts, 50km -> 15pts, 100km -> 0pts
      const distanceScore = Math.max(0, 30 * (1 - distanceKm / maxDistance));
      matchScore += distanceScore;

      // 3. Freshness modifier (-10 pts if any capability is stale)
      let overallFreshness: 'FRESH' | 'STALE' | 'UNVERIFIED' = 'FRESH';
      if (activeCaps.length === 0) {
        overallFreshness = 'UNVERIFIED';
        matchScore -= 15;
      } else if (staleCount > 0) {
        overallFreshness = 'STALE';
        matchScore -= 10;
      } else {
        matchScore += 10;
      }

      // 4. Emergency Mode bonus
      if (query.emergencyMode) {
        const hasEmergencyOT = activeCaps.some((c) => c.capabilityCode === 'EMERGENCY_OT');
        const hasICU = activeCaps.some((c) => c.capabilityCode === 'ICU_GENERAL' || c.capabilityCode === 'ICU_PEDIATRIC');
        if (hasEmergencyOT && hasICU) {
          matchScore += 20;
          matchReasons.push('Critical emergency OT and ICU verified active');
        }
      }

      matchReasons.push(`Distance: ${distanceKm} km from patient location`);

      scoredFacilities.push({
        facility: {
          id: facilityWithCaps.id,
          facilityCode: facilityWithCaps.facilityCode,
          name: facilityWithCaps.name,
          facilityTier: facilityWithCaps.facilityTier,
          district: facilityWithCaps.district,
          state: facilityWithCaps.state,
          latitude: facilityWithCaps.latitude,
          longitude: facilityWithCaps.longitude,
          address: facilityWithCaps.address,
          phone: facilityWithCaps.phone,
          operatingHours: facilityWithCaps.operatingHours,
          isActive: facilityWithCaps.isActive,
          createdAt: facilityWithCaps.createdAt,
          updatedAt: facilityWithCaps.updatedAt,
        },
        distanceKm,
        matchScore: parseFloat(matchScore.toFixed(2)),
        isAllCapabilitiesMet,
        matchedCapabilities: matchedCaps,
        missingCapabilities: missingCaps,
        capabilityFreshness: overallFreshness,
        matchReasons,
        operatingStatus: 'OPEN',
      });
    }

    // Sort by: 1) All required capabilities met first, 2) Highest match score
    scoredFacilities.sort((a, b) => {
      if (a.isAllCapabilitiesMet && !b.isAllCapabilitiesMet) return -1;
      if (!a.isAllCapabilitiesMet && b.isAllCapabilitiesMet) return 1;
      return b.matchScore - a.matchScore;
    });

    return scoredFacilities;
  }
}

export const routingService = new RoutingService();
