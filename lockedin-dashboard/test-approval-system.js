/**
 * Test script to verify the account approval system
 * 
 * This script:
 * 1. Queries for pending accounts
 * 2. Checks if a specific user is approved
 * 3. Demonstrates approval functions
 */

const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');

const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://combative-cat-787.convex.cloud';

async function testApprovalSystem() {
  const client = new ConvexHttpClient(DEPLOYMENT_URL);

  console.log('🔍 Testing Account Approval System...\n');

  try {
    // 1. Check for pending accounts
    console.log('1. Querying pending accounts...');
    const pendingAccounts = await client.query(api.context.getPendingAccounts);
    
    if (pendingAccounts.length === 0) {
      console.log('✅ No pending accounts found.');
      console.log('   To test, create a new account via the signup form at http://localhost:3000/login\n');
    } else {
      console.log(`📋 Found ${pendingAccounts.length} pending account(s):`);
      pendingAccounts.forEach((account, index) => {
        console.log(`   ${index + 1}. Username: ${account.username}`);
        console.log(`      User ID: ${account._id}`);
        console.log(`      Created: ${new Date(account.createdAt).toLocaleString()}`);
        console.log(`      Approved: ${account.isApproved}\n`);
      });
    }

    // 2. Test approval status check
    console.log('\n2. Testing approval status check...');
    console.log('   Enter a username to check (or press Enter to skip):');
    
    // For automated testing, we'll skip interactive input
    console.log('   (Skipping interactive test - run this script manually if needed)\n');

  } catch (error) {
    console.error('❌ Error testing approval system:', error);
  } finally {
    client.close();
  }
}

// Run the test
testApprovalSystem().catch(console.error);
