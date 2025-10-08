import { Router } from 'express';
import {
  createShift,
  listShifts,
  updateShift,
  deleteShift,
} from '../controllers/shiftController';

const router = Router();

router.post('/', createShift);           // Create
router.get('/', listShifts);             // List
router.put('/:id', updateShift);         // Edit
router.delete('/:id', deleteShift);      // Delete

export default router;
