import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check — only logged-in admins can access audio
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  
  if (!id) {
    return new NextResponse("Missing conversation ID", { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || "";
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${id}/audio`, {
      headers: {
        "xi-api-key": apiKey
      }
    });

    if (!response.ok) {
      return new NextResponse(`ElevenLabs API Error: ${response.status}`, { status: response.status });
    }

    // Proxy the audio stream directly back to the client
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "audio/mpeg");
    headers.set("Content-Disposition", `inline; filename="conversation_${id}.mp3"`);
    
    return new NextResponse(response.body, {
      status: 200,
      headers
    });
  } catch (error: any) {
    console.error("Audio fetch error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}
