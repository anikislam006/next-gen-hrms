'use client';
import React, { useState } from "react";

const departments = [
  "Human Resources",
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
];

const employmentTypes = ["Permanent", "Contract", "Probation"];

const OnboardingRequestForm = () => {
const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  department: "",
  designation: "",
  joiningDate: "",
  employmentType: "",
  grossSalary: "",
  reportingManagerDept: "",
});

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const res = await fetch("https://code360.pro/api/onboard-req", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong");

    setMessage("✅ Onboarding request submitted successfully!");
    setFormData({
      fullName: "",
      email: "",
      department: "",
      designation: "",
      joiningDate: "",
      employmentType: "",
      grossSalary: "",
      reportingManagerDept: "",
    });
  } catch (err) {
    setMessage(`❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Employee Onboarding Request
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium mb-1">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Employment Type</label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Type</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Gross Salary */}
          <div>
            <label className="block text-sm font-medium mb-1">Gross Salary</label>
            <input
              type="number"
              name="grossSalary"
              value={formData.grossSalary}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Reporting Manager Department */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Reporting Manager Department
            </label>
            <select
              name="reportingManagerDept"
              value={formData.reportingManagerDept}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default OnboardingRequestForm;
