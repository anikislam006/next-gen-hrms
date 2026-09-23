"use client";
import React, { useState } from "react";
import { RefreshCw, Lock } from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

const ChangePassDialog = ({ employee, trigger, fetchEmployees }) => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // ❗ Ensure this URL matches your backend port and route exactly
      const response = await axios.post(`https://code360.pro/api/reset-password-admin`, {
        email: employee.email,
        newPassword: newPassword
      });

      if (response.data.success) {
        toast.success("Password updated!");
        setNewPassword("");
        setOpen(false);
        if (fetchEmployees) fetchEmployees();
      }
    } catch (error) {
      console.error("404 check:", error.response);
      toast.error(error.response?.data?.message || "Route not found (404)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Change Password - {employee.fullName}
          </DialogTitle>
          <DialogDescription>Update the password for {employee.email}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-gray-500 text-xs font-bold uppercase">New Password</Label>
            <div className="flex gap-2">
              <Input
                type="text" 
                placeholder="New password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="font-mono bg-slate-50"
              />
              <Button type="button" variant="outline" onClick={generateRandomPassword}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1 bg-slate-900 text-white font-bold"
              onClick={handlePasswordChange}
              disabled={loading || newPassword.length < 6}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
            <Button variant="outline" className="font-bold" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassDialog;