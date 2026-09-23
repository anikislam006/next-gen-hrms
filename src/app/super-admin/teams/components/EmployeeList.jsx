"use client";

import React from "react";
import { useEmployees } from "../../../hook/useEmployees";

export default function EmployeeList() {
  const {
    employees,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
  } = useEmployees();

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div className="p-5 space-y-5">
      <h1 className="text-2xl font-bold">Employees</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name, ID, email, or role..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full max-w-md"
      />

      {/* Loading state */}
      {loading && <p>Loading...</p>}

      {/* Employee List */}
      {!loading && employees.length === 0 && <p>No employees found</p>}
      {!loading && employees.length > 0 && (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Department</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id}>
                <td className="border p-2">{emp.employeeId}</td>
                <td className="border p-2">{emp.fullName}</td>
                <td className="border p-2">{emp.email}</td>
                <td className="border p-2">{emp.phone}</td>
                <td className="border p-2">{emp.department}</td>
                <td className="border p-2">{emp.employmentType}</td>
                <td className="border p-2">{emp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
