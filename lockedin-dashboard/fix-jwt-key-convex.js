/**
 * Fix JWT Key - Convex Dashboard Version
 * 
 * This script generates a properly formatted JWT key for the Convex Dashboard.
 * The key will NOT have escaped newlines, which prevents atob errors.
 */

const crypto = require('crypto');
const fs = require('fs');

console.log('🔑 Generating Clean JWT Private Key for Convex Dashboard...\n');

// Generate RSA-2048 keypair
const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('✅ Generated new RSA-2048 keypair\n');

// Show the key in proper format (with actual newlines, not escaped)
console.log('📋 Copy this EXACT key to Convex Dashboard:');
console.log('   (Go to: https://dashboard.convex.dev → Your deployment → Settings → Environment Variables)');
console.log('   Variable Name: JWT_PRIVATE_KEY');
console.log('   Variable Value: (paste the key below)\n');
console.log('═══════════════════════════════════════════════════════════');
console.log(privateKey);
console.log('═══════════════════════════════════════════════════════════\n');

// Also update .env.local with proper escaping for Node.js
const escapedKey = privateKey.replace(/\n/g, '\\n');
const envContent = `NEXT_PUBLIC_CONVEX_URL=https://combative-cat-787.convex.cloud
JWT_PRIVATE_KEY="${escapedKey}"
`;

fs.writeFileSync('.env.local', envContent);
console.log('✅ Updated .env.local with properly escaped key\n');

console.log('⚠️  IMPORTANT STEPS:');
console.log('1. Copy the key shown above (everything between the equals signs)');
console.log('2. Go to: https://dashboard.convex.dev');
console.log('3. Select your deployment: combative-cat-787');
console.log('4. Navigate to: Settings → Environment Variables');
console.log('5. Edit or create JWT_PRIVATE_KEY');
console.log('6. Paste the key EXACTLY as shown above');
console.log('7. Save the environment variable');
console.log('8. Redeploy: npx convex deploy --yes\n');

console.log('💡 TIP: When pasting into Convex Dashboard, the key should have');
console.log('   actual line breaks (newlines), NOT the text "\\n".\n');
