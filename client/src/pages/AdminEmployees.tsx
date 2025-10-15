import React, { useEffect, useState } from "react";
import {
  createEmployee,
  listEmployees,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeApi";
import { listShifts } from "../api/shiftApi";
import EmployeeReport from "./EmployeeReport";
import { Edit, Trash2 } from "lucide-react";

const roles = [
  "M.D. SIR",
  "MANAGER",
  "FRONT OFFICE",
  "Reception",
  "CHEF",
  "MAINTENANCE",
  "ROOM SERVICE",
  "HOUSE KEEPING",
];

const emptyForm = {
  name: "",
  email: "",
  age: "",
  role: roles[0],
  shift: "",
  biometric: "Pending",
  attendance: "100%",
  salary: "",
};

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]); // Fetched shifts from API
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  console.log(form, "<>?<>?<>?");
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8; // You can change this to 7 or whatever you want
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch {
      setEmployees([]);
    }
    setLoading(false);
  };

  // Fetch available shifts
  const fetchShifts = async () => {
    try {
      const shiftArr = await listShifts();
      setShifts(Array.isArray(shiftArr) ? shiftArr : []);
    } catch (err) {
      setShifts([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, []);

  // Open Add modal
  const handleShowAdd = () => {
    setForm({ ...emptyForm, shift: shifts[0]?._id || "" });
    setIsEdit(false);
    setShowModal(true);
  };

  // Open Edit modal
  const handleShowEdit = (emp: any) => {
    setForm({
      name: emp.name,
      email: emp.email,
      age: emp.age,
      role: emp.role,
      shift: emp.shiftId || emp.shift || "",
      biometric: emp.biometric,
      attendance: emp.attendance,
      salary: emp.salary,
      _id: emp._id,
    });
    setSelectedEmployee(emp);
    setIsEdit(true);
    setShowModal(true);
  };

  // Form change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prevForm) => ({
      ...prevForm,
      [e.target.name]: e.target.value,
    }));
  };

  // Add Employee submit
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createEmployee({
        ...form,
        salary: Number(form.salary),
        biometric: form.biometric,
        attendance: form.attendance,
        shiftId: form.shift,
        shift: shifts.find((s) => s._id === form.shift)?.name || "",
      });
      setShowModal(false);
      setForm(emptyForm);
      fetchEmployees();
    } catch (err) {
      setError("Error creating employee");
    }
  };

  // Edit Employee submit
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateEmployee(selectedEmployee._id, {
        ...form,
        salary: Number(form.salary),
        shiftId: form.shift,
        shift: shifts.find((s) => s._id === form.shift)?.name || "",
      });

      setShowModal(false);
      setForm(emptyForm);
      setIsEdit(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      setError("Error updating employee");
    }
  };

  // Delete Employee handler
  const handleDeleteEmployee = async (emp: any) => {
    try {
      await deleteEmployee(emp._id);
      fetchEmployees();
    } catch (error) {
      alert("Error deleting employee");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
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
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {employees.map((emp: any) => (
              <tr key={emp._id} className="hover:bg-gray-800/30">
                <td className="p-3 font-mono">{emp.empId || emp._id}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.email}</td>
                <td className="p-3">{emp.role}</td>
                <td className="p-3">{emp.shift}</td>
                <td className="p-3">{emp.biometric}</td>
                <td className="p-3">{emp.salary}</td>
                <td className="p-3 flex gap-3 items-center">
                  <button
                    onClick={() => handleShowEdit(emp)}
                    aria-label="Edit employee"
                    className="text-blue-400 hover:text-blue-600 transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEmployeeToDelete(emp);
                      setShowDeleteModal(true);
                    }}
                    aria-label="Delete employee"
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="text-center py-6 text-gray-400">Loading...</div>
        )}
        {!loading && employees.length === 0 && (
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

      {/* Add/Edit Modal */}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Age</label>
                <input
                  className="w-full p-2 rounded bg-input border-border text-white"
                  type="number"
                  name="age"
                  min="18"
                  required
                  value={form.age}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">Role</label>
                <select
                  className="w-full p-2 rounded bg-input border-border text-white"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {roles.map((role, idx) => (
                    <option key={idx} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              {/* SHIFT DROPDOWN: FROM API */}
              <div>
                <label className="block text-sm text-gray-200 mb-2">
                  Shift
                </label>
                <select
                  className="w-full p-2 rounded bg-input border-border text-white"
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  disabled={loading || shifts.length === 0}
                  required
                >
                  {shifts.map((shift: any) => (
                    <option key={shift._id} value={shift._id}>
                      {shift.name}
                    </option>
                  ))}
                  {shifts.length === 0 && (
                    <option value="">No shifts available</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-2">
                  Biometric
                </label>
                <select
                  className="w-full p-2 rounded bg-input border-border text-white"
                  name="biometric"
                  value={form.biometric}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="Registered">Registered</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              {/* 
                <div>
                  <label className="block text-sm text-gray-200 mb-2">
                    Attendance (%)
                  </label>
                  <input
                    className="w-full p-2 rounded bg-input border-border text-white"
                    type="text"
                    name="attendance"
                    value={form.attendance}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                */}
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
                  disabled={loading}
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
                    setSelectedEmployee(null);
                    setError("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-bold rounded"
                  disabled={
                    loading || !form.name || !form.email || !form.salary
                  }
                >
                  {loading
                    ? isEdit
                      ? "Saving..."
                      : "Adding..."
                    : isEdit
                    ? "Save Changes"
                    : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full text-white">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete employee{" "}
              <span className="font-bold">{employeeToDelete.name}</span>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteEmployee(employeeToDelete); // Call your delete handler
                  setShowDeleteModal(false);
                  setEmployeeToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;
