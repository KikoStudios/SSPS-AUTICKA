/**
 * Clean JWT Key Generator and Environment Fixer
 * 
 * This script generates a fresh RSA-2048 keypair for Convex Auth
 * and updates both local .env.local and provides the key for Convex Dashboard.
 * 
 * Run: node fix-jwt-clean.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔑 Convex Auth JWT Key Generator\n');
console.log('=' .repeat(60));

// Generate RSA-2048 keypair
console.log('⏳ Generating fresh RSA-2048 keypair...');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
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

console.log('✅ Keypair generated successfully\n');

// Validate private key format
if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
  console.error('❌ ERROR: Generated key has invalid format!');
  process.exit(1);
}

// Format private key with escaped newlines for environment variable
const privateKeyEscaped = privateKey.replace(/\n/g, '\\n');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '.env.local');
let envContent = '';
let convexUrl = '';

if (fs.existsSync(envLocalPath)) {
  console.log('📄 Found existing .env.local file');
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  
  // Extract NEXT_PUBLIC_CONVEX_URL if it exists
  const urlMatch = envContent.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
  if (urlMatch) {
    convexUrl = urlMatch[1].trim();
    console.log(`   Convex URL: ${convexUrl}`);
  }
} else {
  console.log('📄 Creating new .env.local file');
}

// Remove any existing JWT keys from .env.local
envContent = envContent
  .split('\n')
  .filter(line => !line.startsWith('JWT_PRIVATE_KEY=') && 
                  !line.startsWith('CONVEX_AUTH_PRIVATE_KEY=') &&
                  !line.startsWith('JWKS='))
  .join('\n')
  .trim();

// Add the new JWT_PRIVATE_KEY
const newEnvContent = `${envContent ? envContent + '\n\n' : ''}# JWT Private Key for Convex Auth (Generated: ${new Date().toISOString()})
JWT_PRIVATE_KEY="${privateKeyEscaped}"
${!convexUrl ? '\n# TODO: Add your Convex URL below\n# NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud\n' : ''}`;

// Write to .env.local
fs.writeFileSync(envLocalPath, newEnvContent.trim() + '\n', 'utf8');
console.log('✅ Updated .env.local with new JWT_PRIVATE_KEY\n');

// Display instructions
console.log('=' .repeat(60));
console.log('📋 NEXT STEPS - CRITICAL!\n');
console.log('1️⃣  SET IN CONVEX DASHBOARD:');
console.log('   → Go to: https://dashboard.convex.dev');
console.log('   → Select your project');
console.log('   → Settings → Environment Variables');
console.log('   → Add/Update: JWT_PRIVATE_KEY');
console.log('   → REMOVE any existing: JWKS, CONVEX_AUTH_PRIVATE_KEY\n');

console.log('2️⃣  COPY THIS VALUE TO CONVEX DASHBOARD:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(privateKeyEscaped);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('3️⃣  DEPLOY TO CONVEX:');
console.log('   Run: npx convex deploy\n');

console.log('4️⃣  VERIFY:');
console.log('   In Convex Dashboard → Functions → Run:');
console.log('   → Query: debug:getEnv');
console.log('   → Should show: JWT_PRIVATE_KEY.exists: true\n');

console.log('5️⃣  START DEV SERVER:');
console.log('   Run: npm run dev\n');

console.log('6️⃣  TEST LOGIN:');
console.log('   → Navigate to: http://localhost:3000/login');
console.log('   → No InvalidSecret error should appear');
console.log('   → Create first account via signup form\n');

console.log('=' .repeat(60));
console.log('✨ Key generation complete! Follow steps above to fix auth.');
console.log('=' .repeat(60));

// Also create a backup file with both keys for reference
const backupPath = path.join(__dirname, 'jwt-keys-backup.txt');
fs.writeFileSync(backupPath, `Generated: ${new Date().toISOString()}\n\n` +
  `PRIVATE KEY (for Convex Dashboard):\n${privateKey}\n\n` +
  `PRIVATE KEY (escaped for .env):\n${privateKeyEscaped}\n\n` +
  `PUBLIC KEY (for reference):\n${publicKey}\n`, 'utf8');

console.log(`\n💾 Backup saved to: jwt-keys-backup.txt`);
console.log(`   (Keep this file secure and delete after setup)\n`);
