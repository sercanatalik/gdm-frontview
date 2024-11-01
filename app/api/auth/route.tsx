import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { IronSession } from 'iron-session';
import * as ldap from 'ldapjs';

interface CustomIronSession extends IronSession<{
  user?: any;
}> {}

// LDAP client configuration
const ldapConfig = {
  url: process.env.LDAP_URL || 'ldap://localhost:389',
  baseDN: process.env.LDAP_BASE_DN || 'dc=example,dc=com',
  bindDN: process.env.LDAP_BIND_DN || 'cn=admin,dc=example,dc=com',
  bindCredentials: process.env.LDAP_BIND_CREDENTIALS || 'admin',
};

// Mock users for fallback
const mockUsers = [
  {
    userid: '123',
    email: 'user@example.com',
    password: '123',
  },
];

async function authenticateUser(userid: string, password: string) {
  try {
    const client = ldap.createClient({
      url: ldapConfig.url
    });

    // First bind with admin credentials
    client.bind(ldapConfig.bindDN, ldapConfig.bindCredentials, (err) => {
      if (err) {
        client.unbind();
        throw err;
      }

      // Search for user
      const searchOptions = {
        scope: 'sub',
        filter: `(uid=${userid})`,
      };

      client.search(ldapConfig.baseDN, { ...searchOptions, scope: 'sub' }, (err, res) => {
        if (err) {
          client.unbind();
          throw err;
        }

        let userDN: string | null = null;
        let userData: any = null;

        res.on('searchEntry', (entry) => {
          userDN = entry.objectName;
          userData = entry.pojo;
        });

        res.on('end', () => {
          if (!userDN) {
            client.unbind();
            throw new Error('User not found');
          }

          // Verify user credentials
          client.bind(userDN, password, (err) => {
            client.unbind();
            if (err) {
              throw err;
            } else {
              return userData;
            }
          });
        });
      });
    });
  } catch (error) {
    console.warn('LDAP authentication failed, falling back to mock auth:', error);
    // Fall back to mock authentication
    const mockUser = mockUsers.find(u => u.userid === userid && u.password === password);
    return mockUser ? {
      uid: mockUser.userid,
      mail: mockUser.email,
      displayName: mockUser.email.split('@')[0]
    } : null;
  }
}

export async function POST(req: Request) {
  const { userid, password } = await req.json();
  
  try {
    const userData = await authenticateUser(userid, password);

    if (userData) {
      const sessionUser = { 
        userid: userData.uid,
        email: userData.mail,
        displayName: userData.displayName
      };

      const session = await getIronSession(cookies(), {
        password: process.env.AUTH_SECRET as string,
        cookieName: "gdm_frontview_session"
      });
      
      (session as CustomIronSession).user = sessionUser;
      await session.save();

      return NextResponse.json({ success: true, user: sessionUser });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('LDAP authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication error' }, 
      { status: 500 }
    );
  }
}
