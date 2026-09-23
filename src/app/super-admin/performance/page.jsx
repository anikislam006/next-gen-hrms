import { Suspense } from 'react';
import PerformanceMainPage from './PerformanceMainPage';

export default function PayrollMainPage() {
  return (
    // This boundary allows Next.js to skip this part during static generation 
    // and render it on the client side instead.
    <Suspense fallback={<div>Loading Payroll...</div>}>
      <PerformanceMainPage></PerformanceMainPage>
    </Suspense>
  );
}