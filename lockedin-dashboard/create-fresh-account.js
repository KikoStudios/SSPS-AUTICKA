/**
 * Create Fresh Test Account - Fixed Version
 * Creates a new test account with the corrected account insertion
 * Run: node create-fresh-account.js
 */

const { ConvexHttpClient } = require('convex/browser');

const CONVEX_URL = 'https://combative-cat-787.convex.cloud';

async function createFreshAccount() {
  console.log('\n🔐 Create Fresh Test Account (Fixed)\n');
  console.log('=' .repeat(60));
  
  // Use a fresh username to avoid conflicts
  const timestamp = Date.now();
  const username = `admin${timestamp}`;
  const password = 'Password@123';

  console.log(`Creating account with corrected schema...\n`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}\n`);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log('📝 Inserting into database...');

    const userId = await client.action('context:createUserAction', {
      username,
      password,
      usrData: JSON.stringify({
        role: 'admin',
        permissions: ['all'],
        isActive: true
      })
    });

    console.log('✅ Account created successfully!\n');
    console.log(`📋 Login Credentials:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${userId}\n`);

    console.log('🎯 Next Steps:');
    console.log('1. Open: http://localhost:3000/login');
    console.log(`2. Enter Username: ${username}`);
    console.log(`3. Enter Password: ${password}`);
    console.log('4. Click Sign In');
    console.log('5. Should redirect to /dashboard\n');

    console.log('⚠️  If login still fails:');
    console.log('   Check console error message');
    console.log('   Common issues:');
    console.log('   - "InvalidAccountId" = Account data mismatch');
    console.log('   - "Invalid username..." = Password hash issue\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('(Account already exists - you can use it for testing)\n');
    }
  }

  console.log('=' .repeat(60) + '\n');
}

createFreshAccount().catch(console.error);
