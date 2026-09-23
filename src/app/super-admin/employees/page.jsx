import { Suspense } from 'react';
import EmployeePage from './EmployeePage';

export default function EmployeesMainPage() {
  return (
    // 1. The Suspense boundary catches the "bailout"
    <Suspense fallback={<div className="p-10">Loading Employees...</div>}>
      {/* 2. This component contains the useSearchParams() call */}
      <EmployeePage></EmployeePage>
    </Suspense>
  );
}