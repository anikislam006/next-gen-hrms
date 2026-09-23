'use client';
import { useState } from "react";
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
} from "lucide-react";

import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import { useRouter } from "next/navigation";

export default function MultiStepForm() {
  const router = useRouter();
  const totalSteps = 4;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email:  "",
    password: "",
    confirm_password: "",
    fullName: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    marital_status: "",
    nationality: "",
    blood_group: "",
    nid_number: "",
    tin_number: "",
    passport_number: "",
    present_address: "",
    permanent_address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  });

  const getOverallProgress = () => Math.floor((currentStep / totalSteps) * 100);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1 && (!formData.password || !formData.confirm_password)) {
      setError('Password and confirm password are required');
      return;
    }
    if (currentStep === 1 && formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCompleteRegistration = async () => {
    setError('');
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Full name, email, and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://code360.pro/api/signup`, {
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
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{getOverallProgress()}% complete</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-8">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <AnimatePresence mode="wait">

              {/* Step 1: Password */}
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
                    <h2 className="text-xl font-semibold">Set Up Your Account</h2>
                    <p className="text-gray-600">Create a secure password for your account</p>
                  </div>
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-2">
  <Label>Email Address</Label>
  <Input
    type="email"
    name="email" // important!
    value={formData.email} // controlled input
    onChange={handleChange} // updates formData
    placeholder="Enter your email"
    className="bg-gray-50"
  />
</div>

                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        value={formData.gender}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Marital Status</Label>
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, marital_status: value })}
                        value={formData.marital_status}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Marital Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nationality</Label>
                      <Input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="Enter nationality"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Input
                        type="text"
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                        placeholder="Enter blood group"
                      />
                    </div>
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
                    <h2 className="text-xl font-semibold">Documents & Address</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="text"
                      name="nid_number"
                      value={formData.nid_number}
                      onChange={handleChange}
                      placeholder="NID Number"
                    />
                    <Input
                      type="text"
                      name="tin_number"
                      value={formData.tin_number}
                      onChange={handleChange}
                      placeholder="TIN Number"
                    />
                    <Input
                      type="text"
                      name="passport_number"
                      value={formData.passport_number}
                      onChange={handleChange}
                      placeholder="Passport Number"
                    />
                    <Textarea
                      name="present_address"
                      value={formData.present_address}
                      onChange={handleChange}
                      placeholder="Present Address"
                    />
                    <Textarea
                      name="permanent_address"
                      value={formData.permanent_address}
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
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleChange}
                      placeholder="Emergency Contact Name"
                    />
                    <Input
                      type="tel"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange}
                      placeholder="Emergency Contact Phone"
                    />
                    <Input
                      type="text"
                      name="emergency_contact_relation"
                      value={formData.emergency_contact_relation}
                      onChange={handleChange}
                      placeholder="Emergency Contact Relation"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">Ready to Complete?</h3>
                    <p className="text-blue-800 mb-4">
                      Review your information and click Complete Registration to finish.
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
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <div className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</div>
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-purple-600">
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
