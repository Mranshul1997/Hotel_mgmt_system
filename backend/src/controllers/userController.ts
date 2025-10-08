import { Request, Response } from 'express';
import User from '../models/userModel';

// Create a user
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    const saved = await user.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

// Get all users
export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    if (updatedData.salary) {
      updatedData.perDaySalary = updatedData.salary / 30;
      updatedData.perMinuteSalary = updatedData.perDaySalary / (8 * 60);
    }

    const updated = await User.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
