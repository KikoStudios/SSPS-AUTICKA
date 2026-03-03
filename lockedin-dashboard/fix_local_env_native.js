const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

console.log("🔧 Fixing .env.local (Native Crypto)...");

try {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
    });

    // Export Private Key to PKCS#8 PEM
    const privateKeyPEM = privateKey.export({
        type: 'pkcs8',
        format: 'pem'
    });

    // Export Public Key to JWK
    const jwk = publicKey.export({
        format: 'jwk'
    });

    const fullJwk = {
        use: 'sig',
        alg: 'RS256',
        ...jwk
    };

    const oneLineKey = privateKeyPEM.replace(/\n/g, '\\n');
    const jwksString = JSON.stringify({ keys: [fullJwk] });

    // Read/Update .env.local
    let envContent = "";
    if (fs.existsSync('.env.local')) {
        envContent = fs.readFileSync('.env.local', 'utf8');
    }

    let lines = envContent.split('\n');
    lines = lines.filter(line => !line.startsWith('JWT_PRIVATE_KEY=') && !line.startsWith('JWKS='));

    lines.push(`JWT_PRIVATE_KEY="${oneLineKey}"`);
    lines.push(`JWKS='${jwksString}'`);

    const newContent = lines.filter(l => l.trim() !== '').join('\n') + '\n';
    fs.writeFileSync('.env.local', newContent);

    console.log("✅ .env.local updated with new valid keys (Native Crypto).");
    console.log("Please restart your dev server: Ctrl+C and npm run dev");
} catch (error) {
    console.error("❌ Error:", error);
}
