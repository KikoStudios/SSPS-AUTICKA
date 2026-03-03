const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const { spawnSync } = require('child_process');

// Try to require jose, fallback to crypto if needed but we verified jose works
// const jose = require('jose'); // Likely fails if ESM

console.log("🛠️ Repairing .env.local and refreshing keys...");

(async () => {
    try {
        const jose = await import('jose');
        // 1. Recover existing public vars
        let existingContent = "";
        try {
            existingContent = fs.readFileSync('.env.local', 'utf8');
        } catch (e) {
            console.log("No existing .env.local found.");
        }

        // naive parsing to recover lines that look like valid env vars and aren't our keys
        const lines = existingContent.split('\n');
        const preservedLines = [];
        for (const line of lines) {
            const trimmed = line.trim();
            // preserve generic vars, ignore binary garbage (often starts with null bytes or weird chars)
            // check if line starts with uppercase letters and has =
            if (/^[A-Z_]+=.+/.test(trimmed)) {
                if (!trimmed.startsWith('JWT_PRIVATE_KEY') && !trimmed.startsWith('JWKS')) {
                    preservedLines.push(trimmed);
                }
            }
        }

        console.log(`Recovered ${preservedLines.length} environment variables.`);

        // 2. Generate NEW Keys
        const { privateKey, publicKey } = await jose.generateKeyPair('RS256');
        const privateKeyPEM = await jose.exportPKCS8(privateKey);
        const jwk = await jose.exportJWK(publicKey);

        const alg = "RS256";
        const jwks = { keys: [{ use: "sig", ...jwk, alg }] };
        const jwksString = JSON.stringify(jwks);

        // 3. Write Clean .env.local
        // Escape newlines for the file
        const onelineKey = privateKeyPEM.replace(/\n/g, '\\n');

        const newLines = [
            ...preservedLines,
            `JWT_PRIVATE_KEY="${onelineKey}"`,
            `JWKS='${jwksString}'`
        ];

        fs.writeFileSync('.env.local', newLines.join('\n') + '\n', 'utf8');
        console.log("✅ .env.local rewritten with clean UTF-8 encoding.");

        // 4. Force Set on Cloud
        console.log("☁️ Attempting to push to Convex Cloud...");

        // We use the PEM as-is for the cloud command?
        // npx convex env set JWT_PRIVATE_KEY "..." 
        // passing multiline to spawn is risky.
        // Let's rely on the file + user restart primarily, but try one simple set for JWKS

        const ret1 = spawnSync('npx', ['convex', 'env', 'set', 'JWKS', jwksString], { stdio: 'inherit', shell: true });

        // For private key, let's try passing the oneline version? No, Convex usually wants the real newlines.
        // But if we put it in .env as oneline with \n, convex dev expands it?
        // Actually, for `convex env set`, we should pass the real string.
        // The issue is Windows command line argument parsing.

        console.log("⚠️ NOTE: You MUST restart 'npm run dev' to sync the new private key to the backend!");

    } catch (e) {
        console.error("FAILED:", e);
    }
})();
