import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { 
      message: "Profile settings has moved to /settings/profile",
      redirectTo: "/settings/profile" 
    },
    { status: 301 }
  );
}

export async function POST() {
  return NextResponse.json(
    { 
      message: "Profile settings has moved to /settings/profile",
      redirectTo: "/settings/profile" 
    },
    { status: 301 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      message: "Profile settings has moved to /settings/profile",
      redirectTo: "/settings/profile" 
    },
    { status: 301 }
  );
} 