const fs = require('fs');

try {
    const data = fs.readFileSync('.env.local', 'utf8');
    const lines = data.split('\n');
    const keyLine = lines.find(l => l.startsWith('JWT_PRIVATE_KEY='));

    if (keyLine) {
        console.log("FOUND JWT_PRIVATE_KEY line.");
        let val = keyLine.substring(16); // Remove JWT_PRIVATE_KEY=
        // Remove quotes if present
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);

        console.log("Raw value length:", val.length);
        console.log("Starts with:", val.substring(0, 30));
        console.log("Contains literal \\n:", val.includes('\\n'));
        console.log("Contains actual newline:", val.includes('\n'));

        // Reconstruct
        const realKey = val.replace(/\\n/g, '\n');
        console.log("Reconstructed Start:", realKey.substring(0, 30));

        if (realKey.includes('-----BEGIN PRIVATE KEY-----')) {
            console.log("✅ HEADER FOUND (PKCS#8)");
        } else {
            console.log("❌ HEADER MISSING (Likely corrupted or wrong format)");
        }
    } else {
        console.log("❌ JWT_PRIVATE_KEY NOT FOUND in .env.local");
    }

} catch (e) {
    console.error("Error reading file:", e);
}
