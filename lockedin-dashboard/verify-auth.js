/**
 * Authentication Verification Script
 * 
 * This script verifies that the Convex authentication is working correctly
 * and helps create a test admin account.
 * 
 * Run: node verify-auth.js
 */

const { ConvexHttpClient } = require('convex/browser');
const readline = require('readline');

// Get Convex URL from environment or use default
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://combative-cat-787.convex.cloud';

const client = new ConvexHttpClient(CONVEX_URL);

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
  console.log('\n🔐 Convex Authentication Verification\n');
  console.log('=' .repeat(60));
  console.log(`Connecting to: ${CONVEX_URL}\n`);

  try {
    // Step 1: Check if any users exist
    console.log('⏳ Checking for existing users...');
    const hasUsers = await client.query('publicApi:hasAnyUsers');
    
    console.log(`✅ Connection successful!`);
    console.log(`   Users exist: ${hasUsers ? 'YES' : 'NO'}\n`);

    if (!hasUsers) {
      console.log('📝 No users found. You can create the first account via:');
      console.log('   1. Web UI: http://localhost:3000/login (will auto-switch to signup)');
      console.log('   2. This script (below)\n');
      
      const createAccount = await question('Do you want to create an admin account now? (y/n): ');
      
      if (createAccount.toLowerCase() === 'y') {
        console.log('\n📋 Create Admin Account\n');
        
        const username = await question('Username: ');
        if (!username.trim()) {
          console.log('❌ Username cannot be empty');
          rl.close();
          return;
        }
        
        const password = await question('Password: ');
        if (!password.trim()) {
          console.log('❌ Password cannot be empty');
          rl.close();
          return;
        }
        
        console.log('\n⏳ Creating admin account...');
        
        try {
          // Call the createUserAction mutation
          const result = await client.mutation('context:createUserAction', {
            username: username,
            password: password,
            usrData: JSON.stringify({
              role: 'admin',
              permissions: ['all']
            })
          });
          
          console.log('✅ Admin account created successfully!');
          console.log(`   User ID: ${result}`);
          console.log('\n🎉 You can now login at: http://localhost:3000/login');
          console.log(`   Username: ${username}`);
          console.log(`   Password: [hidden]\n`);
        } catch (createError) {
          console.error('❌ Failed to create account:', createError.message);
          if (createError.message.includes('InvalidSecret')) {
            console.log('\n⚠️  INVALIDSECRET ERROR DETECTED!');
            console.log('   This means JWT_PRIVATE_KEY is not set in Convex Dashboard.');
            console.log('   Please verify:');
            console.log('   1. Go to https://dashboard.convex.dev');
            console.log('   2. Settings → Environment Variables');
            console.log('   3. Check that JWT_PRIVATE_KEY exists');
            console.log('   4. Run: npx convex deploy --yes\n');
          }
        }
      }
    } else {
      console.log('✅ Users already exist in the database.');
      console.log('   You can login at: http://localhost:3000/login\n');
      
      const testLogin = await question('Do you want to test authentication? (y/n): ');
      
      if (testLogin.toLowerCase() === 'y') {
        console.log('\n📋 Test Login\n');
        
        const username = await question('Username: ');
        const password = await question('Password: ');
        
        console.log('\n⏳ Testing authentication...');
        
        try {
          // This would need actual auth implementation
          console.log('⚠️  Full login test requires browser-based auth flow.');
          console.log('   Please test manually at: http://localhost:3000/login\n');
        } catch (error) {
          console.error('❌ Login test failed:', error.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Connection or query failed:', error.message);
    
    if (error.message.includes('InvalidSecret')) {
      console.log('\n⚠️  INVALIDSECRET ERROR DETECTED!');
      console.log('   This means the JWT_PRIVATE_KEY is not properly set.');
      console.log('\n   SOLUTION:');
      console.log('   1. Verify JWT_PRIVATE_KEY in Convex Dashboard');
      console.log('   2. Go to: https://dashboard.convex.dev');
      console.log('   3. Select your project');
      console.log('   4. Settings → Environment Variables');
      console.log('   5. Add JWT_PRIVATE_KEY with the value from fix-jwt-clean.js');
      console.log('   6. Run: npx convex deploy --yes');
      console.log('   7. Restart this script\n');
    } else {
      console.log('\n   Check that:');
      console.log('   - Convex dev server is running');
      console.log('   - NEXT_PUBLIC_CONVEX_URL is correct');
      console.log('   - Functions are deployed\n');
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  rl.close();
  process.exit(1);
});
