const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');
const fs = require('fs');
const path = require('path');

function getDeploymentUrl() {
  if (process.env.NEXT_PUBLIC_CONVEX_URL) return process.env.NEXT_PUBLIC_CONVEX_URL;

  const envLocalPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const match = envContent.match(/^NEXT_PUBLIC_CONVEX_URL=(.+)$/m);
    if (match && match[1]) return match[1].trim();
  }

  return 'https://modest-pig-521.convex.cloud';
}

async function run() {
  const deploymentUrl = getDeploymentUrl();
  const client = new ConvexHttpClient(deploymentUrl);

  console.log('\n🧨 Full DEV DB wipe\n');
  console.log('Deployment:', deploymentUrl);
  console.log('='.repeat(60));

  const result = await client.action(api.context.clearAllDataAction, {});
  console.log(result.message);
  for (const [tableName, count] of Object.entries(result.deleted || {})) {
    console.log(`- ${tableName}: ${count}`);
  }
  console.log('='.repeat(60));
}

run().catch((error) => {
  console.error('❌ Error:', error?.message || error);
  process.exit(1);
});
