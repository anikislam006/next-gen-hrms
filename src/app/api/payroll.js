const API_BASE_URL = "https://code360.pro";

/**
 * 1. Bulk Create/Upsert Payroll Records
 * Matches: app.post("/payroll-record")
 */
export const createPayrollRecords = async (payrollData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payroll-record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payrollData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to process payroll");
    return data;
  } catch (error) {
    console.error("Bulk Payroll Post Error:", error);
    throw error;
  }
};

/**
 * 2. Fetch Paginated Payroll History (Processed Records)
 * Matches: app.get("/payroll-records")
 */
/**
 * Fetch Paginated & Filtered Payroll History
 * Matches: app.get("/payroll-records")
 */
export const fetchProcessedPayrollRecords = async ({ 
  page = 1, 
  limit = 10, 
  email = "", 
  status = "", 
  date = "" 
}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(email && { email }),
      ...(status && { status }),
      ...(date && { date })
    }).toString();

    const response = await fetch(`${API_BASE_URL}/payroll-records?${query}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch records");
    return data;
  } catch (error) {
    console.error("Fetch Payroll Records Error:", error);
    throw error;
  }
};

/**
 * 3. Fetch History for a Specific Employee by Email
 * Matches: app.get("/payroll-record-email/:email")
 */
export const fetchPayrollRecordsByEmail = async (email) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/payroll-record-email/${encodeURIComponent(email)}`
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "No records found");
    return data;
  } catch (error) {
    console.error("Fetch Email Records Error:", error);
    throw error;
  }
};

/**
 * 4. Update the status of a specific payroll record (e.g., Pending -> Paid)
 * Matches: app.patch("/payroll-record/status/:id")
 */
export const updatePayrollStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payroll-record/status/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update status");
    return data;
  } catch (error) {
    console.error("Update Status Error:", error);
    throw error;
  }
};

/**
 * 5. Delete a specific Processed Payroll Record
 * Matches: app.delete("/payroll-record/:id")
 */
export const deletePayrollRecord = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payroll-record/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete record");
    return data;
  } catch (error) {
    console.error("Delete Record Error:", error);
    throw error;
  }
};

// --- SETTINGS & STRUCTURES ---

export const fetchSettingSalaries = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/setting-salary?page=${page}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch settings");
    return data;
  } catch (error) {
    console.error("Fetch Setting Error:", error);
    throw error;
  }
};

export const createSettingSalary = async (salaryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/setting-salary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(salaryData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create setting");
    return data;
  } catch (error) {
    console.error("Create Setting Error:", error);
    throw error;
  }
};

export const fetchSettingByEmail = async (email) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/setting-salary-by-email?email=${encodeURIComponent(email)}`
    );
    const result = await response.json();
    if (!response.ok) return { success: false, message: result.message };
    return result; 
  } catch (error) {
    console.error("Fetch by Email Error:", error);
    return { success: false, message: error.message };
  }
};

export const fetchEmployeePayroll = async ({ 
  page = 1, 
  search = "", 
  department = "All", 
  employmentType = "Total" 
}) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(), search, department, employmentType
    }).toString();

    const res = await fetch(`${API_BASE_URL}/get-employee-payroll?${query}`);
    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to fetch employee payroll");
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchPayrollStructures = async (page = 1, search = "") => {
  const response = await fetch(`${API_BASE_URL}/payroll-structures?page=${page}&search=${search}`);
  if (!response.ok) throw new Error("Failed to fetch payroll structures");
  return response.json();
};

export const deletePayrollStructure = async (id) => {
  const response = await fetch(`${API_BASE_URL}/payroll-structure/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete structure");
  return data;
};

/**
 * Fetch high-level payroll management statistics
 * Matches: app.get("/payroll-management-count")
 */
export const fetchPayrollManagementStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payroll-management-count`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch stats");
    return data;
  } catch (error) {
    console.error("Stats API Error:", error);
    throw error;
  }
};

/**
 * 6. Create/Add a new Payroll Structure
 * Matches backend: app.post("/add-payroll-structure")
 */
export const createPayrollStructure = async (structureData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/add-payroll-structure`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(structureData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handles 400 (Validation), 409 (Duplicate), and 500 (Server Error)
      throw new Error(data.message || "Failed to create payroll structure");
    }

    return data;
  } catch (error) {
    console.error("Create Payroll Structure API Error:", error);
    throw error;
  }
};