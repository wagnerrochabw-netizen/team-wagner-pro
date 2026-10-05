import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const zipPath = path.join(process.cwd(), 'public', 'team-wagner-app.zip');
    
    if (!fs.existsSync(zipPath)) {
      return NextResponse.json({ error: 'Zip file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(zipPath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="Team-Wagner-App.zip"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to generate download' }, { status: 500 });
  }
}
