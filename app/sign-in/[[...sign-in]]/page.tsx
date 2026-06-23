import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn 
        afterSignInUrl="/redirect-by-role"
        afterSignUpUrl="/redirect-by-role"
      />
    </div>
  );
}
