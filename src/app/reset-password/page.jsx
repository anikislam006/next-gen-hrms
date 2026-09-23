"use client";

import { Suspense } from "react";
import ResetPasswordPage from "./ResetPassword";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
