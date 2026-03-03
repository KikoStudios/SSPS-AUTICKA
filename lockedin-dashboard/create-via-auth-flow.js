/**
 * Create Test Account Using Convex Auth SignUp Flow
 * 
 * This script uses the actual Convex Auth HTTP endpoints to create an account
 * the same way the login form does, ensuring proper integration.
 * 
 * Run: node create-via-auth-flow.js
 */

const http = require('http');
const https = require('https');

const CONVEX_URL = 'https://combative-cat-787.convex.cloud';

function sendRequest(url, method, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data, headers: res.headers });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function createViaAuthFlow() {
  console.log('\n🔐 Create Account via Convex Auth HTTP Flow\n');
  console.log('=' .repeat(60));

  const username = 'adminuser';
  const password = 'SecurePass@123';

  console.log(`Username: ${username}`);
  console.log(`Password: ${password}\n`);

  try {
    console.log('📝 Step 1: Calling Convex Auth signUp endpoint...\n');

    // Build form data like the login form does
    const formData = new URLSearchParams();
    formData.append('email', username);        // Convex Auth expects 'email'
    formData.append('password', password);
    formData.append('flow', 'signUp');         // First time signup
    formData.append('provider', 'password');

    const signUpUrl = `${CONVEX_URL}/api/auth/callback/password`;
    
    const result = await sendRequest(signUpUrl, 'POST', formData.toString());

    console.log(`Response Status: ${result.status}`);
    
    if (result.status === 302) {
      // Redirect means successful signup
      console.log('✅ Account created via auth flow!\n');
      console.log(`📋 Login Credentials:`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}\n`);
      
      console.log('🎯 Now test login:');
      console.log('1. Open: http://localhost:3000/login');
      console.log(`2. Enter Username: ${username}`);
      console.log(`3. Enter Password: ${password}`);
      console.log('4. Click Sign In\n');
    } else {
      console.log(`Response: ${result.body}\n`);
      
      if (result.body.includes('already exists')) {
        console.log('⚠️  Account already exists\n');
        console.log(`You can login with:`);
        console.log(`  Username: ${username}`);
        console.log(`  Password: ${password}\n`);
      } else {
        console.log('ℹ️  Unexpected response. Check if endpoint is correct.\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure dev server is running');
    console.log('2. Ensure Convex functions are deployed');
    console.log('3. Check network connectivity\n');
  }

  console.log('=' .repeat(60) + '\n');
}

createViaAuthFlow().catch(console.error);
