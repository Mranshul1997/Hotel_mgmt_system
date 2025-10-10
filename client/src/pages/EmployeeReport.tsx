import React, { useState } from "react";
import jsPDF from "jspdf";
import {
  getSalaryPerMinute,
  getLateMinutes,
  getOTMinutes,
  round2,
} from "../utils/payroll";

// --- Demo Data: You should fetch these in production from API ---
const mockAttendance = [
  {
    date: "2025-09-01",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    checkIn: "09:06",
    checkOut: "19:06",
  },
  {
    date: "2025-10-03",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    checkIn: "09:11",
    checkOut: "18:45",
  },
  {
    date: "2025-10-04",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    checkIn: "09:04",
    checkOut: "18:15",
  },
  {
    date: "2025-10-05",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    checkIn: "09:15",
    checkOut: "18:34",
  },
  {
    date: "2025-08-01",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    checkIn: "09:06",
    checkOut: "19:06",
  },
  {
    date: "2025-06-01",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    checkIn: "09:06",
    checkOut: "19:06",
  },
  {
    date: "2025-05-01",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    checkIn: "09:06",
    checkOut: "19:06",
  },
  {
    date: "2025-04-02",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    checkIn: "09:00",
    checkOut: "18:00",
  },
];

// --- Helper functions ---
function getMonthOptions(records) {
  const months = {};
  records.forEach((rec) => {
    const d = new Date(rec.date);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const label = `${d.toLocaleString("default", {
      month: "long",
    })} ${d.getFullYear()}`;
    months[key] = label;
  });
  // Add "All" option at start
  const finalArr = [
    { value: "all", label: "All" },
    ...Object.entries(months).map(([val, label]) => ({ value: val, label })),
  ];
  return finalArr;
}

function filterAttendanceByMonth(records, monthValue) {
  if (monthValue === "all") return records;
  return records.filter((rec) => {
    const d = new Date(rec.date);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    return key === monthValue;
  });
}

function filterByWeekly(records) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const grouped = {};
  records.forEach((r) => {
    const d = new Date(r.date);
    const dayOfWk = days[d.getDay()];
    if (!grouped[dayOfWk]) grouped[dayOfWk] = [];
    grouped[dayOfWk].push(r);
  });
  return Object.entries(grouped).map(([day, recs]) => {
    let late = 0,
      ot = 0,
      lateDed = 0,
      otPay = 0,
      netDay = 0;
    recs.forEach((r) => {
      late += r.lateMins;
      ot += r.otMins;
      lateDed += r.lateDed;
      otPay += r.otPay;
      netDay += r.netDay;
    });
    return {
      date: day,
      checkIn: "-",
      checkOut: "-",
      lateMins: late,
      otMins: ot,
      lateDed: round2(lateDed),
      otPay: round2(otPay),
      netDay: round2(netDay),
    };
  });
}

