// src/app/api/notification.js
// Notifications, backed by Supabase (notifications table). Replaces the old
// code360.pro + socket.io backend, which is being retired along with the
// rest of the Mongo/Express API.
//
// The `notifications` table only stores { id, recipient_id, message, type,
// status, created_at } — no title/link columns — so this layer derives a
// human title and an in-app link from `type`, keeping the shape the existing
// NotificationBell UI already expects ({ _id, title, message, status,
// createdAt, link }).
import { supabase } from "@/utils/supabaseClient";

// role: the current signed-in user's role, so a milestone notification links
// to the right portal's Reports page for whoever is reading it.
function titleAndLinkForType(type, role) {
  const reportsPath = role === "SuperAdmin" ? "/super-admin/reports" : "/admin/reports";
  switch (type) {
    case "milestone_6month":
      return { title: "6-Month Probation Milestone", link: reportsPath };
    case "milestone_1year":
      return { title: "1-Year Work Anniversary", link: reportsPath };
    default:
      return { title: "Notification", link: "#" };
  }
}

function toBellShape(row, role) {
  const { title, link } = titleAndLinkForType(row.type, role);
  return {
    _id: row.id,
    title,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    link,
  };
}

export const notificationApi = {
  // Fetch this user's notification history (most recent first).
  getNotifications: async (recipientId, role) => {
    if (!recipientId) return [];
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data || []).map((row) => toBellShape(row, role));
  },

  // Mark one as read
  markAsRead: async (notificationId) => {
    const { error } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("id", notificationId);
    if (error) throw error;
    return { success: true };
  },

  // Mark all as read
  markAllRead: async (recipientId) => {
    if (!recipientId) return { success: false };
    const { error } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("recipient_id", recipientId)
      .eq("status", "unread");
    if (error) throw error;
    return { success: true };
  },
};
