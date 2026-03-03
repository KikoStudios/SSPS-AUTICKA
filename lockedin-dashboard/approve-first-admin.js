/**
 * Approve First Admin
 * 
 * Run this after creating the first account via signup form
 * Usage: node approve-first-admin.js <username>
 * Example: node approve-first-admin.js admin
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

async function approveFirstAdmin() {
  const username = process.argv[2] || 'admin';
  
  const client = new ConvexHttpClient(DEPLOYMENT_URL);

  console.log('\n🔧 Approving First Admin\n');
  console.log('Username:', username);
  console.log('Deployment:', DEPLOYMENT_URL);
  console.log('=' .repeat(60));

  try {
    // Get all users to find the one we want to approve
    const pendingAccounts = await client.query(api.context.getPendingAccounts, {});
    
    if (pendingAccounts.length === 0) {
      console.log('❌ No pending accounts found.');
      console.log('   Either the account is already approved or does not exist.\n');
      return;
    }

    console.log(`\n📋 Found ${pendingAccounts.length} pending account(s):`);
    pendingAccounts.forEach((acc, i) => {
      console.log(`   ${i + 1}. ${acc.username} (${acc._id})`);
    });

    // Find the specified username
    const normalizedUsername = username.trim().toLowerCase();
    const targetUser = pendingAccounts.find((acc) =>
      String(acc.username || '').trim().toLowerCase() === normalizedUsername
    );
    
    if (!targetUser) {
      console.log(`\n❌ User "${username}" not found in pending accounts.`);
      console.log('   Available usernames:', pendingAccounts.map(a => a.username).join(', '));
      console.log('\n   Usage: node approve-first-admin.js <username>\n');
      return;
    }

    console.log(`\n📋 Approving "${targetUser.username}"...`);
    
    // Approve the user
    await client.mutation(api.context.approveAccount, { userId: targetUser._id });
    
    console.log('✅ Account approved!\n');
    console.log('=' .repeat(60));
    console.log('You can now log in at: http://localhost:3000/login');
    console.log(`Username: ${username}`);
    console.log('=' .repeat(60));
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
}

approveFirstAdmin().catch(console.error);
