// api/department.js
import { supabase } from "@/utils/supabaseClient";

// Reads from the new Supabase `departments` table. Kept the same
// {success, data: [{_id, name, code}]} shape the rest of the app already
// expects, so nothing downstream needed to change.
export const fetchDepartments = async (_page = 1, search = "") => {
  try {
    let query = supabase.from("departments").select("id, name, code").order("name");
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return {
      success: true,
      data: (data || []).map((d) => ({ _id: d.id, name: d.name, code: d.code })),
    };
  } catch (error) {
    console.error("fetchDepartments error:", error);
    throw error;
  }
};

export const createDepartment = async (deptForm) => {
  try {
    const res = await fetch("https://code360.pro/api/add-department", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deptForm),
    });
    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to create department");
  } catch (error) {
    console.error("createDepartment error:", error);
    throw error;
  }
};

export const deleteDepartment = async (departmentId) => {
  try {
    const res = await fetch("https://code360.pro/api/delete-department", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departmentId }),
    });
    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to delete department");
  } catch (error) {
    console.error("deleteDepartment error:", error);
    throw error;
  }
};

export const assignDepartmentHead = async (departmentId, headData) => {
  try {
    const res = await fetch(
      `https://code360.pro/api/add-department-head/${departmentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(headData),
      }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to assign department head");
    }

    return data;
  } catch (error) {
    console.error("assignDepartmentHead error:", error);
    throw error;
  }
};


export const removeDepartmentHead = async (departmentId) => {
  try {
    const res = await fetch(
      `https://code360.pro/api/remove-department-head/${departmentId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to remove department head");
    }

    return data;
  } catch (error) {
    console.error("removeDepartmentHead error:", error);
    throw error;
  }
};
