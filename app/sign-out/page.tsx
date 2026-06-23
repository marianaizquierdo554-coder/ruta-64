"use client";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut(() => {
      router.push("/");
    });
  }, [signOut, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl mb-2">Cerrando sesión...</h1>
        <p className="text-gray-600">Por favor espera un momento.</p>
      </div>
    </div>
  );
}
