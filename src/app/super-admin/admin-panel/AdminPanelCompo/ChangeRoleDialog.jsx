"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  ShieldCheck, 
  User, 
  ShieldAlert, 
  Check, 
  Loader2 
} from "lucide-react";

const ChangeRoleDialog = ({ open, setOpen, user }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  const roles = [
    {
      id: "Employee",
      title: "Employee",
      desc: "Standard access to personal tools and modules.",
      icon: User,
      color: "text-slate-500",
      bg: "bg-slate-50",
    },
    {
      id: "Admin",
      title: "Admin",
      desc: "Can manage department records and approvals.",
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "SuperAdmin",
      title: "SuperAdmin",
      desc: "Full system access, settings, and user control.",
      icon: ShieldAlert,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("--- Update Verification ---");
    console.log("User:", user.fullName);
    console.log("ID:", user._id);
    console.log("New Role:", selectedRole);

    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      alert(`Console Check Complete for ${user.fullName}`);
    }, 600);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              Change System Role
            </DialogTitle>
            <p className="text-slate-400 text-sm mt-1">
              Updating <span className="text-white font-semibold">{user.fullName}</span>
            </p>
          </DialogHeader>

          <div className="p-6 space-y-4 bg-white">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user.fullName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                <p className="text-xs text-slate-500">{user.designation}</p>
              </div>
            </div>

            <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Select Access Level</Label>
            
            <div className="space-y-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full flex items-start gap-4 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? "border-blue-600 bg-blue-50/50" 
                        : "border-transparent bg-white hover:bg-slate-50 hover:border-slate-100"
                    }`}
                  >
                    <div className={`mt-1 p-2 rounded-lg ${role.bg} ${role.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold text-sm ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                          {role.title}
                        </p>
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                      <p className="text-xs text-slate-500 leading-tight">{role.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t flex flex-row gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || selectedRole === user.role}
              className="flex-1 bg-slate-900 hover:bg-black text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Change"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleDialog;