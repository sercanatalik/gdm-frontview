import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';


export async function POST() {

    const session = await getIronSession(cookies(), {
      password: process.env.AUTH_SECRET as string,
      cookieName: "gdm_frontview_session"
    });
 
    await session.destroy();

    return NextResponse.json({ success: true });

}

