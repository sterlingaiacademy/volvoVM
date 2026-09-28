import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || "http://localhost:8080/outbound";

export async function POST(req: NextRequest) {
  // Auth check — only logged-in admins can trigger calls
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    
    // Sanitize phone
    if (data.phone) {
      data.phone = data.phone.replace(/[^\d+]/g, '');
    }

    const callId = randomUUID();
    data.call_id = callId;

    // Inject Outbound direction explicitly for the Google Sheet data collection
    if (!data.conversation_variables) data.conversation_variables = {};
    data.conversation_variables.Direction = "Outbound";
    data.conversation_variables.direction = "Outbound";
    data.conversation_variables.call_id = callId;
    
    // Inject agent_id server-side from env var so it never lives in client code
    if (!data.agent_id) {
      data.agent_id = process.env.ELEVENLABS_AGENT_ID || "";
    }

    // Pass the request directly to the Python server running on GCP
    const response = await fetch(PYTHON_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Python Server Error: ${errorText}` }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[Outbound] Error proxying to Python server:", error);
    return NextResponse.json(
      { error: `Could not connect to Python server at ${PYTHON_SERVER_URL}. Ensure the python outbound_server is running.` }, 
      { status: 500 }
    );
  }
}
