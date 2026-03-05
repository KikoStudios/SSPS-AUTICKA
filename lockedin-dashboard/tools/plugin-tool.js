/**
 * LockedIN Dashboard - Fiber Plugin Tool
 * 
 * A unified CLI for managing the Fiber plugin ecosystem.
 * 
 * Usage: node plugin-tool.js [command] [args]
 * Use --help for documentation.
 */

const { ConvexHttpClient } = require('convex/browser');
const fs = require('fs');
const path = require('path');

// Configuration
function getEnvConfig() {
    const config = {
        convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL || 'https://modest-pig-521.convex.cloud'
    };

    const envLocalPath = path.join(__dirname, '..', '.env.local');
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
    'sync': {
        description: 'Automatically scans and registers all plugin endpoints with Convex',
        usage: '',
        fn: async () => {
            console.log('🔧 Syncing plugin endpoints from manifests...');
            try {
                const result = await convex.action('context:syncPluginEndpoints', {});
                if (result.success) {
                    console.log(`✅ Sync completed! Updated: ${result.updated}, Total: ${result.total}`);
                } else {
                    console.error('❌ Sync failed:', result.message);
                }
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    },
    'update': {
        description: 'Refreshes the manifest and endpoints for a specific plugin',
        usage: '<pluginName>',
        fn: async ([pluginName]) => {
            if (!pluginName) {
                console.error('❌ Missing plugin name.');
                return;
            }
            console.log(`📦 Updating plugin: ${pluginName}...`);
            try {
                // Find manifest in common locations
                const manifestLocations = [
                    (`./test-plugin-files/${pluginName}/manifest.json`),
                    (`./plugins/${pluginName}/manifest.json`)
                ];
                
                let manifest = null;
                for (const loc of manifestLocations) {
                    const fullPath = path.join(__dirname, '..', loc);
                    if (fs.existsSync(fullPath)) {
                        manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                        break;
                    }
                }

                if (!manifest) {
                    console.error(`❌ Manifest for "${pluginName}" not found.`);
                    return;
                }

                const plugin = await convex.query('context:getPluginByName', { name: pluginName });
                if (!plugin) {
                    console.error(`❌ Plugin "${pluginName}" not found in database.`);
                    return;
                }

                await convex.mutation('context:updatePlugin', {
                    pluginId: plugin._id,
                    author: manifest.author || plugin.author,
                    version: manifest.version || plugin.version,
                    description: manifest.description || plugin.description,
                    uploadDate: Date.now(),
                    apiEndpoints: manifest.apiEndpoints || []
                });
                console.log(`✅ Plugin "${pluginName}" updated with ${manifest.apiEndpoints?.length || 0} endpoints.`);
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        }
    },
    'list': {
        description: 'Displays all published plugins and their current status',
        usage: '',
        fn: async () => {
            console.log('🌐 Published Plugins:');
            try {
                const plugins = await convex.query('context:getAllPlugins', {});
                console.table(plugins.map(p => ({
                    Name: p.name,
                    Version: p.version,
                    Author: p.author,
                    Endpoints: (p.apiEndpoints || []).length
                })));
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
        console.log('\n🔌 LockedIN Dashboard Plugin Tool\n');
        console.log('Usage: node plugin-tool.js <command> [args]\n');
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
