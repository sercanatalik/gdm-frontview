import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { IronSession } from 'iron-session';
import * as ldap from 'ldapjs';

// Type definitions
interface CustomIronSession extends IronSession<{
  user?: SessionUser;
}> {}

interface SessionUser {
  userid: string;
  email: string;
  displayName: string;
}

interface LDAPConfig {
  url: string;
  baseDN: string;
  bindDN: string;
  bindCredentials: string;
}

interface MockUser {
  userid: string;
  email: string;
  password: string;
}

// Configuration
const ldapConfig: LDAPConfig = {
  url: process.env.LDAP_URL || 'ldap://localhost:389',
  baseDN: process.env.LDAP_BASE_DN || 'dc=example,dc=com',
  bindDN: process.env.LDAP_BIND_DN || 'cn=admin,dc=example,dc=com',
  bindCredentials: process.env.LDAP_BIND_CREDENTIALS || 'admin',
};

const mockUsers: MockUser[] = [
  {
    userid: '123',
    email: 'user@example.com',
    password: '123',
  },
];

async function authenticateUser(userid: string, password: string): Promise<SessionUser | null> {
  return handleMockAuthentication(userid, password)
  try {
    const client = ldap.createClient({
      url: ldapConfig.url,
      timeout: 5000, // Add timeout
      reconnect: true // Add reconnection capability
    });

    return new Promise((resolve, reject) => {
      client.on('error', (err) => {
        client.unbind();
        if (err.code === 'ECONNREFUSED') {
          return handleMockAuthentication(userid, password, resolve);
        }
        reject(err);
      });

      client.bind(ldapConfig.bindDN, ldapConfig.bindCredentials, (err) => {
        if (err) {
          client.unbind();
          return reject(err);
        }

        const searchOptions = {
          scope: 'sub',
          filter: `(uid=${ldap.escape(userid)})`, // Escape user input
        };

        client.search(ldapConfig.baseDN, searchOptions, (err, res) => {
          if (err) {
            client.unbind();
            return reject(err);
          }

          let userDN: string | null = null;
          let userData: any = null;

          res.on('searchEntry', (entry) => {
            userDN = entry.objectName;
            userData = entry.pojo;
          });

          res.on('error', (err) => {
            client.unbind();
            reject(err);
          });

          res.on('end', () => {
            if (!userDN) {
              client.unbind();
              return resolve(null);
            }

            client.bind(userDN, password, (err) => {
              client.unbind();
              if (err) {
                return resolve(null);
              }
              resolve({
                userid: userData.uid,
                email: userData.mail,
                displayName: userData.displayName || userData.mail.split('@')[0]
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.warn('LDAP authentication failed, falling back to mock auth:', error);
    return handleMockAuthentication(userid, password);
  }
}

function handleMockAuthentication(
  userid: string, 
  password: string, 
  resolve?: (user: SessionUser | null) => void
): SessionUser | null {
  const mockUser = mockUsers.find(u => u.userid === userid && u.password === password);
  const result = mockUser ? {
    userid: mockUser.userid,
    email: mockUser.email,
    displayName: mockUser.email.split('@')[0]
  } : null;
  
  return resolve ? resolve(result) : result;
}

export async function POST(req: Request) {
  const { userid, password } = await req.json();
  
  try {
    const userData = await authenticateUser(userid, password);

    if (userData) {
      const sessionUser = { 
        userid: userData.userid,
        email: userData.email,
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
