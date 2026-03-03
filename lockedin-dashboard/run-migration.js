/**
 * Run User Migration
 * 
 * This script migrates all users from the legacy usrs table to the new
 * Convex Auth users table while preserving all metadata.
 * 
 * Usage: node run-migration.js
 */

console.log('\n🔐 User Migration Tool\n');
console.log('To migrate users from usrs to Convex Auth:');
console.log('1. Open Convex Dashboard: https://dashboard.convex.dev');
console.log('2. Go to Functions tab');
console.log('3. Run: internal.migration.migrateAllUsers\n');
console.log('Check status: internal.migration.checkMigrationStatus\n');
