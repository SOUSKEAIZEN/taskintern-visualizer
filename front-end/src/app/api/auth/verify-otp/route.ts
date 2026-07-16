import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    // 1. Find the token
    const verification = await prisma.verificationToken.findFirst({
      where: { email, token: otp }
    });

    if (!verification) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // 2. Check expiration
    if (new Date() > verification.expires) {
      await prisma.verificationToken.delete({ where: { id: verification.id } });
      return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // 3. Mark User as verified
    await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    });

    // 4. Cleanup token
    await prisma.verificationToken.delete({ where: { id: verification.id } });

    return NextResponse.json({ message: "Email verified successfully. You can now log in." }, { status: 200 });

  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
