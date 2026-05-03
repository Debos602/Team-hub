import { NextResponse } from "next/server";
import { users, generateToken } from "../../../../../lib/mock-db";

export async function POST(request) {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (users.has(email)) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 }
    );
  }

  const user = {
    id: Date.now().toString(),
    name,
    email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
  };

  users.set(email, { ...user, password });

  const token = generateToken({ id: user.id, email });

  return NextResponse.json({
    success: true,
    user,
    accessToken: token,
    refreshToken: `refresh-${token}`,
  });
}
