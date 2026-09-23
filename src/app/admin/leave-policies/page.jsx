"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Plus,
  Settings2,
  Trash2,
  Edit3,
  Info,
  CalendarPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Settings,
  Search,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Hook & Dialog Imports
import { useLeavePolicy } from "@/app/hook/useLeavePolicy";
import CreateLeaveTypeDialog from "./LeavePoliciesCompo/CreateLeaveTypeDialog";
import EditLeaveTypeDialog from "./LeavePoliciesCompo/EditLeaveTypeDialog";
import LeaveTypeDetailsDialog from "./LeavePoliciesCompo/LeaveTypeDetailsDialog";
import AddPolicyDialog from "./LeavePoliciesCompo/AddPolicyDialog";
import EditPolicyDialog from "./LeavePoliciesCompo/EditPolicyDialog";
import LeaveHeader from "./LeavePoliciesCompo/LeaveHeader";
import LeaveSearchBar from "./LeavePoliciesCompo/LeaveSearchBar";
import LeavePolicyTypeCard from "./LeavePoliciesCompo/LeavePolicyTypeCard";
import LeaveEmptyState from "./LeavePoliciesCompo/LeaveEmptyState";

const LeavePoliciesPage = () => {
  const {
    leavePolicies,
    detailedPolicies,
    loading,
    fetchAllLeavePolicies,
    fetchDetailedPolicies,
    removeLeavePolicy,
    removeDetailedPolicy,
    pagination,
  } = useLeavePolicy();

  // Visibility States
  const [showCreateLeave, setShowCreateLeave] = useState(false);
  const [showEditLeave, setShowEditLeave] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [showEditPolicy, setShowEditPolicy] = useState(false);

  // Data States
  const [selectedPolicy, setSelectedPolicy] = useState(null); // Parent Type
  const [selectedDetailRule, setSelectedDetailRule] = useState(null); // Specific Rule

  const [leaveForm, setLeaveForm] = useState({
    name: "",
    description: "",
    colorTag: "#3b82f6",
    isAutoAssign: false,
    isEnabled: true,
  });

  useEffect(() => {
    fetchAllLeavePolicies({ page: 1, limit: 12 });
    fetchDetailedPolicies();
  }, [fetchAllLeavePolicies, fetchDetailedPolicies]);

  const handleViewDetails = (policy) => {
    setSelectedPolicy(policy);
    setShowDetails(true);
  };

  const handleEditClick = (e, policy) => {
    e.stopPropagation();
    setSelectedPolicy(policy);
    setShowEditLeave(true);
  };

  const handleEditDetailRule = (e, rule) => {
    e.stopPropagation();
    setSelectedDetailRule(rule);
    setShowEditPolicy(true);
  };

  const handleAddPolicyClick = (e, policy) => {
    if (e) e.stopPropagation();
    setSelectedPolicy(policy);
    setShowAddPolicy(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this leave policy?")) {
      try {
        await removeLeavePolicy(id);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleDeleteDetailRule = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this specific rule?")) {
      try {
        await removeDetailedPolicy(id);
      } catch (error) {
        alert("Failed to delete rule: " + error.message);
      }
    }
  };

  const getRulesForType = (typeId) => {
    return detailedPolicies.filter((p) => p.parentPolicyTypeId === typeId);
  };

  // Inside LeavePoliciesPage component
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Fetch main categories with search
      fetchAllLeavePolicies({
        page: 1,
        limit: 12,
        search: searchTerm,
      });

      // Also search through the detailed rules
      fetchDetailedPolicies(searchTerm);
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchAllLeavePolicies, fetchDetailedPolicies]);

  return (
    <div className="space-y-8 p-5">
      <LeaveHeader onCreateClick={() => setShowCreateLeave(true)} />
      <LeaveSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onFilterClick={() => console.log("Filter opened")}
        onExportClick={() => console.log("Exporting data...")}
      />
      {loading && leavePolicies.length === 0 ? (
        <LeaveEmptyState
          loading={loading}
          searchTerm={searchTerm}
          onCreateClick={() => setShowCreateLeave(true)}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
          {leavePolicies.map((policy) => (
            <LeavePolicyTypeCard
              key={policy._id}
              policy={policy}
              specificRules={getRulesForType(policy._id)}
              onViewDetails={handleViewDetails}
              onEditType={handleEditClick}
              onDeleteType={handleDelete}
              onAddRule={handleAddPolicyClick}
              onEditRule={handleEditDetailRule}
              onDeleteRule={handleDeleteDetailRule}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateLeaveTypeDialog
        showCreateLeave={showCreateLeave}
        setShowCreateLeave={setShowCreateLeave}
        leaveForm={leaveForm}
        setLeaveForm={setLeaveForm}
      />
      {selectedPolicy && (
        <>
          <EditLeaveTypeDialog
            showEditLeave={showEditLeave}
            setShowEditLeave={setShowEditLeave}
            editForm={selectedPolicy}
            setEditForm={setSelectedPolicy}
          />
          <LeaveTypeDetailsDialog
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            selectedPolicy={selectedPolicy}
          />
          <AddPolicyDialog
            showAddPolicy={showAddPolicy}
            setShowAddPolicy={setShowAddPolicy}
            selectedPolicy={selectedPolicy}
          />
        </>
      )}
      {selectedDetailRule && (
        <EditPolicyDialog
          showEditPolicy={showEditPolicy}
          setShowEditPolicy={setShowEditPolicy}
          ruleToEdit={selectedDetailRule}
        />
      )}
    </div>
  );
};

export default LeavePoliciesPage;
