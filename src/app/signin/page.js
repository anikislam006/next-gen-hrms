"use client";

import { Suspense } from "react";
import SignInPage from "./SigninPage";


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