function downloadCSV(data, employeeName, label) {
  const headers = [
    "Date",
    "Check-In",
    "Check-Out",
    "Late Mins",
    "OT Mins",
    "Late Deduction",
    "OT Add",
    "Net Day Salary",
  ];
  const rows = data.map((item) => [
    item.date,
    item.checkIn,
    item.checkOut,
    item.lateMins,
    item.otMins,
    item.lateDed,
    item.otPay,
    item.netDay,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${employeeName}_attendance_report_${label}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

function downloadPDF(data, employeeName, label) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Attendance Report for ${employeeName} (${label})`, 10, 15);
  doc.setFontSize(10);
  const headers = [
    "Date",
    "Check-In",
    "Check-Out",
    "Late (min)",
    "OT (min)",
    "Late Deduction",
    "OT Add",
    "Net Salary",
  ];
  const rows = data.map((d) => [
    d.date,
    d.checkIn,
    d.checkOut,
    d.lateMins,
    d.otMins,
    d.lateDed,
    d.otPay,
    d.netDay,
  ]);
  let y = 25;
  const lineHeight = 6;
  doc.text(headers.join(" | "), 10, y);
  y += lineHeight;
  rows.forEach((row) => {
    doc.text(row.join(" | "), 10, y);
    y += lineHeight;
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });
  doc.save(`${employeeName}_attendance_report_${label}.pdf`);
}

const EmployeeReport = ({ employee, onClose, salary = 15000 }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    () => getMonthOptions(mockAttendance)[0]?.value || "all"
  );
  const [mode, setMode] = useState("daily"); // "daily" or "weekly"
  const [exportFormat, setExportFormat] = useState("csv");

  // Salary and OT
  const salaryPerMinute = getSalaryPerMinute(salary);
  const otRate = salaryPerMinute * 1.5;

  // Filter attendance by month
  const monthRecords = filterAttendanceByMonth(
    mockAttendance,
    selectedMonth
  ).map((rec) => {
    const lateMins = getLateMinutes(rec.checkIn, rec.shiftStart, 5);
    const otMins = getOTMinutes(rec.checkOut, rec.shiftEnd, 30);
    const lateDed = round2(lateMins * salaryPerMinute);
    const otPay = round2(otMins * otRate);
    const netDay = round2(salaryPerMinute * 9 * 60 - lateDed + otPay);
    return { ...rec, lateMins, otMins, lateDed, otPay, netDay };
  });

  let showRows = monthRecords;
  if (mode === "weekly") {
    showRows = filterByWeekly(monthRecords);
  }

  const label =
    (selectedMonth === "all"
      ? "All"
      : `${
          getMonthOptions(mockAttendance).find(
            (opt) => opt.value === selectedMonth
          )?.label || ""
        }`) + (mode === "weekly" ? "_Weekly" : "_Daily");

  // Totals
  const totals = showRows.reduce(
    (tot, row) => ({
      days: tot.days + 1,
      lateMins: tot.lateMins + row.lateMins,
      otMins: tot.otMins + row.otMins,
      lateDed: tot.lateDed + row.lateDed,
      otPay: tot.otPay + row.otPay,
      netSalary: tot.netSalary + row.netDay,
    }),
    { days: 0, lateMins: 0, otMins: 0, lateDed: 0, otPay: 0, netSalary: 0 }
  );

  const handleDownload = () => {
    if (exportFormat === "csv") {
      downloadCSV(showRows, employee.name, label);
    } else if (exportFormat === "pdf") {
      downloadPDF(showRows, employee.name, label);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-gray-900 rounded-xl p-10 max-w-5xl w-full shadow-2xl border-2 border-blue-800"
        style={{
          minHeight: 650,
          maxHeight: 750,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Salary & Attendance Report — {employee.name}
          </h2>
          <button
            className="px-4 py-2 rounded text-white font-mono bg-red-600 font-bold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {/* Month Selector and Filters */}
        <div className="mb-6 flex gap-3 flex-wrap items-center">
          <label className="text-white font-medium mr-2">Select Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded px-3 py-2 bg-gray-800 text-white font-bold"
          >
            {getMonthOptions(mockAttendance).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            className={`px-4 py-2 rounded font-bold ${
              mode === "daily"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-300"
            }`}
            onClick={() => setMode("daily")}
          >
            Daily
          </button>
          {/* <button
            className={`px-4 py-2 rounded font-bold ${
              mode === "weekly"
                ? "bg-primary text-white"
                : "bg-gray-800 text-gray-300"
            }`}
            onClick={() => setMode("weekly")}
          >
            Weekly
          </button> */}

          <select
            className="ml-auto py-2 px-3 rounded bg-gray-800 text-white font-bold"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="csv">Download CSV</option>
            <option value="pdf">Download PDF</option>
          </select>
          <button
            className="ml-2 bg-green-600 px-6 py-2 rounded text-white font-bold"
            onClick={handleDownload}
          >
            Download Report
          </button>
        </div>
        {/* Attendance Table (Scrollable, fixed height) */}
        <div
          className="overflow-x-auto mb-6"
          style={{
            minHeight: 260,
            maxHeight: 260,
            overflowY: "auto",
            borderRadius: "0.5rem",
            background: "#23272f",
            border: "1px solid rgba(48,100,255,0.08)",
          }}
        >
          <table className="min-w-full divide-y divide-blue-700/50 text-base">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-sm">
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  {" "}
                  {/* add bg + sticky + z-10 */}
                  {mode === "weekly" ? "Day" : "Date"}
                </th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">Check-In</th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">Check-Out</th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  Late (min)
                </th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">OT (min)</th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  Late Deduction (₹)
                </th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  OT Add (₹)
                </th>
                <th className="p-3 bg-gray-900 sticky top-0 z-10">
                  Net Day Salary (₹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {showRows.map((rec, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30">
                  <td className="p-3 font-mono">{rec.date}</td>
                  <td className="p-3">{rec.checkIn}</td>
                  <td className="p-3">{rec.checkOut}</td>
                  <td className="p-3">{rec.lateMins || 0}</td>
                  <td className="p-3">{rec.otMins || 0}</td>
                  <td className="p-3 text-red-400">{rec.lateDed || 0}</td>
                  <td className="p-3 text-green-400">{rec.otPay || 0}</td>
                  <td className="p-3 font-bold text-blue-400">
                    {rec.netDay || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Summary Section */}
        <div className="bg-gray-800 rounded p-6 grid grid-cols-3 md:grid-cols-6 gap-6 text-white text-center mb-2 flex-shrink-0">
          <div>
            <div className="text-gray-400 text-sm">Days Counted</div>
            <div className="text-3xl font-bold">{totals.days}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Total Late (min)</div>
            <div className="text-3xl font-bold">{totals.lateMins}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Total Overtime (min)</div>
            <div className="text-3xl font-bold">{totals.otMins}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Late Deduction (₹)</div>
            <div className="text-3xl font-bold text-red-400">
              {round2(totals.lateDed)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">OT Addition (₹)</div>
            <div className="text-3xl font-bold text-green-400">
              {round2(totals.otPay)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Net Salary (₹)</div>
            <div className="text-3xl font-bold text-blue-400">
              {round2(totals.netSalary)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReport;
