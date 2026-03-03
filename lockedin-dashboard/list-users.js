/**
 * List Existing Users Script
 * 
 * This script lists all usernames in the database to help identify accounts.
 * Run: node list-users.js
 */

const { ConvexHttpClient } = require('convex/browser');

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://combative-cat-787.convex.cloud';

async function listUsers() {
  console.log('\n📋 Listing Existing Users\n');
  console.log('=' .repeat(60));
  console.log(`Connecting to: ${CONVEX_URL}\n`);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Try to query for users (you may need to create this query)
    console.log('⏳ Fetching users from database...\n');
    
    // Check if we can access debug functions
    try {
      const env = await client.query('debug:getEnv');
      console.log('✅ Connected to Convex successfully\n');
    } catch (e) {
      console.log('⚠️  Debug functions not available, but connection works\n');
    }

    // We need a public query to list users
    // For now, let's just verify the system is working
    const hasUsers = await client.query('publicApi:hasAnyUsers');
    console.log(`Users exist in database: ${hasUsers ? 'YES' : 'NO'}\n`);

    if (hasUsers) {
      console.log('ℹ️  User listing requires additional query function.');
      console.log('   Default test account should be:');
      console.log('   Username: test-usr');
      console.log('   Password: testtest\n');
      console.log('   Try logging in at: http://localhost:3000/login\n');
    } else {
      console.log('⚠️  No users found. Create one at http://localhost:3000/login\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('InvalidSecret')) {
      console.log('\n⚠️  Authentication not properly configured.');
      console.log('   Run: node fix-jwt-clean.js');
    }
  }
}

listUsers().catch(console.error);
