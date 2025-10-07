import React, { useState } from "react";
import EmployeeReport from "./EmployeeReport";

const initialEmployees = [
  {
    id: "EMP001",
    name: "Amit Sharma",
    email: "amit@hotel.com",
    role: "Waiter",
    shift: "Morning",
    biometric: "Registered",
    attendance: "98%",
    salary: 15000,
  },
  {
    id: "EMP002",
    name: "Priya Singh",
    email: "priya@hotel.com",
    role: "Receptionist",
    shift: "Afternoon",
    biometric: "Pending",
    attendance: "89%",
    salary: 25000,
  },
  {
    id: "EMP003",
    name: "Rakesh Jain",
    email: "rakesh@hotel.com",
    role: "Cook",
    shift: "Evening",
    biometric: "Registered",
    attendance: "95%",
    salary: 30000,
  },
];

const roles = ["Waiter", "Cook", "Receptionist", "Housekeeping", "Manager"];
const shifts = ["Morning", "Afternoon", "Evening", "Night"];

const emptyForm = {
  name: "",
  email: "",
  role: roles[0],
  shift: shifts[0],
  biometric: "Pending",
  attendance: "100%",
};

const AdminEmployees = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Add/Edit modal state
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  // Open Add modal
  const handleShowAdd = () => {
    setForm(emptyForm);
    setIsEdit(false);
    setShowModal(true);
  };

  // Open Edit modal
  const handleShowEdit = (emp) => {
    setForm({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      shift: emp.shift,
      biometric: emp.biometric,
      attendance: emp.attendance,
      salary: emp.salary,
    });
    setSelectedEmployee(emp);
    setIsEdit(true);
    setShowModal(true);
  };

  // Handle input in modal form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add new employee
  const handleAddEmployee = (e) => {
    e.preventDefault();
    const newId = "EMP" + (employees.length + 1).toString().padStart(3, "0");
    setEmployees([...employees, { ...form, id: newId }]);
    setShowModal(false);
    setForm(emptyForm);
  };

  // Edit/save employee
  const handleEditEmployee = (e) => {
    e.preventDefault();
    setEmployees(
      employees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, ...form } : emp
      )
    );
    setShowModal(false);
    setForm(emptyForm);
    setIsEdit(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Employees</h2>
        <button
          className="bg-primary text-white font-semibold px-4 py-2 rounded-lg shadow"
          onClick={handleShowAdd}
        >
          + Add Employee
        </button>
      </div>
      <div className="overflow-x-auto bg-gray-900 rounded-xl shadow border border-blue-700/20">
        <table className="min-w-full divide-y divide-blue-700/50">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Shift</th>
              <th className="p-3">Biometric</th>
              <th className="p-3">Salary</th>
              <th className="p-3">Attendance</th>
              <th className="p-3">View report</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-800/30">
                <td className="p-3 font-mono">{emp.id}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.email}</td>
                <td className="p-3">{emp.role}</td>
                <td className="p-3">{emp.shift}</td>
                <td className="p-3">{emp.biometric}</td>
                <td className="p-3">{emp.salary || "-"}</td>
                <td className="p-3">{emp.attendance}</td>
                <td className="p-3">
                  <button
                    className="text-xs text-green-400 underline"
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setShowReport(true);
                    }}
                  >
                    View Report
                  </button>
                </td>
                <td className="p-3">
                  <button
                    className="text-xs text-blue-400 underline"
                    onClick={() => handleShowEdit(emp)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            No employees yet.
          </div>
        )}
        {showReport && selectedEmployee && (
          <EmployeeReport
            employee={selectedEmployee}
            salary={selectedEmployee.salary}
            onClose={() => setShowReport(false)}
          />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-md w-full border border-primary/30">
            <h3 className="text-xl font-bold mb-4 text-white">
              {isEdit ? "Edit Employee" : "Add New Employee"}
            </h3>
            <form
              className="space-y-4"
              onSubmit={isEdit ? handleEditEmployee : handleAddEmployee}
            >
              <div>
                <label className="block text-sm text-gray-200 mb-2">
                  Full Name
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
                  Email
                </label>
                <input
                  className="w-full p-2 rounded bg-input border-border text-white"
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Role</label>
                <select
                  className="w-full p-2 rounded bg-input border-border text-white"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  {roles.map((role, idx) => (
                    <option key={idx} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">
                  Shift
                </label>
                <select
                  className="w-full p-2 rounded bg-input border-border text-white"
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                >
                  {shifts.map((shift, idx) => (
                    <option key={idx} value={shift}>
                      {shift}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">
                  Salary (₹ per month)
                </label>
                <input
                  className="w-full p-2 rounded bg-input border-border text-white"
                  type="number"
                  name="salary"
                  min="0"
                  required
                  value={form.salary}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded"
                  onClick={() => {
                    setShowModal(false);
                    setIsEdit(false);
                    setForm(emptyForm);
                    setSelectedEmployee(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-bold rounded"
                >
                  {isEdit ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
