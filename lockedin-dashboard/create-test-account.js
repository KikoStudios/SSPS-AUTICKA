/**
 * Convex Auth Initialization - Create Test Account Properly
 * This script creates a test account using Convex HTTP Client
 */

const { ConvexHttpClient } = require('convex/browser');

const CONVEX_URL = 'https://combative-cat-787.convex.cloud';

async function createTestAccount() {
  console.log('\n🔐 Convex Auth - Create Test Account\n');
  console.log('=' .repeat(60));
  
  const username = 'testadmin';
  const password = 'Admin@12345';

  console.log(`Setup:
  - Username: ${username}
  - Password: ${password}\n`);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Use our custom action to create account
    console.log('📝 Creating account...\n');

    const userId = await client.action('context:createUserAction', {
      username,
      password,
      usrData: JSON.stringify({
        role: 'admin',
        permissions: ['all'],
        isActive: true,
        createdAt: new Date().toISOString()
      })
    });

    console.log('✅ Account created successfully!');
    console.log(`   User ID: ${userId}\n`);

  } catch (error) {
    const msg = error.message || String(error);
    
    if (msg.includes('already exists')) {
      console.log('⚠️  Account already exists');
      console.log(`   Username: ${username}`);
      console.log(`   You can log in with this account\n`);
    } else {
      console.error('❌ Error:', msg);
      return;
    }
  }

  console.log('🎯 Testing Login:\n');
  console.log('1. Open: http://localhost:3000/login');
  console.log(`2. Enter Username: ${username}`);
  console.log(`3. Enter Password: ${password}`);
  console.log('4. Click Sign In');
  console.log('5. Should redirect to: http://localhost:3000/dashboard\n');

  console.log('⚠️  If login fails:');
  console.log('   Check browser Console (F12) for error');
  console.log('   Options:');
  console.log('   1. "Invalid username or password" = password hash issue');
  console.log('   2. "InvalidSecret" = JWT key mismatch');
  console.log('   3. Network error = dev server not running\n');

  console.log('=' .repeat(60) + '\n');
}

createTestAccount().catch(console.error);
