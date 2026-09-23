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

// Writes now go to the same Supabase `departments` table fetchDepartments
// reads from (previously these hit the old code360 backend while reads came
// from Supabase, so anything created here silently never showed up anywhere).
export const createDepartment = async (deptForm) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .insert({ name: deptForm.name, code: deptForm.code })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, data: { _id: data.id, name: data.name, code: data.code } };
  } catch (error) {
    console.error("createDepartment error:", error);
    throw error;
  }
};

export const deleteDepartment = async (departmentId) => {
  try {
    const { error } = await supabase.from("departments").delete().eq("id", departmentId);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error) {
    console.error("deleteDepartment error:", error);
    throw error;
  }
};

export const assignDepartmentHead = async (departmentId, headData) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .update({ department_head_id: headData.departmentHeadObjectId })
      .eq("id", departmentId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (error) {
    console.error("assignDepartmentHead error:", error);
    throw error;
  }
};

export const removeDepartmentHead = async (departmentId) => {
  try {
    const { error } = await supabase
      .from("departments")
      .update({ department_head_id: null })
      .eq("id", departmentId);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error) {
    console.error("removeDepartmentHead error:", error);
    throw error;
  }
};
