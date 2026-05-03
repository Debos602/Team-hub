import { NextResponse } from "next/server";
import { users, generateToken } from "../../../../../lib/mock-db";

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing credentials" },
      { status: 400 }
    );
  }

  const userRecord = users.get(email);
  if (!userRecord || userRecord.password !== password) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const { password: _, ...user } = userRecord;
  const token = generateToken({ id: user.id, email });

  return NextResponse.json({
    success: true,
    user,
    accessToken: token,
    refreshToken: `refresh-${token}`,
  });
}
