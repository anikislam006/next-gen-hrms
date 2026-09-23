import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Zap, 
  FileText, 
  Clock, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Award, 
  Users 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const LeavePolicyTypeCard = ({ 
  policy, 
  specificRules, 
  onViewDetails, 
  onEditType, 
  onDeleteType, 
  onAddRule, 
  onEditRule, 
  onDeleteRule 
}) => {
  const color = policy.colorTag || "#3b82f6";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow border-slate-200 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Icon Box with 20% opacity background */}
              <div 
                className="h-16 w-16 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <Calendar className="h-8 w-8" style={{ color: color }} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-slate-900 truncate">{policy.name}</h3>
                  {policy.isAutoAssign && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 shadow-none">
                      <Zap className="h-3 w-3 mr-1" />
                      Auto-Assign
                    </Badge>
                  )}
                  {!policy.isEnabled && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                      Disabled
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                  {policy.description || "No description provided for this leave type."}
                </p>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 font-medium">
                      {specificRules.length} {specificRules.length === 1 ? 'Rule' : 'Rules'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Created {new Date(policy.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(policy)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => onEditType(e, policy)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => onDeleteType(e, policy._id)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-slate-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rules Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800">Configured Rules</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={(e) => onAddRule(e, policy)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>

            {specificRules.length > 0 ? (
              <div className="space-y-3">
                {specificRules.map((rule) => (
                  <div
                    key={rule._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex-1">
                      <h5 className="font-semibold text-slate-800 mb-1">{rule.policyName}</h5>
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-blue-600">
                          <Award className="h-3 w-3" />
                          {rule.annualDays} days/year
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-slate-400" />
                          Group: {rule.applicableGroup || 'All Employees'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => onEditRule(e, rule)}>
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onDeleteRule(e, rule._id)}
                        className="text-red-500 hover:bg-red-100/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 mb-3">No specific rules configured yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={(e) => onAddRule(e, policy)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LeavePolicyTypeCard;