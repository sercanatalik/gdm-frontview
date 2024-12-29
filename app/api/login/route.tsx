import { NextResponse } from 'next/server';
import * as ldap from 'ldapjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Create LDAP client
    const client = ldap.createClient({
      url: process.env.LDAP_URL || 'ldap://your-ldap-server:389',
    });

    // Wrap the LDAP bind operation in a Promise
    const bindResult = await new Promise((resolve, reject) => {
      // Construct the user DN (Distinguished Name)
      const userDN = `cn=${username},${process.env.LDAP_BASE_DN || 'dc=example,dc=com'}`;
      
      client.bind(userDN, password, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      });
    });

    // Close the LDAP connection
    client.unbind();

    // If we get here, authentication was successful
    return NextResponse.json(
      { 
        success: true, 
        message: 'Authentication successful' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('LDAP Authentication error:', error);
    
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 401 }
    );
  }
}
