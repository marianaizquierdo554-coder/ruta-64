"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function SignUpPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/redirect-by-role");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}