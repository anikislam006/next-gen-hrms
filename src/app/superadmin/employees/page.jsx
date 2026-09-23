"use client";

import { Suspense } from "react";
import Employees from "./Employees";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Employees />
    </Suspense>
  );
}
