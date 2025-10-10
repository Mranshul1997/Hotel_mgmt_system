import React, { useEffect, useState } from "react";
import {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  ShiftType,
} from "../api/shiftApi";

const emptyForm: Omit<ShiftType, "_id" | "createdAt" | "updatedAt"> = {
  name: "",
  checkInTime: "",
  checkOutTime: "",
};

// Helper to always format time as "HH:mm"
function formatTime24(time: string) {
  if (!time) return "";
  // If already "HH:mm", return
  if (/^\d{2}:\d{2}$/.test(time)) return time;
  // If browser gives "H:mm", pad start
  if (/^\d:\d{2}$/.test(time)) return `0${time}`;
  // If browser gives "HH:mm:ss", take first 5
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time.slice(0, 5);
  return time; // fallback: return as is
}

const AdminShifts = () => {
  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchShifts = async () => {
    try {
      const data = await listShifts();
      setShifts(Array.isArray(data) ? data : []);
    } catch {
      setShifts([]);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleShowAdd = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleShowEdit = (shift: ShiftType) => {
    setForm({
      name: shift.name,
      checkInTime: formatTime24(shift.checkInTime),
      checkOutTime: formatTime24(shift.checkOutTime),
    });
    setIsEdit(true);
    setEditingId(shift._id!);
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Enforce 24hr formatting before send
    const payload = {
      ...form,
      checkInTime: formatTime24(form.checkInTime),
      checkOutTime: formatTime24(form.checkOutTime),
    };
    try {
      if (isEdit && editingId) {
        await updateShift(editingId, payload);
      } else {
        await createShift(payload);
      }
      setShowModal(false);
      setForm(emptyForm);
      setIsEdit(false);
      setEditingId(null);
      fetchShifts();
    } catch (err) {
      setError("Failed to save shift");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this shift?")) return;
    try {
      await deleteShift(id);
      fetchShifts();
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Shifts</h2>
        <button
          className="bg-primary text-white font-semibold px-4 py-2 rounded-lg shadow"
          onClick={handleShowAdd}
        >
          + Add Shift
        </button>
      </div>
      <div className="overflow-x-auto bg-gray-900 rounded-xl shadow border border-blue-700/20">
        <table className="min-w-full divide-y divide-blue-700/50">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs">
              <th className="p-3">Name</th>
              <th className="p-3">Check-In</th>
              <th className="p-3">Check-Out</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {Array.isArray(shifts) &&
              shifts.map((shift) => (
                <tr key={shift._id}>
                  <td className="p-3">{shift.name}</td>
                  <td className="p-3">{formatTime24(shift.checkInTime)}</td>
                  <td className="p-3">{formatTime24(shift.checkOutTime)}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      className="text-xs text-blue-400 underline"
                      onClick={() => handleShowEdit(shift)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-red-400 underline"
                      onClick={() => handleDelete(shift._id!)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-xs w-full border border-primary/30">
            <h3 className="text-xl font-bold mb-4 text-white">
              {isEdit ? "Edit Shift" : "Add New Shift"}
            </h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-gray-200 mb-2">
                  Shift Name
                </label>
                <input
                  className="w-full p-2 rounded bg-input border-border text-white"
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">
                  Check-In Time
                </label>
                <input
                  className="w-full p-2 rounded bg-input border-border text-white"
                  type="time"
                  name="checkInTime"
                  required
                  value={form.checkInTime}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">
                  Check-Out Time
                </label>
                <input
                  className="w-full p-2 rounded bg-input border-border text-white"
                  type="time"
                  name="checkOutTime"
                  required
                  value={form.checkOutTime}
                  onChange={handleChange}
                />
              </div>
              {error && (
                <div className="text-sm text-red-400 mb-2">{error}</div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded"
                  onClick={() => {
                    setShowModal(false);
                    setIsEdit(false);
                    setForm(emptyForm);
                    setEditingId(null);
                    setError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-bold rounded"
                >
                  {isEdit ? "Save Changes" : "Add Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShifts;
