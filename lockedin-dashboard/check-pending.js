/**
 * Check user approval status
 */

const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');

const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://modest-pig-521.convex.cloud';

async function checkUsers() {
  const client = new ConvexHttpClient(DEPLOYMENT_URL);

  try {
    const pending = await client.query(api.context.getPendingAccounts, {});
    console.log('\n📋 Pending Approvals:');
    console.log(JSON.stringify(pending, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
}

checkUsers().catch(console.error);
