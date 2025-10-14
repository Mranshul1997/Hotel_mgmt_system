import React, { useState } from "react";
const ApplyLeaveModal = ({
  onClose,
  onSubmit,
  loading,
  defaultLeaveType = "paid",
}) => {
  const [leaveType, setLeaveType] = useState(defaultLeaveType);
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 p-8 rounded-xl min-w-[340px] shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-white">Apply Leave</h2>
        <div className="mb-3">
          <label className="block text-white mb-2">Leave Type</label>
          <select
            className="w-full rounded px-3 py-2 bg-gray-800 text-white"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            disabled={loading}
          >
            <option value="paid">Paid Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-white mb-2">Reason</label>
          <textarea
            className="w-full rounded px-3 py-2 bg-gray-800 text-white"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Reason for leave..."
            disabled={loading}
          />
        </div>
        <div className="flex gap-3 justify-end mt-1">
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold"
            onClick={() => onSubmit({ leaveType, reason })}
            disabled={loading || !leaveType}
          >
            {loading ? "Submitting..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ApplyLeaveModal;
