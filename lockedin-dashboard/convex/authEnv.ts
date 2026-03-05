
// This file must be imported BEFORE @convex-dev/auth/server
// to ensure environment variables are fixed before the library reads them.

// If JWT_PRIVATE_KEY is manually provided, clean it up and set it properly
if (process.env.JWT_PRIVATE_KEY) {
    let key = process.env.JWT_PRIVATE_KEY;

    // Clean up any encoding issues (quotes, backslashes, literal \n)
    const cleanup = (str: string) => {
        let s = str.trim();
        while (s.startsWith('"') || s.startsWith("'") || s.startsWith("\\") || s.startsWith("`")) {
            s = s.substring(1);
        }
        while (s.endsWith('"') || s.endsWith("'") || s.endsWith("\\") || s.endsWith("`")) {
            s = s.slice(0, -1);
        }

        // Replace literal \n with actual newlines
        s = s.replace(/\\n/g, '\n');

        // Convex env may store PEM as a single line with spaces.
        // Reconstruct a valid PEM block with real newlines when needed.
        const hasPemMarkers = s.includes('-----BEGIN PRIVATE KEY-----') && s.includes('-----END PRIVATE KEY-----');
        const hasRealNewline = s.includes('\n');
        if (hasPemMarkers && !hasRealNewline) {
            s = s.replace(/\s+/g, ' ').trim();
            s = s
                .replace('-----BEGIN PRIVATE KEY----- ', '-----BEGIN PRIVATE KEY-----\n')
                .replace(' -----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
        }

        return s;
    };

    key = cleanup(key);
    
    // Validate the key format
    if (!key.includes('BEGIN PRIVATE KEY') || !key.includes('END PRIVATE KEY')) {
        console.error("❌ JWT_PRIVATE_KEY does not contain proper PEM markers!");
    }

    // Set the cleaned key
    process.env.JWT_PRIVATE_KEY = key;
    process.env.CONVEX_AUTH_PRIVATE_KEY = key;

    // Keep JWKS intact - Convex Auth provider discovery requires it.
    // JWT_PRIVATE_KEY is used for signing, JWKS is used for discovery endpoint.
}
// Otherwise, Convex will auto-generate JWKS (recommended for development)
