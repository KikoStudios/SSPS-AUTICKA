const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://modest-pig-521.convex.cloud");

async function test() {
  console.log("Testing password verification...");
  try {
    const result = await client.action("context:debugTestPasswordVerify", {
      username: "test-usr",
      password: "testtest"
    });
    console.log("Test result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
