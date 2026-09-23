import React from 'react';

const TimeLine = ({ person }) => {
  // We reverse the history to show the most recent changes at the top
  const sortedHistory = person?.history ? [...person.history].reverse() : [];

  return (
    <div className="w-full px-0 py-4">
      <div className="flex flex-col gap-4">
        {sortedHistory.length > 0 ? (
          sortedHistory.map((entry, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm"
            >
              {/* Header Section */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">
                    {entry.status}
                  </h4>
                  <p className="text-sm text-slate-500">
                    Moved by <span className="font-medium text-slate-700">{entry.name}</span> 
                    <span className="ml-1 text-xs text-slate-400">({entry.designation})</span>
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {new Date(entry.at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    {new Date(entry.at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>

              {/* Status Note / Description Area */}
              <div className="mt-3 bg-slate-50 rounded px-3 py-2 border-l-4 border-slate-200">
                <p className="text-sm text-slate-600 italic">
                  Candidate moved to <span className="font-semibold">{entry.status}</span> stage.
                  {/* If you add specific notes to your history later, they would go here */}
                </p>
              </div>

              {/* Meta Info footer */}
              <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                <span>ID: {person.email}</span>
                <span>•</span>
                <span>Role: {entry.role}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-400">
            No history recorded for this candidate.
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeLine;