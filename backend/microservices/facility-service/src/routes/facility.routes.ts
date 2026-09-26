import { Router } from 'express';
import { facilityController } from '../controllers/facility.controller';

const router = Router();

// Facility Master Catalog Routes
router.post('/', (req, res) => facilityController.createFacility(req, res));
router.get('/', (req, res) => facilityController.listFacilities(req, res));
router.get('/:id', (req, res) => facilityController.getFacility(req, res));

// Dynamic Capability Endpoints
router.put('/:id/capabilities', (req, res) => facilityController.updateCapability(req, res));
router.put('/:id/capabilities/batch', (req, res) => facilityController.batchUpdateCapabilities(req, res));

// Capability-Based Routing & Proximity Match Route
router.post('/route-match', (req, res) => facilityController.matchAndRoute(req, res));

export default router;
