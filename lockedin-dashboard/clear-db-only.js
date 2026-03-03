/**
 * Clear Database Only - No Account Creation
 */

const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');

const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://modest-pig-521.convex.cloud';

async function clearOnly() {
  const client = new ConvexHttpClient(DEPLOYMENT_URL);

  console.log('\n🗑️  Clearing Database\n');
  console.log('=' .repeat(60));

  try {
    console.log('📋 Clearing all authentication data...');
    const clearResult = await client.action(api.context.clearAllAuthDataAction, {});
    console.log('✅', clearResult.message);
    console.log(`   - Deleted ${clearResult.usersDeleted} users`);
    console.log(`   - Deleted ${clearResult.accountsDeleted} accounts`);
    console.log(`   - Deleted ${clearResult.sessionsDeleted} sessions\n`);
    console.log('=' .repeat(60));
    console.log('\n✅ Database cleared!\n');

  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
}

clearOnly().catch(console.error);
