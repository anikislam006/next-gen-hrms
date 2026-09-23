"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useExpense } from "@/app/hook/useExpense";
import { 
  CreditCard, 
  Plus, 
  Loader2 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

const ExpensesSelfService = () => {
  const { UserAllDetails } = useAuth();
  const { 
    expenses, 
    fetchMyExpenses, 
    loading: fetchLoading, 
    pagination,
    submitExpense // Assuming this exists in your hook
  } = useExpense();

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });

  useEffect(() => {
    if (UserAllDetails?.email) {
      fetchMyExpenses(UserAllDetails.email, {
        page: 1,
        limit: 20,
      });
    }
  }, [UserAllDetails?.email, fetchMyExpenses]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "approved") return "bg-green-100 text-green-700 border-green-200";
    if (s === "rejected") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  const handleExpenseSubmission = async () => {
    setSubmitting(true);
    console.log('🎯 Submitting expense:', expenseForm);
    // Integration logic for submission would go here
    setTimeout(() => {
      setSubmitting(false);
      resetExpenseForm();
    }, 1000);
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      category: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      description: ""
    });
    setShowExpenseForm(false);
  };

  return (
    <div className=" space-y-6 ">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Expense Requests
            </CardTitle>
            <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                  onClick={() => setShowExpenseForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit Expense</DialogTitle>
                  <DialogDescription>
                    Submit a new expense request for reimbursement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Category *</Label>
                    <Select 
                      value={expenseForm.category} 
                      onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Communication">Communication</SelectItem>
                        <SelectItem value="Entertainment">Client Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Amount (BDT) *</Label>
                      <Input
                        type="number"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={expenseForm.date}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Please provide details about the expense"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleExpenseSubmission} 
                      disabled={submitting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {submitting ? 'Submitting...' : 'Submit Expense'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetExpenseForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Expense Requests</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any expense requests yet.</p>
              <Button 
                onClick={() => setShowExpenseForm(true)}
                className="bg-gradient-to-r from-green-500 to-blue-600"
              >
                Submit Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">{expense.category?.name || expense.category}</h4>
                    <Badge className={`${getStatusColor(expense.status)} border shadow-sm uppercase text-[10px]`}>
                      {expense.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-2 text-green-600 font-bold">{formatCurrency(expense.amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-2 font-medium text-gray-700">
                        {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="col-span-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-gray-500 text-xs block mb-1 uppercase font-bold">Description:</span>
                      <span className="text-gray-700">{expense.description || "No details provided"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesSelfService;