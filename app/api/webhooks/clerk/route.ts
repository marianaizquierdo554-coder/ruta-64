import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("Missing CLERK_WEBHOOK_SECRET");
      return new Response("Missing webhook secret", { status: 500 });
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid webhook", { status: 400 });
    }

    // ============================================
    // USER CREATED
    // ============================================
    if (evt.type === "user.created") {
      const { id, email_addresses, image_url, first_name, last_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim() || email || "Usuario";

      console.log(`Usuario creado en Clerk: ${id} - ${email}`);

      await prisma.profiles.upsert({
        where: { clerk_user_id: id },
        update: {
          email: email,
          avatar_url: image_url || null,
        },
        create: {
          clerk_user_id: id,
          email: email,
          avatar_url: image_url || null,
          rol: "donante",
          validado: false,
        },
      });

      console.log(`Perfil creado/actualizado para: ${email}`);
    }

    // ============================================
    // USER UPDATED
    // ============================================
    if (evt.type === "user.updated") {
      const { id, email_addresses, image_url, first_name, last_name } = evt.data;
      const email = email_addresses[0]?.email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim() || email || "Usuario";

      console.log(`Usuario actualizado en Clerk: ${id}`);

      await prisma.profiles.updateMany({
        where: { clerk_user_id: id },
        data: {
          email: email || undefined,
          avatar_url: image_url || undefined,
        },
      });

      console.log(`Perfil actualizado: ${id}`);
    }

    // ============================================
    // USER DELETED
    // ============================================
    if (evt.type === "user.deleted") {
      const { id } = evt.data;

      console.log(`Usuario eliminado en Clerk: ${id}`);

      await prisma.profiles.updateMany({
        where: { clerk_user_id: id },
        data: {
          clerk_user_id: null,
        },
      });

      console.log(`Perfil desvinculado: ${id}`);
    }

    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Error en webhook de Clerk:", error);
    return new Response(
      error instanceof Error ? error.message : "Error interno",
      { status: 500 }
    );
  }
}