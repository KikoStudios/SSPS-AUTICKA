import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Plugin API Handler
 * 
 * Handles API calls to plugin endpoints from external applications
 */

/**
 * Handle plugin API call
 * 
 * This mutation is called from the Next.js API route and executes
 * the plugin's API handler function
 */
export const handlePluginApiCall = mutation({
  args: {
    pluginAlias: v.string(),
    endpoint: v.string(),
    method: v.string(),
    body: v.union(v.string(), v.null()),
    queryParams: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { pluginAlias, endpoint, method, body, queryParams, apiKey } = args;

    // Store the API call data in plugin data for processing by the plugin
    const callId = `apicall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const callData = {
      pluginAlias,
      endpoint,
      method,
      body: body ? JSON.parse(body) : null,
      queryParams: JSON.parse(queryParams),
      apiKey,
      timestamp: Date.now(),
      status: 'pending',
    };

    // Store the API call request
    await ctx.db.insert("pluginData", {
      pluginName: pluginAlias,
      key: `api_call_${callId}`,
      value: JSON.stringify(callData),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Note: The actual plugin handler will process this call and update the response
    // For now, we return a basic structure that plugins can customize
    return {
      success: true,
      message: `API call to ${pluginAlias}/${endpoint} received`,
      callId,
      data: {
        pluginAlias,
        endpoint,
        method,
        timestamp: Date.now(),
      },
    };
  },
});

/**
 * Get API call result
 * 
 * Allows checking the result of an API call by its ID
 */
export const getApiCallResult = mutation({
  args: {
    callId: v.string(),
  },
  handler: async (ctx, args) => {
    const { callId } = args;

    // Query plugin data for the call result
    const result = await ctx.db
      .query("pluginData")
      .filter((q) => q.eq(q.field("key"), `api_call_${callId}`))
      .first();

    if (!result) {
      return null;
    }

    try {
      return JSON.parse(result.value);
    } catch {
      return null;
    }
  },
});
