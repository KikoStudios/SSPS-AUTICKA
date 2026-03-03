/**
 * Clear Database and Create First Admin - Interactive Script
 * 
 * This script:
 * 1. Clears all auth data
 * 2. Creates a fresh admin account (auto-approved as first user)
 */

const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');
const readline = require('readline');

const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://combative-cat-787.convex.cloud';

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
  const client = new ConvexHttpClient(DEPLOYMENT_URL);

  console.log('\n🔧 Database Reset & Admin Creation\n');
  console.log('Connected to:', DEPLOYMENT_URL);
  console.log('=' .repeat(60));

  try {
    // Step 1: Clear all auth data
    console.log('\n📋 Step 1: Clearing all authentication data...');
    const confirm = await question('Type "yes" to delete all users and accounts: ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Cancelled.\n');
      rl.close();
      client.close();
      return;
    }

    // Call the clearAllAuthDataAction
    const result = await client.action(api.context.clearAllAuthDataAction, {});
    console.log('✅', result.message);
    console.log(`   - Deleted ${result.usersDeleted} users`);
    console.log(`   - Deleted ${result.accountsDeleted} auth accounts`);
    console.log(`   - Deleted ${result.sessionsDeleted} sessions`);

    // Step 2: Create first admin
    console.log('\n📋 Step 2: Creating first admin account...');
    const username = await question('Enter admin username: ');
    const password = await question('Enter admin password: ');

    if (!username || !password) {
      console.log('\n❌ Username and password required.\n');
      rl.close();
      client.close();
      return;
    }

    const createResult = await client.action(api.context.createUserAction, {
      username,
      password,
      userData: {
        role: 'admin',
        isApproved: true, // First admin is auto-approved
        createdAt: Date.now(),
      },
    });

    if (createResult.success) {
      console.log('\n✅ Admin account created successfully!');
      console.log(`   Username: ${username}`);
      console.log(`   Role: admin`);
      console.log(`   Status: Approved ✓`);
      console.log('\n🚀 You can now login at: http://localhost:3000/login\n');
    } else {
      console.log('\n❌ Error creating admin:', createResult.error);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    rl.close();
    client.close();
  }
}

main().catch(console.error);
