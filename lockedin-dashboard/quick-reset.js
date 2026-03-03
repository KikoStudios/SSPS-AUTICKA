/**
 * Quick Reset - Clear DB and Create Default Admin
 * 
 * Creates admin account:
 * Username: admin
 * Password: Admin@123
 */

const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');
const fs = require('fs');
const path = require('path');

function getDeploymentUrl() {
  if (process.env.NEXT_PUBLIC_CONVEX_URL) {
    return process.env.NEXT_PUBLIC_CONVEX_URL;
  }

  const envLocalPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const match = envContent.match(/^NEXT_PUBLIC_CONVEX_URL=(.+)$/m);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'https://modest-pig-521.convex.cloud';
}

const DEPLOYMENT_URL = getDeploymentUrl();

async function quickReset() {
  const client = new ConvexHttpClient(DEPLOYMENT_URL);

  console.log('\n🔧 Quick Database Reset\n');
  console.log('Deployment:', DEPLOYMENT_URL);
  console.log('=' .repeat(60));

  try {
    // Step 1: Clear all data
    console.log('📋 Clearing all authentication data...');
    const clearResult = await client.action(api.context.clearAllAuthDataAction, {});
    console.log('✅', clearResult.message);
    console.log(`   - Deleted ${clearResult.usersDeleted} users`);
    console.log(`   - Deleted ${clearResult.accountsDeleted} accounts`);
    console.log(`   - Deleted ${clearResult.sessionsDeleted} sessions\n`);

    // Step 2: Create default admin
    console.log('📋 Creating default admin account...');
    const createResult = await client.action(api.context.createUserAction, {
      username: 'admin',
      password: 'Admin@123',
      usrData: JSON.stringify({
        role: 'admin',
        isApproved: true,
        createdAt: Date.now(),
      }),
    });

    if (createResult.success) {
      console.log('✅ Admin account created!\n');
      console.log('=' .repeat(60));
      console.log('Login Credentials:');
      console.log('  Username: admin');
      console.log('  Password: Admin@123');
      console.log('  URL:      http://localhost:3000/login');
      console.log('=' .repeat(60));
      console.log('\n🚀 Ready to use!\n');
    } else {
      console.log('❌ Error:', createResult.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message || error);
    console.error('\nFull error:', error);
  }
}

quickReset().catch(console.error);
