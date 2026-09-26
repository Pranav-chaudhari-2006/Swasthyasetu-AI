import { rbacService } from '../services/rbac.service';
import { UserRole, Permission } from '../types';

describe('MS-1: 10-Role RBAC & Scope Policy Engine Tests', () => {
  it('PATIENT role permissions matrix', () => {
    expect(rbacService.hasPermission('PATIENT', 'INTAKE_DIRECT_SUBMIT')).toBe(true);
    expect(rbacService.hasPermission('PATIENT', 'CASE_READ_OWN')).toBe(true);
    expect(rbacService.hasPermission('PATIENT', 'CLINICAL_PRESCRIBE')).toBe(false);
    expect(rbacService.hasPermission('PATIENT', 'REFERRAL_ACCEPT_DECLINE')).toBe(false);
    expect(rbacService.hasPermission('PATIENT', 'AUDIT_VIEW')).toBe(false);
  });

  it('ASHA & ANM frontline roles permissions matrix', () => {
    const frontlineRoles: UserRole[] = ['ASHA', 'ANM', 'MPW'];
    for (const role of frontlineRoles) {
      expect(rbacService.hasPermission(role, 'INTAKE_ASSISTED_SUBMIT')).toBe(true);
      expect(rbacService.hasPermission(role, 'SAFETY_EVALUATE')).toBe(true);
      expect(rbacService.hasPermission(role, 'REFERRAL_CREATE')).toBe(true);
      expect(rbacService.hasPermission(role, 'EMERGENCY_TRIGGER')).toBe(true);
      expect(rbacService.hasPermission(role, 'FOLLOWUP_COMPLETE_WORKER')).toBe(true);
      // Frontline cannot prescribe or admit patients
      expect(rbacService.hasPermission(role, 'CLINICAL_PRESCRIBE')).toBe(false);
      expect(rbacService.hasPermission(role, 'CLINICAL_ADMIT_DISCHARGE')).toBe(false);
    }
  });

  it('MEDICAL_OFFICER & SPECIALIST clinical permissions matrix', () => {
    const clinicalRoles: UserRole[] = ['MEDICAL_OFFICER', 'SPECIALIST'];
    for (const role of clinicalRoles) {
      expect(rbacService.hasPermission(role, 'CLINICAL_ASSESS')).toBe(true);
      expect(rbacService.hasPermission(role, 'CLINICAL_PRESCRIBE')).toBe(true);
      expect(rbacService.hasPermission(role, 'CLINICAL_ADMIT_DISCHARGE')).toBe(true);
      expect(rbacService.hasPermission(role, 'DIAGNOSTIC_ORDER')).toBe(true);
      expect(rbacService.hasPermission(role, 'REFERRAL_ACCEPT_DECLINE')).toBe(true);
    }
  });

  it('FACILITY_ADMIN permissions matrix', () => {
    expect(rbacService.hasPermission('FACILITY_ADMIN', 'FACILITY_WRITE_CONFIG')).toBe(true);
    expect(rbacService.hasPermission('FACILITY_ADMIN', 'MEDICINE_STOCK_UPDATE')).toBe(true);
    expect(rbacService.hasPermission('FACILITY_ADMIN', 'AUDIT_VIEW')).toBe(true);
    // Facility admin cannot prescribe or assess patients
    expect(rbacService.hasPermission('FACILITY_ADMIN', 'CLINICAL_PRESCRIBE')).toBe(false);
    expect(rbacService.hasPermission('FACILITY_ADMIN', 'CLINICAL_ASSESS')).toBe(false);
  });

  it('DISTRICT_OFFICER permissions matrix', () => {
    expect(rbacService.hasPermission('DISTRICT_OFFICER', 'DISTRICT_VIEW_METRICS')).toBe(true);
    expect(rbacService.hasPermission('DISTRICT_OFFICER', 'AUDIT_VIEW')).toBe(true);
    expect(rbacService.hasPermission('DISTRICT_OFFICER', 'CASE_READ_DISTRICT')).toBe(true);
    expect(rbacService.hasPermission('DISTRICT_OFFICER', 'CLINICAL_PRESCRIBE')).toBe(false);
  });

  it('should enforce patient ownership scope', () => {
    // Patient accessing own record
    const ownAccess = rbacService.authorize({
      role: 'PATIENT',
      requiredPermission: 'CASE_READ_OWN',
      isResourceOwner: true,
    });
    expect(ownAccess.allowed).toBe(true);

    // Patient attempting to access another patient's record
    const forbiddenAccess = rbacService.authorize({
      role: 'PATIENT',
      requiredPermission: 'CASE_READ_OWN',
      isResourceOwner: false,
    });
    expect(forbiddenAccess.allowed).toBe(false);
    expect(forbiddenAccess.reason).toContain('Patient can only access own records');
  });

  it('should enforce facility scope for medical officers', () => {
    const facilityA = 'facility-111';
    const facilityB = 'facility-222';

    // Doctor accessing patient in their own facility
    const sameFacility = rbacService.authorize({
      role: 'MEDICAL_OFFICER',
      requiredPermission: 'CLINICAL_ASSESS',
      userFacilityId: facilityA,
      resourceFacilityId: facilityA,
    });
    expect(sameFacility.allowed).toBe(true);

    // Doctor attempting to access different facility without transfer
    const diffFacility = rbacService.authorize({
      role: 'MEDICAL_OFFICER',
      requiredPermission: 'CLINICAL_ASSESS',
      userFacilityId: facilityA,
      resourceFacilityId: facilityB,
    });
    expect(diffFacility.allowed).toBe(false);
    expect(diffFacility.reason).toContain('does not match target facility');
  });
});
