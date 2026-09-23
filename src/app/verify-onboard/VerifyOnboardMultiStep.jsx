"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  User,
  FileText,
  Phone,
  CheckCircle,
  Save,
  Building2,
  Award,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyOnboardMultiStep() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    bloodGroup: "",
    nidNumber: "",
    tinNumber: "",
    passportNumber: "",
    presentAddress: "",
    permanentAddress: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    department: "",
    designation: "",
    joiningDate: "",
  });

  // fetch token decode
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://code360.pro/api/verify-onboard?token=${token}`
        );
        const data = await res.json();
        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            email: data.decoded.email,
            department: data.decoded.department,
            designation: data.decoded.designation,
            joiningDate: data.decoded.joiningDate,
          }));
        } else {
          setMessage("Invalid or expired link.");
        }
      } catch (err) {
        setMessage("Something went wrong while verifying the link.");
      } finally {
        setVerifying(false);
      }
    };
    fetchData();
  }, [token]);

  const getOverallProgress = () => Math.floor((currentStep / totalSteps) * 100);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setError("");
    if (
      currentStep === 1 &&
      (!formData.password || !formData.confirmPassword)
    ) {
      setError("Password and confirm password are required");
      return;
    }
    if (currentStep === 1 && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCompleteRegistration = async () => {
    setError("");
    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Full name, email, and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://code360.pro/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Signup failed");
      } else {
        router.push(`/verify?userId=${data.userId}`);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verifying link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to HR Management System
          </h1>
          <p className="text-gray-600 text-lg">
            Complete your profile to get started
          </p>
        </motion.div>
      </div>
  
      <div className="max-w-4xl mx-auto px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 rounded">
           <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {" "}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            {" "}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {" "}
              Welcome to the Team!{" "}
            </h1>{" "}
            <p className="text-gray-600 mb-4">
              {" "}
              Complete your profile to get started{" "}
            </p>{" "}
            {/* <Input type="text" name="department" value={formData.department} disabled className="bg-gray-100" /> <Input type="text" name="designation" value={formData.designation} disabled className="bg-gray-100" /> <Input type="text" name="joiningDate" value={formData.joiningDate} disabled className="bg-gray-100" /> */}{" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {" "}
              <div className="flex items-center justify-center gap-2 text-gray-600">
                {" "}
                <Building2 className="w-4 h-4" /> {formData.department}{" "}
              </div>{" "}
              <div className="flex items-center justify-center gap-2 text-gray-600">
                {" "}
                <Award className="w-4 h-4" /> {formData.designation}{" "}
              </div>{" "}
              <div className="flex items-center justify-center gap-2 text-gray-600">
                {" "}
                <Calendar className="w-4 h-4" />{" "}
                {/* Joining {new Date(onboardingRequest.joining_date).toLocaleDateString()} */}{" "}
                Joining {formData.joiningDate}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </motion.div>
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {getOverallProgress()}% complete
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-8">
            {message && <p className="text-red-500 mb-4">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <AnimatePresence mode="wait">
              {/* Step 1: Account Setup */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">
                      Set Up Your Account
                    </h2>
                  </div>
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">
                      Personal Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Full Name *"
                    />
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone"
                    />
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                    <Select
                      onValueChange={(v) =>
                        setFormData({ ...formData, gender: v })
                      }
                      value={formData.gender}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(v) =>
                        setFormData({ ...formData, maritalStatus: v })
                      }
                      value={formData.maritalStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Marital Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      placeholder="Nationality"
                    />
                    <Select
                      onValueChange={(v) =>
                        setFormData({ ...formData, bloodGroup: v })
                      }
                      value={formData.bloodGroup}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Documents & Address */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">
                      Documents & Address
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="text"
                      name="nidNumber"
                      value={formData.nidNumber}
                      onChange={handleChange}
                      placeholder="NID Number"
                    />
                    <Input
                      type="text"
                      name="tinNumber"
                      value={formData.tinNumber}
                      onChange={handleChange}
                      placeholder="TIN Number"
                    />
                    <Input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleChange}
                      placeholder="Passport Number"
                    />
                    <Textarea
                      name="presentAddress"
                      value={formData.presentAddress}
                      onChange={handleChange}
                      placeholder="Present Address"
                    />
                    <Textarea
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleChange}
                      placeholder="Permanent Address"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 4: Emergency Contact */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Phone className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Emergency Contact</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="text"
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleChange}
                      placeholder="Emergency Name"
                    />
                    <Input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      placeholder="Emergency Phone"
                    />
                    <Input
                      type="text"
                      name="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={handleChange}
                      placeholder="Relation"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">
                      Ready to Complete?
                    </h3>
                    <p className="text-blue-800 mb-4">
                      Review your information and click "Complete Registration".
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <CheckCircle className="w-4 h-4" />
                      Your profile is {getOverallProgress()}% complete
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <div className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </div>
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteRegistration}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-teal-600"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Complete Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
