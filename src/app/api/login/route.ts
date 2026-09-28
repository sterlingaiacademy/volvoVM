import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const credPath = path.join(process.cwd(), 'credentials.json');
    let validUser = "admin";
    let validPass = "mahindra";

    if (fs.existsSync(credPath)) {
      const data = fs.readFileSync(credPath, 'utf8');
      const creds = JSON.parse(data);
      if (creds.username) validUser = creds.username.trim();
      if (creds.password) validPass = creds.password.trim();
    }

    const inputUser = (username || "").trim();
    const inputPass = (password || "").trim();

    if (inputUser === validUser && inputPass === validPass) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("is_admin", "true", {
        httpOnly: true,
        secure: false, // set to true when behind HTTPS
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 // 24 hours
      });
      return response;
    } else {
      console.log(`[Login Failed] Attempted login for user: ${inputUser}`);
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Login Error Details:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
