import { Suspense } from 'react';
import SelfServiceMainPage from './SelfServiceMainPage';

export default function SelfServicePage() {
  return (
    <Suspense fallback={<div>Loading SelfService...</div>}>
      <SelfServiceMainPage></SelfServiceMainPage>
    </Suspense>
  );
}