// api/employees.js
export const fetchEmployees = async (page = 1, search = "") => {
  try {
    const res = await fetch(
      `https://code360.pro/api/get-employee-options?page=${page}&search=${search}`
    );
    const data = await res.json();
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message || "Failed to fetch employees");
    }
  } catch (error) {
    console.error("fetchEmployees error:", error);
    throw error;
  }
};

// api/employees.js
export const fetchHierarchy = async (parent = "CEO", page = 1, search = "") => {
  const res = await fetch(
    `https://code360.pro/get-employee-hierarchy?parent=${parent}&page=${page}&search=${encodeURIComponent(search)}`
  );

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to load hierarchy");
  }

  return data;
};


// api/payroll.js

// ... existing payroll structure functions ...

