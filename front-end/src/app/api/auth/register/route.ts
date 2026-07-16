import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // 1. Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (user && user.isVerified) {
      return NextResponse.json({ message: "User already exists. Please log in." }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create or Update Unverified User
    if (user) {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, name }
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isVerified: false,
        }
      });
    }

    // 4. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Clear old tokens for this email
    await prisma.verificationToken.deleteMany({ where: { email } });
    
    // Save new OTP
    await prisma.verificationToken.create({
      data: {
        email,
        token: otp,
        expires,
      }
    });

    // 5. Send Email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    await transporter.sendMail({
      from: `"Taskintern DSA" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to Taskintern DSA Visualizer!</h2>
          <p>Please use the following OTP to verify your email address. It is valid for 15 minutes.</p>
          <h1 style="color: #3B82F6; letter-spacing: 2px;">${otp}</h1>
        </div>
      `
    });

    return NextResponse.json({ message: "OTP sent to email", email }, { status: 200 });

  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
