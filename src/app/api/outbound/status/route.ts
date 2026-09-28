import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'campaign_status.json');

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const raw = fs.readFileSync(STATUS_FILE, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch (_) {
    return NextResponse.json({ status: 'idle', total: 0, current: 0, contacts: [] });
  }
}
