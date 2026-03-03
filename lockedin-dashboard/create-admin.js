/**
 * Script to create an admin account using Convex mutations
 * 
 * Before running this script:
 * 1. Make sure your Convex deployment is running (`npx convex dev`)
 * 2. Set your CONVEX_URL environment variable or replace the URL below
 * 3. Ensure your Convex functions are deployed (`npx convex deploy`)
 * 
 * To run this script:
 * node create-admin.js
 */

const { ConvexHttpClient } = require("convex/browser");

// Configuration
const CONVEX_URL = process.env.CONVEX_URL || "https://modest-pig-521.convex.cloud";
const ADMIN_USERNAME = "test-usr";
const ADMIN_PASSWORD = "testtest";

async function createAdminAccount() {
  console.log("🚀 Starting admin account creation...");
  console.log(`📡 Connecting to Convex at: ${CONVEX_URL}`);
  
  try {
    // Initialize Convex client
    const client = new ConvexHttpClient(CONVEX_URL);
    
    console.log("👤 Creating admin account...");
    
    // Call the createUserAction action
    const result = await client.action("context:createUserAction", {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      usrData: JSON.stringify({
        role: "admin",
        createdAt: new Date().toISOString(),
        permissions: ["read", "write", "delete", "admin"],
        isActive: true
      })
    });
    
    console.log("✅ Admin account created successfully!");
    console.log("📋 Account Details:");
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: admin`);
    console.log(`   Created: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error("❌ Error creating admin account:", error.message);
    
    // Handle specific error cases
    if (error.message.includes("UNIQUE constraint failed") || error.message.includes("duplicate")) {
      console.log("ℹ️  Admin account already exists!");
      console.log("   You can try logging in with:");
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else if (error.message.includes("fetch") || error.message.includes("network")) {
      console.log("🔧 Troubleshooting:");
      console.log("   1. Make sure your Convex deployment is running (`npx convex dev`)");
      console.log("   2. Check that your CONVEX_URL is correct");
      console.log("   3. Ensure your Convex functions are deployed (`npx convex deploy`)");
      console.log("   4. Verify your internet connection");
    } else if (error.message.includes("action") || error.message.includes("function")) {
      console.log("🔧 Function Error:");
      console.log("   1. Make sure the 'context:createUserAction' action exists");
      console.log("   2. Check that your Convex functions are deployed");
      console.log("   3. Verify the action name is correct");
    }
    
    process.exit(1);
  }
}

// Check if CONVEX_URL is properly configured
if (CONVEX_URL === "https://your-convex-deployment-url.convex.cloud") {
  console.log("⚠️  Warning: Please set your CONVEX_URL environment variable or update the URL in this script");
  console.log("   You can find your Convex URL by running: npx convex dev");
  console.log("   Or set it as an environment variable: CONVEX_URL=your-url node create-admin.js");
  console.log("");
}

// Run the function
createAdminAccount();