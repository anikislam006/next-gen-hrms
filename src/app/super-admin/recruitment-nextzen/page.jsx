import { Suspense } from 'react';
// 1. Keep this import as is
import RecruitmentNextzenMainPage from './RecruitmentNextzenMainPage';

// 2. Rename this function to 'Page' (standard Next.js convention)
export default function Page() {
  return (
    // This boundary handles the streaming/client-side rendering
    <Suspense fallback={<div>Loading Payroll...</div>}>
      <RecruitmentNextzenMainPage />
    </Suspense>
  );
}