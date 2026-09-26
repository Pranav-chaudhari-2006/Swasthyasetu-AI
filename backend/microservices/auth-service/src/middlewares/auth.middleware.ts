import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token.service';
import { rbacService } from '../services/rbac.service';
import { TokenPayload, Permission, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  correlationId?: string;
}

/**
 * Middleware ensuring an X-Correlation-ID is attached to every incoming request
 */
export function correlationIdMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  next();
}

/**
 * Middleware extracting and verifying Bearer JWT tokens
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid Authorization header',
      correlationId: req.correlationId,
    });
    return;
  }

  const payload = tokenService.verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Access token is expired or signature is invalid',
      correlationId: req.correlationId,
    });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Middleware factory enforcing RBAC permission and optional facility/jurisdiction scoping
 */
export function requirePermission(
  requiredPermission: Permission,
  options?: {
    checkFacilityScope?: boolean;
    getFacilityIdFrom?: (req: AuthenticatedRequest) => string | undefined;
    getDistrictFrom?: (req: AuthenticatedRequest) => string | undefined;
    isOwnerCheck?: (req: AuthenticatedRequest) => boolean;
  }
) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required before permission check',
        correlationId: req.correlationId,
      });
      return;
    }

    const resourceFacilityId = options?.getFacilityIdFrom
      ? options.getFacilityIdFrom(req)
      : (req.params.facilityId as string) || (req.body.facilityId as string);

    const resourceDistrict = options?.getDistrictFrom
      ? options.getDistrictFrom(req)
      : (req.params.district as string) || (req.body.district as string);

    const isResourceOwner = options?.isOwnerCheck
      ? options.isOwnerCheck(req)
      : req.params.patientId === req.user.userId || req.body.patientId === req.user.userId;

    const result = rbacService.authorize({
      role: req.user.role,
      requiredPermission,
      userFacilityId: req.user.facilityId,
      resourceFacilityId,
      userDistrict: req.user.district,
      resourceDistrict,
      isResourceOwner,
    });

    if (!result.allowed) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: result.reason || 'You do not have permission to perform this action',
        requiredPermission,
        userRole: req.user.role,
        correlationId: req.correlationId,
      });
      return;
    }

    next();
  };
}

/**
 * Restrict endpoint access to specific roles only
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required',
        correlationId: req.correlationId,
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Access restricted to roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`,
        correlationId: req.correlationId,
      });
      return;
    }

    next();
  };
}
