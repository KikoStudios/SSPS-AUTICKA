/**
 * NUCLEAR OPTION: Clear All Authentication Data
 * 
 * This script deletes ALL users and accounts:
 * - users table (Convex Auth)
 * - authAccounts table (Convex Auth)
 * - authSessions table (Convex Auth)
 * 
 * WARNING: This will log out everyone and delete all authentication data!
 * 
 * Run: node clear-all-auth.js
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

async function clearAllAuth() {
  console.log('\n🚨 CLEAR ALL AUTHENTICATION DATA\n');
  console.log('=' .repeat(60));
  console.log('WARNING: This will DELETE ALL users and authentication data!');
  console.log('Tables affected:');
  console.log('  - users');
  console.log('  - authAccounts');
  console.log('  - authSessions');
  console.log('=' .repeat(60));

  const confirm = await question('\nType "yes" to confirm: ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('\n❌ Cancelled. No data deleted.\n');
    rl.close();
    return;
  }

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log('\n⏳ Deleting all authentication data...\n');

    // Call action to clear all auth tables
    const result = await client.action('context:clearAllAuthDataAction');

    console.log('✅ All authentication data cleared!\n');
    console.log('📊 Deletion Summary:');
    console.log(`   Users deleted: ${result.usersDeleted}`);
    console.log(`   Accounts deleted: ${result.accountsDeleted}`);
    console.log(`   Sessions deleted: ${result.sessionsDeleted}\n`);

    console.log('🎯 Next Steps:');
    console.log('1. Create a fresh test account');
    console.log('   Run: node create-fresh-account.js\n');
    console.log('2. Test login at http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nNote: Make sure dev server is running and deployer has fresh code.\n');
  }

  console.log('=' .repeat(60) + '\n');
  rl.close();
}

clearAllAuth().catch(console.error);
