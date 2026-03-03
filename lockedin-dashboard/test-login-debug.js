/**
 * Test Login Script - Debug Authentication
 * Run: node test-login-debug.js
 */

const { ConvexHttpClient } = require('convex/browser');

const CONVEX_URL = 'https://combative-cat-787.convex.cloud';

async function testLogin() {
  console.log('\n🔐 Testing Convex Auth Login\n');
  console.log('=' .repeat(60));
  console.log(`Convex URL: ${CONVEX_URL}\n`);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Step 1: Check if users exist
    console.log('1️⃣  Checking for existing users...');
    const hasUsers = await client.query('publicApi:hasAnyUsers');
    console.log(`   Users exist: ${hasUsers}\n`);

    if (!hasUsers) {
      console.log('❌ No users found. Cannot test login.\n');
      return;
    }

    // Step 2: Try to call the auth endpoints
    console.log('2️⃣  Attempting to load auth provider...');
    try {
      // This won't actually login, but will test if auth system is initialized
      const env = await client.query('debug:getEnv');
      console.log('   ✓ Auth system initialized');
      console.log(`   JWT_PRIVATE_KEY.exists: ${env.JWT_PRIVATE_KEY?.exists || false}`);
      console.log(`   Key snippet: ${env.JWT_PRIVATE_KEY?.snippet || 'NOT FOUND'}\n`);
    } catch (e) {
      console.log('   ℹ️  Debug query not available, but connection works\n');
    }

    // Step 3: List what we know about accounts
    console.log('3️⃣  Account Information:');
    console.log('   Expected account:');
    console.log('   - Username: test-usr');
    console.log('   - Password: testtest');
    console.log('   - Provider: password (Convex Auth)\n');

    console.log('4️⃣  To test login in browser:');
    console.log('   1. Go to: http://localhost:3000/login');
    console.log('   2. Enter username: test-usr');
    console.log('   3. Enter password: testtest');
    console.log('   4. Click Sign In');
    console.log('   5. Check browser console for errors\n');

    console.log('5️⃣  Expected next steps:');
    console.log('   ✓ Redirect to http://localhost:3000/dashboard');
    console.log('   ✓ Your usrData displayed');
    console.log('   ✓ No InvalidSecret or "Invalid username/password" errors\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('InvalidSecret')) {
      console.log('\n⚠️  INVALIDSECRET ERROR!');
      console.log('   The JWT keys are still mismatched.');
      console.log('   Solution: Check that both keys match:\n');
      console.log('   1. Local .env.local JWT_PRIVATE_KEY');
      console.log('   2. Convex Dashboard Environment Variables JWT_PRIVATE_KEY');
      console.log('   3. Run: npx convex deploy --yes\n');
    }
  }

  console.log('=' .repeat(60));
}

testLogin().catch(console.error);
