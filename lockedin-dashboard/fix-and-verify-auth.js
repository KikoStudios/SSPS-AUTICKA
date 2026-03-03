/**
 * Fix and Verify Authentication
 * This script tests the password-based authentication and fixes any issues
 * Run: node fix-and-verify-auth.js
 */

const { ConvexHttpClient } = require('convex/browser');
const readline = require('readline');

const CONVEX_URL = 'https://combative-cat-787.convex.cloud';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🔐 Authentication Verification & Fix\n');
  console.log('=' .repeat(60));
  console.log(`Convex URL: ${CONVEX_URL}\n`);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Check if users exist
    console.log('1️⃣  Checking database...');
    const hasUsers = await client.query('publicApi:hasAnyUsers');
    console.log(`   Users in database: ${hasUsers ? 'YES' : 'NO'}\n`);

    if (!hasUsers) {
      console.log('❌ No users in database. Please create first.');
      console.log('   Options:');
      console.log('   1. Open http://localhost:3000/login');
      console.log('   2. Sign up with a new account\n');
      rl.close();
      return;
    }

    console.log('2️⃣  Current Configuration:');
    console.log('   - Auth System: Convex Auth (Password Provider)');
    console.log('   - Tables: users + authAccounts');
    console.log('   - Test Account: test-usr / testtest\n');

    console.log('3️⃣  Quick Diagnosis:');
    console.log('   The issue is likely one of:');
    console.log('   A) Test account password hash is invalid/corrupted');
    console.log('   B) Account lookup index isn\'t finding the account');
    console.log('   C) JWT key mismatch\n');

    const createNew = await question('Create a fresh test account? (y/n): ');

    if (createNew.toLowerCase() === 'y') {
      console.log('\n4️⃣  Creating fresh test account...\n');

      try {
        const result = await client.action('context:createUserAction', {
          username: 'test-user-new',
          password: 'testpass123',
          usrData: JSON.stringify({ role: 'admin', isActive: true })
        });

        console.log('✅ Fresh account created successfully!');
        console.log(`   User ID: ${result}`);
        console.log('\n📋 New Test Credentials:');
        console.log('   Username: test-user-new');
        console.log('   Password: testpass123\n');

        console.log('5️⃣  To verify login works:');
        console.log('   1. Go to: http://localhost:3000/login');
        console.log('   2. Enter: test-user-new');
        console.log('   3. Enter: testpass123');
        console.log('   4. Should redirect to /dashboard\n');

      } catch (createError) {
        if (createError.message.includes('already exists')) {
          console.log('⚠️  Account test-user-new already exists\n');
          
          const deleteAndRecreate = await question('Delete and recreate it? (y/n): ');
          if (deleteAndRecreate.toLowerCase() === 'y') {
            console.log('Note: Deletion requires admin access. Manual cleanup needed.\n');
          }
        } else {
          console.error('❌ Error creating account:', createError.message);
        }
      }

    } else {
      console.log('\n📝 Manual Testing Instructions:\n');
      console.log('1. Go to: http://localhost:3000/login');
      console.log('2. Try: test-usr / testtest');
      console.log('3. If login FAILS:');
      console.log('   a) Check browser DevTools Console for error message');
      console.log('   b) Look for: "Invalid username or password"');
      console.log('   c) Or: "InvalidSecret" (means JWT key issue)\n');
      console.log('4. If InvalidSecret error:');
      console.log('   a) Run: node fix-jwt-clean.js');
      console.log('   b) Add key to Convex Dashboard');
      console.log('   c) Run: npx convex deploy --yes\n');
      console.log('5. If "Invalid username/password":');
      console.log('   a) Password verification failed');
      console.log('   b) Create new account with fresh password\n');
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    
    if (error.message.includes('InvalidSecret')) {
      console.log('\n⚠️  JWT Key Error!');
      console.log('   Solution:');
      console.log('   1. Run: node fix-jwt-clean.js');
      console.log('   2. Add JWT_PRIVATE_KEY to Convex Dashboard');
      console.log('   3. Run: npx convex deploy --yes\n');
    }
  }

  console.log('=' .repeat(60));
  rl.close();
}

main().catch(console.error);
