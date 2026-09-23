"use client";

import { Suspense } from "react";
import VerifyOnboardMultiStep from "./VerifyOnboardMultiStep";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOnboardMultiStep></VerifyOnboardMultiStep>
    </Suspense>
  );
}
