/**
 * Dialog Accessibility Fix Utility
 * 
 * This utility helps fix accessibility warnings for Dialog components
 * by providing standardized descriptions and proper ARIA attributes.
 */

/**
 * Default descriptions for common dialog types
 */
export const DIALOG_DESCRIPTIONS = {
  // Employee Management
  CREATE_EMPLOYEE: "Fill out the employee information form to add a new employee to the system. All required fields must be completed.",
  EDIT_EMPLOYEE: "Modify employee information. Changes will be saved automatically when you submit the form.",
  VIEW_EMPLOYEE: "View detailed employee information including personal details, salary, and employment history.",
  ASSIGN_MANAGER: "Select a manager to assign to this employee. Only administrators and HR managers can be assigned as reporting managers.",
  PASSWORD_MANAGEMENT: "Manage employee login credentials. You can view the current password or generate a new one.",

  // Leave Management
  CREATE_LEAVE_REQUEST: "Submit a new leave request by selecting dates and providing a reason. The request will be sent for approval.",
  EDIT_LEAVE_REQUEST: "Modify your leave request details. Note that some fields may not be editable if the request is already approved.",
  VIEW_LEAVE_REQUEST: "View complete leave request details including approval status and any comments from managers.",
  APPROVE_LEAVE: "Review and approve or reject this leave request. Provide comments to explain your decision.",

  // Payroll Management
  VIEW_PAYROLL: "View detailed payroll information including salary breakdown, deductions, and allowances.",
  PROCESS_PAYROLL: "Process monthly payroll for selected employees. Review all calculations before confirming.",
  EDIT_SALARY: "Modify employee salary information. Changes will take effect from the next payroll cycle.",

  // Performance Management
  CREATE_REVIEW: "Create a new performance review by setting goals and evaluation criteria.",
  VIEW_REVIEW: "View performance review details including ratings, feedback, and development plans.",
  SUBMIT_REVIEW: "Submit your performance review. Once submitted, some fields may become read-only.",

  // Expense Management
  CREATE_EXPENSE: "Submit a new expense claim with receipt details and expense category.",
  VIEW_EXPENSE: "View expense claim details including status and any approval comments.",
  APPROVE_EXPENSE: "Review and approve or reject this expense claim. Verify all supporting documents.",

  // Team Management
  CREATE_TEAM: "Create a new team by providing team details and selecting team members.",
  EDIT_TEAM: "Modify team information including team lead and member assignments.",
  VIEW_TEAM: "View team details including all members and team statistics.",

  // Admin Functions
  MANAGE_PERMISSIONS: "Assign or modify user permissions and access levels for different system modules.",
  SYSTEM_SETTINGS: "Configure system-wide settings and preferences that affect all users.",
  USER_MANAGEMENT: "Manage user accounts, roles, and access permissions across the organization.",

  // Reports
  GENERATE_REPORT: "Configure report parameters and select the data range for your custom report.",
  VIEW_REPORT: "View generated report with filtering and export options available.",
  EXPORT_DATA: "Select export format and configure data export settings.",

  // General
  CONFIRMATION: "Please confirm your action. This operation may not be reversible.",
  ERROR: "An error has occurred. Please review the details and try again.",
  SUCCESS: "Operation completed successfully. You can now proceed or close this dialog.",
  WARNING: "Please review the warning information before proceeding with this action.",
  DELETE_CONFIRMATION: "This action will permanently delete the selected item. This cannot be undone.",

  // Default fallback
  DEFAULT: "Please review the information in this dialog and take the appropriate action."
};

/**
 * Get appropriate description for dialog type
 */
export function getDialogDescription(type) {
  return DIALOG_DESCRIPTIONS[type] || DIALOG_DESCRIPTIONS.DEFAULT;
}

/**
 * Generate unique IDs for ARIA attributes
 */
export function generateDialogIds(prefix = 'dialog') {
  const id = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    titleId: `${id}-title`,
    descriptionId: `${id}-description`,
    contentId: `${id}-content`
  };
}

/**
 * Validation function to ensure dialog has proper accessibility
 */
export function validateDialogAccessibility({ title, description, children }) {
  const warnings = [];
  const errors = [];

  if (!title) {
    errors.push('Dialog is missing a title. This is required for screen readers.');
  }

  if (!description) {
    warnings.push('Dialog is missing a description. Consider adding one for better accessibility.');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Common dialog configurations for the HR system
 */
export const DIALOG_CONFIGS = {
  // Small dialogs for confirmations
  SMALL: {
    className: "max-w-md",
    size: "sm"
  },

  // Medium dialogs for forms
  MEDIUM: {
    className: "max-w-2xl",
    size: "md"
  },

  // Large dialogs for detailed views
  LARGE: {
    className: "max-w-4xl",
    size: "lg"
  },

  // Extra large for complex forms
  EXTRA_LARGE: {
    className: "max-w-6xl max-h-[90vh] overflow-y-auto",
    size: "xl"
  },

  // Full screen for reports and dashboards
  FULLSCREEN: {
    className: "max-w-[95vw] max-h-[95vh] overflow-y-auto",
    size: "fullscreen"
  }
};

/**
 * Get dialog configuration by size
 */
export function getDialogConfig(size = 'MEDIUM') {
  return DIALOG_CONFIGS[size];
}
