import { UserRole, Permission } from '../types';

export class RBACService {
  private rolePermissions: Record<UserRole, Permission[]> = {
    PATIENT: [
      'INTAKE_DIRECT_SUBMIT',
      'CASE_READ_OWN',
      'FOLLOWUP_COMPLETE_SELF',
    ],
    CAREGIVER: [
      'INTAKE_DIRECT_SUBMIT',
      'CASE_READ_OWN',
      'FOLLOWUP_COMPLETE_SELF',
    ],
    ASHA: [
      'INTAKE_ASSISTED_SUBMIT',
      'CASE_READ_ASSIGNED',
      'SAFETY_EVALUATE',
      'FACILITY_READ',
      'REFERRAL_CREATE',
      'EMERGENCY_TRIGGER',
      'FOLLOWUP_COMPLETE_WORKER',
    ],
    ANM: [
      'INTAKE_ASSISTED_SUBMIT',
      'CASE_READ_ASSIGNED',
      'SAFETY_EVALUATE',
      'FACILITY_READ',
      'REFERRAL_CREATE',
      'EMERGENCY_TRIGGER',
      'FOLLOWUP_COMPLETE_WORKER',
    ],
    MPW: [
      'INTAKE_ASSISTED_SUBMIT',
      'CASE_READ_ASSIGNED',
      'SAFETY_EVALUATE',
      'FACILITY_READ',
      'REFERRAL_CREATE',
      'EMERGENCY_TRIGGER',
      'FOLLOWUP_COMPLETE_WORKER',
    ],
    CHO: [
      'INTAKE_ASSISTED_SUBMIT',
      'CASE_READ_ASSIGNED',
      'SAFETY_EVALUATE',
      'FACILITY_READ',
      'REFERRAL_CREATE',
      'EMERGENCY_TRIGGER',
      'CLINICAL_ASSESS',
      'MEDICINE_DISPENSE',
      'FOLLOWUP_COMPLETE_WORKER',
    ],
    MEDICAL_OFFICER: [
      'INTAKE_ASSISTED_SUBMIT',
      'CASE_READ_FACILITY',
      'SAFETY_EVALUATE',
      'FACILITY_READ',
      'REFERRAL_CREATE',
      'REFERRAL_ACCEPT_DECLINE',
      'REFERRAL_SCAN_ARRIVAL',
      'EMERGENCY_TRIGGER',
      'CLINICAL_ASSESS',
      'CLINICAL_PRESCRIBE',
      'CLINICAL_ADMIT_DISCHARGE',
      'DIAGNOSTIC_ORDER',
      'DIAGNOSTIC_RESULT_ATTACH',
      'FOLLOWUP_COMPLETE_WORKER',
    ],
    SPECIALIST: [
      'CASE_READ_FACILITY',
      'SAFETY_EVALUATE',
      'FACILITY_READ',
      'REFERRAL_ACCEPT_DECLINE',
      'REFERRAL_SCAN_ARRIVAL',
      'EMERGENCY_TRIGGER',
      'CLINICAL_ASSESS',
      'CLINICAL_PRESCRIBE',
      'CLINICAL_ADMIT_DISCHARGE',
      'DIAGNOSTIC_ORDER',
      'DIAGNOSTIC_RESULT_ATTACH',
    ],
    FACILITY_ADMIN: [
      'FACILITY_READ',
      'FACILITY_WRITE_CONFIG',
      'REFERRAL_ACCEPT_DECLINE',
      'REFERRAL_SCAN_ARRIVAL',
      'MEDICINE_STOCK_UPDATE',
      'AUDIT_VIEW',
    ],
    DISTRICT_OFFICER: [
      'FACILITY_READ',
      'CASE_READ_DISTRICT',
      'DISTRICT_VIEW_METRICS',
      'AUDIT_VIEW',
    ],
  };

  /**
   * Evaluates if a role has the required base permission
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = this.rolePermissions[role];
    if (!permissions) return false;
    return permissions.includes(permission);
  }

  /**
   * Evaluates role, permission, and facility/jurisdiction scope
   */
  authorize(params: {
    role: UserRole;
    requiredPermission: Permission;
    userFacilityId?: string;
    resourceFacilityId?: string;
    userDistrict?: string;
    resourceDistrict?: string;
    isResourceOwner?: boolean;
  }): { allowed: boolean; reason?: string } {
    const {
      role,
      requiredPermission,
      userFacilityId,
      resourceFacilityId,
      userDistrict,
      resourceDistrict,
      isResourceOwner,
    } = params;

    // 1. Check if the role possesses the base permission
    if (!this.hasPermission(role, requiredPermission)) {
      return {
        allowed: false,
        reason: `Role '${role}' is not granted permission '${requiredPermission}'`,
      };
    }

    // 2. Patient / Caregiver Ownership Scope Check
    if (role === 'PATIENT' || role === 'CAREGIVER') {
      if (
        (requiredPermission === 'CASE_READ_OWN' || requiredPermission === 'FOLLOWUP_COMPLETE_SELF') &&
        !isResourceOwner
      ) {
        return {
          allowed: false,
          reason: 'Access denied: Patient can only access own records',
        };
      }
    }

    // 3. Facility Scope Check for Clinical & Facility Admin Roles
    if (
      (role === 'MEDICAL_OFFICER' || role === 'SPECIALIST' || role === 'FACILITY_ADMIN') &&
      resourceFacilityId &&
      userFacilityId &&
      userFacilityId !== resourceFacilityId
    ) {
      return {
        allowed: false,
        reason: `Access denied: Staff facility '${userFacilityId}' does not match target facility '${resourceFacilityId}'`,
      };
    }

    // 4. District Scope Check for District Officer
    if (
      role === 'DISTRICT_OFFICER' &&
      resourceDistrict &&
      userDistrict &&
      userDistrict !== resourceDistrict
    ) {
      return {
        allowed: false,
        reason: `Access denied: District officer jurisdiction '${userDistrict}' does not match resource district '${resourceDistrict}'`,
      };
    }

    return { allowed: true };
  }
}

export const rbacService = new RBACService();
