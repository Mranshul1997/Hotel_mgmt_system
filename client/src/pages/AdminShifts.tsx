import React, { useState } from "react";

const initialShiftDetails = [
  {
    id: 1,
    name: "Morning",
    timing: "07:00 - 15:00",
    breaks: [
      { name: "Tea Break", timing: "10:00 - 10:15" },
      { name: "Lunch Break", timing: "13:00 - 13:30" },
    ],
  },
  {
    id: 2,
    name: "Evening",
    timing: "15:00 - 23:00",
    breaks: [
      { name: "Tea Break", timing: "18:00 - 18:15" },
      { name: "Dinner Break", timing: "21:00 - 21:30" },
    ],
  },
  {
    id: 3,
    name: "Night",
    timing: "23:00 - 07:00",
    breaks: [
      { name: "Tea Break", timing: "02:00 - 02:15" },
      { name: "Midnight Snack", timing: "04:00 - 04:30" },
    ],
  },
];

const AdminShifts = () => {
  const [shifts, setShifts] = useState(initialShiftDetails);
  const [editingId, setEditingId] = useState(null);
  const [editShift, setEditShift] = useState(null);

  // Start editing a shift
  const handleEditClick = (shift) => {
    setEditingId(shift.id);
    // Make a deep copy for editing to avoid immediate state update
    setEditShift(JSON.parse(JSON.stringify(shift)));
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditShift(null);
  };

  // Handle changes in timing or breaks in edit mode
  const handleShiftTimingChange = (value) => {
    setEditShift((prev) => ({ ...prev, timing: value }));
  };

  const handleBreakChange = (idx, value) => {
    const newBreaks = [...editShift.breaks];
    newBreaks[idx].timing = value;
    setEditShift((prev) => ({ ...prev, breaks: newBreaks }));
  };

  // Save changes from editing
  const handleSave = () => {
    setShifts((prev) => prev.map((s) => (s.id === editingId ? editShift : s)));
    setEditingId(null);
    setEditShift(null);
    alert("Shift timings saved!");
    // Replace alert with actual API call if needed
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Shift Timings & Breaks</h2>
      <div className="overflow-x-auto bg-gray-900 rounded-xl shadow border border-blue-700/30">
        <table className="min-w-full divide-y divide-blue-700/50 text-base">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-sm">
              <th className="p-4 w-20">S.No.</th>
              <th className="p-4 w-28">Shift Name</th>
              <th className="p-4 w-52">Timing</th>
              <th className="p-4">Breaks</th>
              <th className="p-4 w-32">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {shifts.map((shift) => (
              <tr
                key={shift.id}
                className={`hover:bg-gray-800/30 cursor-default align-top`}
              >
                <td className="p-4 font-mono">{shift.id}</td>
                <td className="p-4 font-semibold text-blue-400">
                  {shift.name}
                </td>
                <td className="p-4 font-mono text-green-400">
                  {editingId === shift.id ? (
                    <input
                      type="text"
                      className="w-full bg-input border border-border text-white rounded p-2 font-mono"
                      value={editShift.timing}
                      onChange={(e) => handleShiftTimingChange(e.target.value)}
                    />
                  ) : (
                    shift.timing
                  )}
                </td>
                <td className="p-4">
                  {editingId === shift.id
                    ? editShift.breaks.map((brk, idx) => (
                        <div key={idx} className="mb-1 flex items-center gap-2">
                          <span className="font-semibold text-yellow-400">
                            {brk.name}:
                          </span>
                          <input
                            type="text"
                            className="bg-input border border-border text-white rounded p-1 font-mono w-36"
                            value={brk.timing}
                            onChange={(e) =>
                              handleBreakChange(idx, e.target.value)
                            }
                          />
                        </div>
                      ))
                    : shift.breaks.map((brk, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="font-semibold text-yellow-400">
                            {brk.name}:
                          </span>{" "}
                          <span className="font-mono">{brk.timing}</span>
                        </div>
                      ))}
                </td>
                <td className="p-4">
                  {editingId === shift.id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="mr-2 px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-white font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white font-semibold"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditClick(shift)}
                      className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminShifts;
