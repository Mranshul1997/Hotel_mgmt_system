import { Router } from 'express';
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController';

const router = Router();

router.post('/', createUser);       // Create
router.get('/', listUsers);         // List
router.put('/:id', updateUser);     // Edit
router.delete('/:id', deleteUser);  // Delete

export default router;
