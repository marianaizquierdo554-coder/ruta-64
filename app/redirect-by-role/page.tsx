import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default async function RedirectByRolePage() {
  console.log("=== REDIRECT-BY-ROLE PAGE STARTED ===");

  const { userId } = await auth();
  console.log("UserId:", userId);

  if (!userId) {
    console.log("No userId - redirecting to sign-in");
    redirect("/sign-in");
  }

  console.log("Fetching profile from Supabase...");
  
  //  Usamos maybeSingle() en lugar de single() para evitar errores
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("rol")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  console.log("Profile data:", profile);
  console.log("Error:", error);

  // Si tiene rol, redirigir
  if (profile?.rol) {
    console.log("Usuario tiene rol:", profile.rol);
    if (profile.rol === "beneficiario") {
      console.log("Redirecting to /beneficiario/portal");
      redirect("/beneficiario/portal");
    } else if (profile.rol === "admin") {
      console.log("Redirecting to /admin");
      redirect("/admin");
    } else {
      console.log("Redirecting to /dashboard");
      redirect("/dashboard");
    }
  }

  // Si no tiene rol, ir a seleccionar
  console.log("No tiene rol - redirecting to /seleccionar-rol");
  redirect("/seleccionar-rol");
}