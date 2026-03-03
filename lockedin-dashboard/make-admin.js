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
  const username = process.argv[2] || 'admin';

  console.log(`\n🔧 Making ${username} an admin\n`);
  console.log('Deployment:', deploymentUrl);
  console.log('='.repeat(60));

  try {
    // Get user by username
    const user = await client.query(api.context.getUserByUsername, { username });
    if (!user) {
      console.log(`❌ User "${username}" not found`);
      return;
    }

    console.log(`Found user: ${user.username}`);
    console.log(`Current role: ${user.usrData ? JSON.parse(user.usrData).role || 'none' : 'none'}`);

    // Update user data to set role as admin
    const usrData = user.usrData ? JSON.parse(user.usrData) : {};
    usrData.role = 'admin';
    
    await client.action(api.context.updateUserAction, {
      userId: user._id.toString(),
      username: user.username,
      usrData: JSON.stringify(usrData),
    });

    console.log(`✅ ${username} is now admin!\n`);
    console.log('='.repeat(60));
    console.log('Refresh your dashboard to see admin tools.');
    console.log('='.repeat(60));
    console.log();

  } catch (error) {
    console.error('❌ Error:', error?.message || error);
  }
}

run().catch(console.error);
