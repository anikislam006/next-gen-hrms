import { Suspense } from 'react';
import ExpensePage from './ExpensePage';

export default function ExpenseMainPage() {
  return (
    <Suspense fallback={<div>Loading Expenses...</div>}>
      <ExpensePage />
    </Suspense>
  );
}