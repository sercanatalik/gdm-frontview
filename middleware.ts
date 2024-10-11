import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { IronSession } from 'iron-session';
import { cookies } from 'next/headers'


// Define a custom interface extending IronSession
interface CustomSession extends IronSession {
  user?: {
    // Define the properties of your user object here
    id: string;
    // Add other user properties as needed
  };
}

export async function middleware(request: NextRequest) {
    const session = await getIronSession(cookies(), {
        password: process.env.AUTH_SECRET as string,
        cookieName: "gdm_frontview_session"
      });
  const customSession = session as CustomSession;

  if (!customSession.user) {
    // Redirect to login page if user is not in session
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'], // Add other protected routes here
}