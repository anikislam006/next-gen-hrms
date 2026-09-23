"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createRecruitmentPostNextzen,
  getAllRecruitmentsNextzen,
  getJobBasedRecruitmentsNextzen,
  deleteRecruitmentNextzen,
  updateRecruitmentStatusNextzen,
  fetchCandidatesByStatusNextzen,
  fetchCandidatesByDepartmentByStatusNextzen, // Change this
  moveToInventoryNextzen,
  sendToHODReviewNextzen,
  updateApprovedToHODNextzen,
  
} from "../api/recruitment-jobs-nextzen";
import { useAuth } from "@/context/AuthContext";

/* ================= SHARED STATE ================= */
let sharedCandidates = [];
let sharedRecruitmentPagination = {
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
};
let sharedRecruitmentLoading = false;
let sharedRecruitmentError = null;
let recruitmentListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notifyRecruitment = () => {
  recruitmentListeners.forEach((listener) => listener());
};

export function useRecruitmentNextzen() {
  const [candidates, setCandidates] = useState(sharedCandidates);
  const [pagination, setPagination] = useState(sharedRecruitmentPagination);
  const [loading, setLoading] = useState(sharedRecruitmentLoading);
  const [error, setError] = useState(sharedRecruitmentError);
  const { UserAllDetails } = useAuth();

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setCandidates([...sharedCandidates]);
      setPagination({ ...sharedRecruitmentPagination });
      setLoading(sharedRecruitmentLoading);
      setError(sharedRecruitmentError);
    };

    recruitmentListeners.push(listener);
    listener(); // initial sync

    return () => {
      recruitmentListeners = recruitmentListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= FETCH ALL CANDIDATES ================= */
/* ================= FETCH ALL CANDIDATES ================= */
const fetchAllCandidates = useCallback(async (params = {}) => {
  try {
    sharedRecruitmentLoading = true;
    notifyRecruitment();

    const result = await getAllRecruitmentsNextzen(params);

    sharedCandidates = result?.candidates || [];
    sharedRecruitmentPagination = {
      totalItems: result?.pagination?.totalItems || 0,
      totalPages: result?.pagination?.totalPages || 1,
      currentPage: result?.pagination?.currentPage || 1,
    };
    sharedRecruitmentError = null;

    // CRITICAL FIX: Return the full result object so ListedData can read metaCounts!
    return result; 
  } catch (err) {
    sharedRecruitmentError = err.message || "Failed to fetch Nextzen candidates";
    throw err;
  } finally {
    sharedRecruitmentLoading = false;
    notifyRecruitment();
  }
}, []);

  /* ================= FETCH CANDIDATES BY JOB ID ================= */
  const fetchCandidatesByJob = useCallback(async (jobId, params = {}) => {
    if (!jobId) return { candidates: [] };

    try {
      sharedRecruitmentLoading = true;
      notifyRecruitment();

      const result = await getJobBasedRecruitmentsNextzen(jobId, params);

      sharedCandidates = result?.candidates || [];
      sharedRecruitmentPagination = {
        totalItems: result?.pagination?.totalItems || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1,
      };
      sharedRecruitmentError = null;

      return result;
    } catch (err) {
      sharedRecruitmentError = err.message;
      throw err;
    } finally {
      sharedRecruitmentLoading = false;
      notifyRecruitment();
    }
  }, []);

  /* ================= STATUS-WISE PAGINATION FETCH ================= */
  const fetchByStatus = useCallback(
  async (status, params = {}) => {
    try {
      const result = await fetchCandidatesByStatusNextzen(status, params);
      return {
        candidates: result.candidates || [],
        hasNextPage: result.hasNextPage || false,
        total: result.total || 0,
      };
    } catch (err) {
      console.error(`Nextzen error fetching stage ${status}:`, err);
      return { candidates: [], hasNextPage: false, total: 0 };
    }
  },
  []
);

/* ================= STATUS-WISE PAGINATION FETCH (Department Specific) ================= */
  const fetchByStatusByDepartment = useCallback(
    async (status, params = {}) => {
      try {
        // Ensure we have a department from the Auth context
        const userDept = UserAllDetails?.department;

        if (!userDept) {
          console.warn("No department found for the current user.");
          return { candidates: [], hasNextPage: false, total: 0 };
        }

        // Call the new API function using status and department
        const result = await fetchCandidatesByDepartmentByStatusNextzen(
          status,
          userDept,
          params
        );

        return {
          candidates: result.candidates || [],
          hasNextPage: result.hasNextPage || false,
          total: result.total || 0,
        };
      } catch (err) {
        console.error(`Nextzen error fetching stage ${status} for department ${UserAllDetails?.department}:`, err);
        return { candidates: [], hasNextPage: false, total: 0 };
      }
    },
    [UserAllDetails?.department] // Dependency added to re-sync if user changes
  );


  /* ================= SUBMIT CANDIDATE ================= */
  const submitCandidate = useCallback(
    async (recruitmentData) => {
      try {
        sharedRecruitmentLoading = true;
        notifyRecruitment();

        const response = await createRecruitmentPostNextzen(recruitmentData);
        await fetchAllCandidates({ page: 1 });

        return response;
      } catch (err) {
        sharedRecruitmentError = err.message || "Failed to add Nextzen candidate";
        throw err;
      } finally {
        sharedRecruitmentLoading = false;
        notifyRecruitment();
      }
    },
    [fetchAllCandidates]
  );

  /* ================= DELETE CANDIDATE ================= */
  const removeCandidate = useCallback(
    async (id) => {
      const previousCandidates = [...sharedCandidates];

      try {
        // Optimistic remove
        sharedCandidates = sharedCandidates.filter((c) => c._id !== id);
        notifyRecruitment();

        await deleteRecruitmentNextzen(id);

        if (sharedRecruitmentPagination.totalItems > 0) {
          sharedRecruitmentPagination.totalItems -= 1;
          notifyRecruitment();
        }
      } catch (err) {
        sharedCandidates = previousCandidates;
        sharedRecruitmentError = err.message || "Failed to delete Nextzen candidate";
        notifyRecruitment();
        await fetchAllCandidates();
      }
    },
    [fetchAllCandidates]
  );

  /* ================= CHANGE CANDIDATE STATUS ================= */
  const changeCandidateStatus = useCallback(
    async (id, newStatus, jobId = null, metadata = {}) => {
      // Build the action log — captures who did what and when
      const actionLog = {
        updatedBy: {
          name: UserAllDetails?.fullName,
          email: UserAllDetails?.email,
          role: UserAllDetails?.role,
          designation: UserAllDetails?.designation || "N/A",
        },
        updatedAt: new Date().toISOString(),
        previousMetadata: metadata,
      };

      try {
        sharedRecruitmentLoading = true;
        notifyRecruitment();

        await updateRecruitmentStatusNextzen(id, newStatus, {
          ...metadata,
          ...actionLog,
        });

        // Optimistic UI update
        sharedCandidates = sharedCandidates.map((candidate) =>
          candidate._id === id
            ? {
                ...candidate,
                status: newStatus,
                lastAction: actionLog,
                ...metadata,
              }
            : candidate
        );

        window.dispatchEvent(new CustomEvent("refresh-kanban-board"));
        notifyRecruitment();

        return { success: true };
      } catch (err) {
        sharedRecruitmentError = err.message || "Failed to update Nextzen status";
        notifyRecruitment();
        throw err;
      } finally {
        sharedRecruitmentLoading = false;
        notifyRecruitment();
      }
    },
    [ UserAllDetails]
  );

  /* ================= SEND TO INVENTORY ================= */
  const sendToInventory = useCallback(async (id, inventoryData) => {
    try {
      sharedRecruitmentLoading = true;
      notifyRecruitment();

      await moveToInventoryNextzen(id, inventoryData);

      // Optimistic UI update
      sharedCandidates = sharedCandidates.map((candidate) =>
        candidate._id === id
          ? {
              ...candidate,
              status: "Inventory",
              inventoryDetails: {
                category: inventoryData.reasonCategory,
                reason: inventoryData.detailedReason,
                movedAt: new Date(),
              },
            }
          : candidate
      );

      window.dispatchEvent(new CustomEvent("refresh-kanban-board"));
      notifyRecruitment();

      return { success: true };
    } catch (err) {
      sharedRecruitmentError = err.message || "Failed to move to inventory";
      notifyRecruitment();
      throw err;
    } finally {
      sharedRecruitmentLoading = false;
      notifyRecruitment();
    }
  }, []);

  const sendToHOD = useCallback(async (id) => {
  try {
    sharedRecruitmentLoading = true;
    notifyRecruitment();

    // Construct the payload based on your requirements
    const reviewPayload = {
      assessmentFlow: [
        {
          status: "sent_to_review",
          ReqReviewName: UserAllDetails?.fullName || "System",
          ReqEmail: UserAllDetails?.email || "",
          ReqRole: UserAllDetails?.role || "",
          ReqDesignation: UserAllDetails?.designation || "",
          ReqDepartment: UserAllDetails?.department || "",
          at: new Date().toISOString(),
        }
      ],
      // We usually also update the main status to reflect it's under review
    };

    await sendToHODReviewNextzen(id, reviewPayload);

    // Optimistic UI update
    sharedCandidates = sharedCandidates.map((candidate) =>
      candidate._id === id
        ? { ...candidate, ...reviewPayload }
        : candidate
    );

    window.dispatchEvent(new CustomEvent("refresh-kanban-board"));
    notifyRecruitment();

    return { success: true };
  } catch (err) {
    sharedRecruitmentError = err.message || "Failed to send to HOD";
    notifyRecruitment();
    throw err;
  } finally {
    sharedRecruitmentLoading = false;
    notifyRecruitment();
  }
}, [UserAllDetails]);

  const sendToHODToConfirmResult = useCallback(async (id) => {
  try {
    sharedRecruitmentLoading = true;
    notifyRecruitment();

    // Construct the payload based on your requirements
    const reviewPayload = {
      assessmentFlow: [
        {
          status: "sent_to_review_confirm_result",
          ReqReviewName: UserAllDetails?.fullName || "System",
          ReqEmail: UserAllDetails?.email || "",
          ReqRole: UserAllDetails?.role || "",
          ReqDesignation: UserAllDetails?.designation || "",
          ReqDepartment: UserAllDetails?.department || "",
          at: new Date().toISOString(),
        }
      ],
      // We usually also update the main status to reflect it's under review
    };

    await sendToHODReviewNextzen(id, reviewPayload);

    // Optimistic UI update
    sharedCandidates = sharedCandidates.map((candidate) =>
      candidate._id === id
        ? { ...candidate, ...reviewPayload }
        : candidate
    );

    window.dispatchEvent(new CustomEvent("refresh-kanban-board"));
    notifyRecruitment();

    return { success: true };
  } catch (err) {
    sharedRecruitmentError = err.message || "Failed to send to HOD";
    notifyRecruitment();
    throw err;
  } finally {
    sharedRecruitmentLoading = false;
    notifyRecruitment();
  }
}, [UserAllDetails]);

const assessmentResultFinalConfirm = useCallback(async (id) => {
  try {
    sharedRecruitmentLoading = true;
    notifyRecruitment();

    // Construct the payload based on your requirements
    const reviewPayload = {
      assessmentFlow: [
        {
          status: "assessment_result_final_confirm",
          ReqReviewName: UserAllDetails?.fullName || "System",
          ReqEmail: UserAllDetails?.email || "",
          ReqRole: UserAllDetails?.role || "",
          ReqDesignation: UserAllDetails?.designation || "",
          ReqDepartment: UserAllDetails?.department || "",
          at: new Date().toISOString(),
        }
      ],
      // We usually also update the main status to reflect it's under review
    };

    await sendToHODReviewNextzen(id, reviewPayload);

    // Optimistic UI update
    sharedCandidates = sharedCandidates.map((candidate) =>
      candidate._id === id
        ? { ...candidate, ...reviewPayload }
        : candidate
    );

    window.dispatchEvent(new CustomEvent("refresh-kanban-board"));
    notifyRecruitment();

    return { success: true };
  } catch (err) {
    sharedRecruitmentError = err.message || "Failed to send to HOD";
    notifyRecruitment();
    throw err;
  } finally {
    sharedRecruitmentLoading = false;
    notifyRecruitment();
  }
}, [UserAllDetails]);

/* ================= APPROVE & REQUEST ASSESSMENT (HOD TO CTO) ================= */
  const approveAndRequestAssessment = useCallback(async (id, hodQuestions) => {
    try {
      sharedRecruitmentLoading = true;
      notifyRecruitment();

      const approvalEntry = {
        status: "approved_req_assessment",
        approvedBy: UserAllDetails?.fullName || "System",
        at: new Date().toISOString(),
      };

      // We send the whole updated array or just the entry depending on your backend logic
      // Based on your app.put example, we send the entry inside an array
      const payload = {
        assessmentFlow: [approvalEntry],
        hodQuestions: hodQuestions // Added the extra field for tasks/questions
      };

      await updateApprovedToHODNextzen(id, payload);

      sharedCandidates = sharedCandidates.map((c) =>
        c._id === id ? { 
          ...c, 
          assessmentFlow: c.assessmentFlow ? [...c.assessmentFlow, approvalEntry] : [approvalEntry],
          hodQuestions 
        } : c
      );

      window.dispatchEvent(new CustomEvent("refresh-kanban-board"));
      return { success: true };
    } catch (err) {
      sharedRecruitmentError = err.message;
      throw err;
    } finally {
      sharedRecruitmentLoading = false;
      notifyRecruitment();
    }
  }, [UserAllDetails]);

  return {
    candidates,
    pagination,
    loading,
    error,
    fetchAllCandidates,
    fetchCandidatesByJob,
    fetchByStatusByDepartment,
    fetchByStatus,
    submitCandidate,
    removeCandidate,
    changeCandidateStatus,
    sendToInventory,
    sendToHOD,
    sendToHODToConfirmResult,
    assessmentResultFinalConfirm,
    approveAndRequestAssessment
  };
}