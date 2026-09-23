import { Suspense } from 'react';
import OrgHierarchy from './OrgHierarchy';

export default function OrgHierarchyPage() {
  return (
    <Suspense fallback={<div>Loading Hierarchy...</div>}>
      <OrgHierarchy />
    </Suspense>
  );
}