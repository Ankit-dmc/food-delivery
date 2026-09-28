import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// bcrypt uses node/crypto under the hood — keep this route on the Node.js
// runtime (do not let it default to the Edge runtime).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BCRYPT_ROUNDS = 12;

interface SignupBody {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: "INVALID_NAME", message: "Name must be 2-80 characters." },
      { status: 400 }
    );
  }
  if (!isEmail(email) || email.length > 254) {
    return NextResponse.json(
      { error: "INVALID_EMAIL", message: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  // Password policy: length is the only rule that reliably correlates with
  // user-chosen strength; the hash cost (12 rounds) protects it at rest.
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      {
        error: "INVALID_PASSWORD",
        message: "Password must be at least 8 characters.",
      },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "EMAIL_TAKEN", message: "An account with this email already exists." },
      { status: 409 }
    );
  }

  // Hash BEFORE storage — plaintext passwords never touch the database.
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { name, email, hashedPassword, role: "CUSTOMER" },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        // Never echo hashedPassword back to the client.
      },
      { status: 201 }
    );
  } catch (err) {
    // Unique constraint race: two signups for the same email at once.
    const code = (err as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "EMAIL_TAKEN", message: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error("[signup] unexpected error", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
