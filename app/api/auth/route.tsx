import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { IronSession } from 'iron-session';

// Add this interface to extend IronSession
interface CustomIronSession extends IronSession<{
  user?: any; // Replace 'any' with a more specific type if possible
}> {}

// Updated users as a list
const users = [
  {
    userid: '123',
    email: 'user@example.com',
    password: '123',
  },
];

export async function POST(req: Request) {
  const { userid, password } = await req.json();
  // Find user in the list
  const user = users.find(u => u.userid === userid && u.password === password);

  if (user) {
    const sessionUser = { userid: user.userid, email: user.email };
    // Create a new session using Iron Session
    const session = await getIronSession(cookies(), {
      password: process.env.AUTH_SECRET as string,
      cookieName: "gdm_frontview_session"
    });
    // Cast the session to CustomIronSession
    (session as CustomIronSession).user = sessionUser;
    await session.save();

    return NextResponse.json({ success: true, user: sessionUser });
  } else {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }
}
