const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const privatePath = path.join(__dirname, 'jwt-private.pem');
const publicPath = path.join(__dirname, 'jwt-public.pem');

fs.writeFileSync(privatePath, privateKey, 'utf8');
fs.writeFileSync(publicPath, publicKey, 'utf8');

console.log('Generated new JWT keypair');
console.log('Private key file:', privatePath);
console.log('Public key file:', publicPath);
console.log('\nPaste this PRIVATE key into Convex env var JWT_PRIVATE_KEY:\n');
console.log(privateKey);
