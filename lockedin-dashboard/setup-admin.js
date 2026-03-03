/**
 * Setup Script for Creating Initial Admin User
 * 
 * This script helps you create the first admin user for the LockedIN Dashboard
 * using Convex Auth.
 * 
 * IMPORTANT: You must create users through the UI or use the Convex Auth signIn function.
 * This script provides guidance on how to do that.
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n' + '='.repeat(80));
console.log('LockedIN Dashboard - Initial Admin User Setup');
console.log('='.repeat(80) + '\n');

console.log('IMPORTANT: With Convex Auth, users are created through the authentication flow.\n');
console.log('To create your first admin user, follow these steps:\n');

console.log('Option 1: Use the Login Page (Recommended)');
console.log('-------------------------------------------');
console.log('1. Start your development server: npm run dev');
console.log('2. Navigate to: http://localhost:3000/login');
console.log('3. Enter your email and password');
console.log('4. The system will automatically create a new user on first login\n');

console.log('Option 2: Use Convex Dashboard');
console.log('-------------------------------');
console.log('1. Go to your Convex Dashboard: https://dashboard.convex.dev');
console.log('2. Open the Functions tab');
console.log('3. Run the following in a mutation:');
console.log(`
   import { signIn } from "@convex-dev/auth/server";
   
   // This creates a new user
   await signIn({ provider: "password", params: { 
     email: "admin@example.com",
     password: "YourSecurePassword123!",
     flow: "signUp"
   }});
`);

console.log('\nOption 3: Manual User Creation in Database');
console.log('-------------------------------------------');
console.log('Note: This is more complex and not recommended for production.\n');

console.log('\nAfter Creating Your User:');
console.log('-------------------------');
console.log('1. Log in through the /login page');
console.log('2. You will be redirected to /dashboard');
console.log('3. All API calls will now require valid authentication\n');

console.log('\nSecurity Notes:');
console.log('---------------');
console.log('✓ All secured API endpoints require authentication');
console.log('✓ JWT tokens are automatically managed by Convex Auth');
console.log('✓ Sessions expire after inactivity');
console.log('✓ No more public access to database functions\n');

console.log('For more information, see: CONVEX_AUTH_MIGRATION.md\n');

rl.question('Press Enter to continue or type "help" for more options: ', (answer) => {
    if (answer.toLowerCase() === 'help') {
        console.log('\nAdditional Resources:');
        console.log('--------------------');
        console.log('- Convex Auth Documentation: https://labs.convex.dev/auth');
        console.log('- Password Provider Setup: https://labs.convex.dev/auth/config/passwords');
        console.log('- Migration Guide: ./CONVEX_AUTH_MIGRATION.md\n');
    }

    console.log('\nSetup Complete! You can now create your admin user.\n');
    rl.close();
});
