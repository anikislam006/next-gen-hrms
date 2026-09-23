"use client";

import { useEffect, useState } from "react";
import {
  fetchDepartments,
  createDepartment,
  deleteDepartment,
  assignDepartmentHead,
  removeDepartmentHead,
} from "../api/department";

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // ===============================
  // Fetch departments
  // ===============================
  const getDepartments = async () => {
    setLoading(true);
    try {
      const data = await fetchDepartments(currentPage, search);
      setDepartments(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDepartments();
  }, [currentPage, search]);

  // ===============================
  // Create department
  // ===============================
  const addDepartment = async (deptForm) => {
    const res = await createDepartment(deptForm);
    await getDepartments();
    return res;
  };

  // ===============================
  // Delete department
  // ===============================
  const removeDepartment = async (departmentId) => {
    const res = await deleteDepartment(departmentId);
    await getDepartments();
    return res;
  };

  // ===============================
  // Assign department head
  // ===============================
  const assignHead = async (departmentId, employee) => {
    const payload = {
      departmentHeadObjectId: employee._id,
      employeeId: employee.employeeId,
      email: employee.email,
      name: employee.fullName,
    };

    const res = await assignDepartmentHead(departmentId, payload);
    await getDepartments();
    return res;
  };

   const removeHead = async (departmentId) => {
    const res = await removeDepartmentHead(departmentId);
    await getDepartments();
    return res;
  };


  return {
    departments,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    search,
    setSearch,
    addDepartment,
    removeDepartment,
    assignHead,
    refetchDepartments: getDepartments,
    removeHead
  };
};
