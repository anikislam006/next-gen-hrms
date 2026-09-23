import React from 'react';
import { Calendar, Plus, Loader2, SearchX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LeaveEmptyState = ({ loading, searchTerm, onCreateClick }) => {
  return (
    <Card className="border-dashed border-2 bg-slate-50/50">
      <CardContent className="p-16 text-center">
        {loading ? (
          // Loading State
          <>
            <div className="relative h-20 w-20 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <Calendar className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Organizing Policies
            </h3>
            <p className="text-slate-500">
              Please wait while we fetch your leave configurations...
            </p>
          </>
        ) : (
          // No Results State
          <>
            {searchTerm ? (
              <SearchX className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            ) : (
              <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            )}
            
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No matches found' : 'No Leave Types Found'}
            </h3>
            
            <p className="text-slate-600 mb-8 max-w-xs mx-auto">
              {searchTerm 
                ? `We couldn't find anything matching "${searchTerm}". Try a different keyword.` 
                : 'Get started by creating your first leave type category.'
              }
            </p>

            {!searchTerm && (
              <Button 
                onClick={onCreateClick}
                className="bg-slate-900 hover:bg-black text-white px-8 h-11 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Leave Type
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveEmptyState;