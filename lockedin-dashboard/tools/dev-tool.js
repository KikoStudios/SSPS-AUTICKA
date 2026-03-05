/**
 * LockedIN Dashboard - Development & Auth Tool
 * 
 * A unified CLI for managing development environment, authentication, 
 * and database state.
 * 
 * Usage: node dev-tool.js [command] [args]
 * Use --help for documentation.
 */

const { ConvexHttpClient } = require('convex/browser');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

// Configuration
function getEnvConfig() {
    const config = {
        convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL || 'https://modest-pig-521.convex.cloud'
    };

    const envLocalPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envLocalPath)) {
        const envContent = fs.readFileSync(envLocalPath, 'utf8');
        const match = envContent.match(/^NEXT_PUBLIC_CONVEX_URL=(.+)$/m);
        if (match && match[1]) {
            config.convexUrl = match[1].trim();
        }
    }
    return config;
}

const config = getEnvConfig();
const convex = new ConvexHttpClient(config.convexUrl);

const commands = {
    // --- Authentication Commands ---
    'auth:create-admin': {
        description: 'Creates a new user and grants admin privileges',
        usage: '<username> <password>',
        fn: async ([username, password]) => {
            if (!username || !password) {
                console.error('❌ Missing username or password.');
                return;
            }
            console.log(`👤 Creating admin user: ${username}...`);
            try {
                // In Convex Auth, users are usually created via signup flow.
                // This tool assumes a mutation exists for emergency creation if needed, 
                // or guides the user to use the UI.
                console.log('💡 Note: Users should ideally be created via http://localhost:3000/login');
                console.log('   This tool will attempt to set the admin role for an existing user.');
                
                const users = await convex.query('context:getUsers', {});
                const user = users.find(u => u.username === username);
                
                if (!user) {
                    console.error(`❌ User "${username}" not found. Please sign up in the browser first.`);
                    return;
                }

                await convex.mutation('context:updateUserRole', { userId: user._id, role: 'admin' });
                console.log(`✅ User "${username}" is now an admin.`);
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    },
    'auth:approve': {
        description: 'Approves a pending user account',
        usage: '<username>',
        fn: async ([username]) => {
            if (!username) {
                console.error('❌ Missing username.');
                return;
            }
            console.log(`🔍 Approving user: ${username}...`);
            try {
                const pending = await convex.query('context:getPendingAccounts', {});
                const target = pending.find(acc => acc.username?.toLowerCase() === username.toLowerCase());
                
                if (!target) {
                    console.error(`❌ Pending user "${username}" not found.`);
                    return;
                }

                await convex.mutation('context:approveAccount', { userId: target._id });
                console.log(`✅ Account "${username}" approved.`);
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    },
    'auth:list': {
        description: 'Lists all users and their approval status',
        usage: '',
        fn: async () => {
            console.log('📋 Listing all users:');
            try {
                const users = await convex.query('context:getUsers', {});
                console.table(users.map(u => ({
                    ID: u._id,
                    Username: u.username || u.email || 'N/A',
                    Role: u.role,
                    Approved: u.isApproved ? '✅' : '❌'
                })));
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    },
    'auth:clear': {
        description: 'Deletes all users, accounts, and sessions',
        usage: '',
        fn: async () => {
            console.log('⚠️  Clearing all auth data...');
            try {
                await convex.mutation('context:clearAllAuthData', {});
                console.log('✅ Auth data cleared.');
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    },

    // --- Environment Commands ---
    'env:repair': {
        description: 'Automatically fixes common environment issues',
        usage: '',
        fn: async () => {
            console.log('🛠️  Repairing .env.local...');
            // Logic from repair_env.js (simplified)
            try {
                let currentEnv = '';
                if (fs.existsSync('.env.local')) {
                    currentEnv = fs.readFileSync('.env.local', 'utf8');
                }
                
                if (!currentEnv.includes('JWT_PRIVATE_KEY')) {
                    console.log('🔑 Generating new JWT keys...');
                    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
                    const escapedKey = privateKey.replace(/\n/g, '\\n');
                    fs.appendFileSync('.env.local', `\nJWT_PRIVATE_KEY="${escapedKey}"\n`);
                    console.log('✅ Added JWT_PRIVATE_KEY to .env.local');
                } else {
                    console.log('✅ JWT_PRIVATE_KEY already exists.');
                }
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    },
    'env:fix-jwt': {
        description: 'Generates and fixes JWT keys for Convex authentication',
        usage: '',
        fn: async () => {
            console.log('🔑 Generating clean JWT Private Key for Convex Dashboard...');
            const { privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });
            console.log('\n📋 Copy this EXACT key to Convex Dashboard (Settings -> Environment Variables):');
            console.log('Variable Name: JWT_PRIVATE_KEY');
            console.log('Value:\n');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(privateKey);
            console.log('═══════════════════════════════════════════════════════════\n');
            
            const escapedKey = privateKey.replace(/\n/g, '\\n');
            console.log('💡 For .env.local (escaped):');
            console.log(`JWT_PRIVATE_KEY="${escapedKey}"`);
        }
    },
    'env:check': {
        description: 'Validates the current environment configuration',
        usage: '',
        fn: async () => {
            console.log('🔍 Checking environment...');
            const required = ['NEXT_PUBLIC_CONVEX_URL', 'JWT_PRIVATE_KEY'];
            const envLocal = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
            
            required.forEach(v => {
                const exists = envLocal.includes(v) || process.env[v];
                console.log(`${exists ? '✅' : '❌'} ${v}`);
            });
        }
    },

    // --- Database Commands ---
    'db:reset': {
        description: 'Clears all data from the Convex database',
        usage: '',
        fn: async () => {
            console.log('⚠️  Resetting database...');
            try {
                await convex.mutation('context:resetDatabase', {});
                console.log('✅ Database reset complete.');
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    }
};

async function main() {
    const args = process.argv.slice(2);
    const commandName = args[0];

    if (!commandName || commandName === '--help' || commandName === '-h') {
        console.log('\n🚀 LockedIN Dashboard Dev Tool\n');
        console.log('Usage: node dev-tool.js <command> [args]\n');
        console.log('Commands:');
        Object.entries(commands).forEach(([name, cmd]) => {
            console.log(`  ${name.padEnd(20)} ${cmd.description}`);
            if (cmd.usage) console.log(`                       Usage: ${cmd.usage}`);
        });
        console.log('\n');
        return;
    }

    const command = commands[commandName];
    if (!command) {
        console.error(`❌ Unknown command: ${commandName}. Use --help for a list of commands.`);
        return;
    }

    try {
        await command.fn(args.slice(1));
    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

main();
