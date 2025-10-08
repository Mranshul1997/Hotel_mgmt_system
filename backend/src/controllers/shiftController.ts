import { Request, Response } from 'express';
import Shift from '../models/shiftModel';

// Create shift
export const createShift = async (req: Request, res: Response) => {
  try {
    const shift = new Shift(req.body);
    const saved = await shift.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

// Get all shifts
export const listShifts = async (_req: Request, res: Response) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Update shift
export const updateShift = async (req: Request, res: Response) => {
  try {
    const updated = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

// Delete shift
export const deleteShift = async (req: Request, res: Response) => {
  try {
    const deleted = await Shift.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
