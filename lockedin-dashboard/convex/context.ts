import { mutation, action, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

// Action to hash password (can use bcryptjs here)
export const hashPassword = action({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    return await bcrypt.hash(args.password, 10);
  },
});

// Action to compare password (can use bcryptjs here)
export const comparePassword = action({
  args: {
    password: v.string(),
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    return await bcrypt.compare(args.password, args.hash);
  },
});

// Action to create user (combines hashing and database insertion)
export const createUserAction: any = action({
  args: {
    username: v.string(),
    password: v.string(),
    usrData: v.string(),
  },
  handler: async (ctx, args) => {
    const { username, password, usrData } = args;
    
    // Check if user already exists
    const existingUser = await ctx.runQuery((internal as any).context.getUserByUsername, { username });
    if (existingUser) {
      throw new Error("User already exists");
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const userId = await ctx.runMutation((internal as any).context.insertUser, {
      username,
      hashPassword: hashedPassword,
      usrData,
    });
    
    return userId;
  },
});

// Mutation to insert user (no bcryptjs here)
export const insertUser = mutation({
  args: {
    username: v.string(),
    hashPassword: v.string(),
    usrData: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("usrs", args);
  },
});

// Query to get user by username
export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("usrs")
      .withIndex("by_usrname", (q) => q.eq("username", args.username))
      .first();
  },
});

// Action to login user (combines comparison and database query)
export const loginUserAction: any = action({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const { username, password } = args;
    
    // Get user from database
    const usrExists = await ctx.runQuery((internal as any).context.getUserByUsername, { username });
    
    if (usrExists) {
      const passwordMatch = await bcrypt.compare(password, usrExists.hashPassword);
      if (passwordMatch) {
        return { success: true, userId: usrExists._id, usrData: usrExists.usrData };
      }
    }
    
    return { success: false, userId: null, usrData: null };
  },
});

// Legacy mutations for backward compatibility (if needed)
export const createUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    usrData: v.string(),
  },
  handler: async (ctx, args) => {
    // This will throw an error due to bcryptjs setTimeout issue
    // Use createUserAction instead
    throw new Error("Use createUserAction instead of createUser mutation");
  },
});

export const loginUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // This will throw an error due to bcryptjs setTimeout issue
    // Use loginUserAction instead
    throw new Error("Use loginUserAction instead of loginUser mutation");
  },
});

// Query to get all users (for admin)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("usrs").collect();
  },
});

// Action to delete user (for admin)
export const deleteUserAction = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation((internal as any).context.deleteUser, { userId: args.userId });
  },
});

// Mutation to delete user (for admin)
export const deleteUser = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId as any);
  },
});

// Action to update user (for admin)
export const updateUserAction = action({
  args: {
    userId: v.string(),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    usrData: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, username, password, usrData } = args;
    
    const updateData: any = { usrData };
    
    if (username) {
      updateData.username = username;
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.hashPassword = hashedPassword;
    }
    
    await ctx.runMutation((internal as any).context.updateUser, { userId, ...updateData });
  },
});

// Mutation to update user (for admin)
export const updateUser = mutation({
  args: {
    userId: v.string(),
    username: v.optional(v.string()),
    hashPassword: v.optional(v.string()),
    usrData: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, ...updateData } = args;
    await ctx.db.patch(userId as any, updateData);
  },
});

// Plugin upload mutations and actions
export const uploadPluginAction: any = action({
  args: {
    pluginName: v.string(),
    author: v.string(),
    version: v.string(),
    description: v.optional(v.string()),
    manifestFile: v.optional(v.string()), // base64 encoded
    coreFile: v.optional(v.string()), // base64 encoded
    iconFile: v.optional(v.string()), // base64 encoded
  },
  handler: async (ctx, args) => {
    const { pluginName, author, version, description, manifestFile, coreFile, iconFile } = args;
    
    // Validate file formats for uploaded files
    if (manifestFile) {
      const manifestValid = validateManifestFile(manifestFile);
      if (!manifestValid) {
        throw new Error("Invalid manifest file format. Must be valid JSON.");
      }
    }
    
    if (coreFile) {
      const coreValid = validateCoreFile(coreFile);
      if (!coreValid) {
        throw new Error("Invalid core file format. Must be valid JavaScript.");
      }
    }
    
    if (iconFile) {
      const iconValid = validateIconFile(iconFile);
      if (!iconValid) {
        throw new Error("Invalid icon file format. Must be valid SVG.");
      }
    }
    
    // Check if plugin already exists
    const existingPlugin = await ctx.runQuery((internal as any).context.getPluginByName, { name: pluginName });
    
    // Upload files to storage (only for files that were provided)
    let manifestFileId: any;
    let coreFileId: any;
    let iconFileId: any;
    
    try {
      if (manifestFile) {
        const manifestBytes = Uint8Array.from(atob(manifestFile), c => c.charCodeAt(0));
        manifestFileId = await ctx.storage.store(
          new Blob([manifestBytes], { type: 'application/json' })
        );
      }
      
      if (coreFile) {
        const coreBytes = Uint8Array.from(atob(coreFile), c => c.charCodeAt(0));
        coreFileId = await ctx.storage.store(
          new Blob([coreBytes], { type: 'application/javascript' })
        );
      }
      
      if (iconFile) {
        const iconBytes = Uint8Array.from(atob(iconFile), c => c.charCodeAt(0));
        iconFileId = await ctx.storage.store(
          new Blob([iconBytes], { type: 'image/svg+xml' })
        );
      }
    } catch (storageError) {
      throw new Error(`File storage failed: ${storageError instanceof Error ? storageError.message : 'Unknown error'}`);
    }
    
    // Create or update plugin record
    if (existingPlugin) {
      // Update existing plugin - only update files that were provided
      const updateData: any = {
        pluginId: existingPlugin._id,
        author,
        version,
        description,
        uploadDate: Date.now(),
      };
      
      // Only update file IDs for files that were uploaded
      if (manifestFile) {
        // Delete old manifest file
        await ctx.storage.delete(existingPlugin.manifestFileId);
        updateData.manifestFileId = manifestFileId;
      }
      
      if (coreFile) {
        // Delete old core file
        await ctx.storage.delete(existingPlugin.coreFileId);
        updateData.coreFileId = coreFileId;
      }
      
      if (iconFile) {
        // Delete old icon file if it exists
        if (existingPlugin.iconFileId) {
          await ctx.storage.delete(existingPlugin.iconFileId);
        }
        updateData.iconFileId = iconFileId;
      }
      
      await ctx.runMutation((internal as any).context.updatePlugin, updateData);
    } else {
      // Create new plugin - require manifest and core files
      if (!manifestFile || !coreFile) {
        throw new Error("Manifest and core files are required for new plugins.");
      }
      
      await ctx.runMutation((internal as any).context.createPlugin, {
        name: pluginName,
        author,
        version,
        description,
        manifestFileId,
        coreFileId,
        iconFileId,
        uploadDate: Date.now(),
        isActive: true,
      });
    }
    
    return { success: true, message: existingPlugin ? 'Plugin updated successfully' : 'Plugin created successfully' };
  },
});

export const createPlugin = mutation({
  args: {
    name: v.string(),
    author: v.string(),
    version: v.string(),
    description: v.optional(v.string()),
    manifestFileId: v.id("_storage"),
    coreFileId: v.id("_storage"),
    iconFileId: v.optional(v.id("_storage")),
    uploadDate: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("plugins", args);
  },
});

export const getPluginByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plugins")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const getAllPlugins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("plugins").collect();
  },
});

// Query to get plugins by names (for user's plugin list)
export const getPluginsByNames = query({
  args: {
    pluginNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const plugins = [];
    for (const name of args.pluginNames) {
      const plugin = await ctx.db
        .query("plugins")
        .withIndex("by_name", (q) => q.eq("name", name))
        .first();
      if (plugin) {
        plugins.push(plugin);
      }
    }
    return plugins;
  },
});

// Query to get plugin files (manifest, core, icon)
export const getPluginFiles = query({
  args: {
    pluginName: v.string(),
  },
  handler: async (ctx, args) => {
    const plugin = await ctx.db
      .query("plugins")
      .withIndex("by_name", (q) => q.eq("name", args.pluginName))
      .first();

    if (!plugin) {
      return null;
    }

    // Get file URLs from storage
    const manifestUrl = await ctx.storage.getUrl(plugin.manifestFileId);
    const coreUrl = await ctx.storage.getUrl(plugin.coreFileId);
    const iconUrl = plugin.iconFileId ? await ctx.storage.getUrl(plugin.iconFileId) : null;

    return {
      plugin,
      files: {
        manifestUrl,
        coreUrl,
        iconUrl,
      }
    };
  },
});

// Helper function to clean up plugin references from all users
export const cleanupPluginFromAllUsers = action({
  args: {
    pluginName: v.string(),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.runQuery((internal as any).context.getAllUsers);
    let usersUpdated = 0;
    
    for (const user of allUsers) {
      try {
        const usrData = JSON.parse(user.usrData);
        const currentPlugins = usrData.plugins ? usrData.plugins.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
        
        // Remove plugin from list if it exists
        const updatedPlugins = currentPlugins.filter((p: string) => p !== args.pluginName);
        
        // Only update if the plugin was actually in the user's list
        if (updatedPlugins.length !== currentPlugins.length) {
          usrData.plugins = updatedPlugins.join(',');
          await ctx.runMutation((internal as any).context.updateUser, {
            userId: user._id as string,
            usrData: JSON.stringify(usrData)
          });
          usersUpdated++;
        }
      } catch (error) {
        console.error(`Failed to update user ${user._id} during plugin cleanup:`, error);
        // Continue with other users even if one fails
      }
    }
    
    return { usersUpdated };
  },
});

// Action to delete a plugin
export const deletePluginAction: any = action({
  args: {
    pluginName: v.string(),
  },
  handler: async (ctx, args) => {
    const plugin = await ctx.runQuery((internal as any).context.getPluginByName, { name: args.pluginName });
    
    if (!plugin) {
      throw new Error("Plugin not found");
    }

    // Clean up plugin references from all users
    let cleanupResult;
    try {
      cleanupResult = await ctx.runAction((internal as any).context.cleanupPluginFromAllUsers, { 
        pluginName: args.pluginName 
      });
    } catch (error) {
      console.error('Failed to cleanup plugin from users:', error);
      cleanupResult = { usersUpdated: 0 };
    }
    
    const usersUpdated = cleanupResult?.usersUpdated || 0;
    console.log(`Plugin "${args.pluginName}" removed from ${usersUpdated} users`);

    // Delete files from storage
    await ctx.storage.delete(plugin.manifestFileId);
    await ctx.storage.delete(plugin.coreFileId);
    if (plugin.iconFileId) {
      await ctx.storage.delete(plugin.iconFileId);
    }

    // Delete plugin record from database
    await ctx.runMutation((internal as any).context.deletePlugin, { pluginId: plugin._id });
    
    return { 
      success: true, 
      usersUpdated: usersUpdated,
      message: `Plugin "${args.pluginName}" deleted successfully and removed from ${usersUpdated} users`
    };
  },
});

// Mutation to update plugin in database
export const updatePlugin = mutation({
  args: {
    pluginId: v.id("plugins"),
    author: v.string(),
    version: v.string(),
    description: v.optional(v.string()),
    manifestFileId: v.optional(v.id("_storage")),
    coreFileId: v.optional(v.id("_storage")),
    iconFileId: v.optional(v.id("_storage")),
    uploadDate: v.number(),
  },
  handler: async (ctx, args) => {
    const { pluginId, ...updateData } = args;
    await ctx.db.patch(pluginId, updateData);
  },
});

// Mutation to delete plugin from database
export const deletePlugin = mutation({
  args: {
    pluginId: v.id("plugins"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.pluginId);
  },
});

// Action to add plugin to user's plugin list
export const addPluginToUserAction = action({
  args: {
    userId: v.string(),
    pluginName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery((internal as any).context.getUserById, { userId: args.userId });
    if (!user) {
      throw new Error("User not found");
    }

    const usrData = JSON.parse(user.usrData);
    const currentPlugins = usrData.plugins ? usrData.plugins.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
    
    // Add plugin if not already present
    if (!currentPlugins.includes(args.pluginName)) {
      currentPlugins.push(args.pluginName);
      usrData.plugins = currentPlugins.join(',');
      
      await ctx.runMutation((internal as any).context.updateUser, {
        userId: args.userId,
        usrData: JSON.stringify(usrData)
      });
    }
    
    return { success: true };
  },
});

// Action to remove plugin from user's plugin list
export const removePluginFromUserAction = action({
  args: {
    userId: v.string(),
    pluginName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery((internal as any).context.getUserById, { userId: args.userId });
    if (!user) {
      throw new Error("User not found");
    }

    const usrData = JSON.parse(user.usrData);
    const currentPlugins = usrData.plugins ? usrData.plugins.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
    
    // Remove plugin from list
    const updatedPlugins = currentPlugins.filter((p: string) => p !== args.pluginName);
    usrData.plugins = updatedPlugins.join(',');
    
    await ctx.runMutation((internal as any).context.updateUser, {
      userId: args.userId,
      usrData: JSON.stringify(usrData)
    });
    
    return { success: true };
  },
});

// Query to get user by ID
export const getUserById = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId as any);
  },
});

// Query to get plugin icon URL
export const getPluginIconUrl = query({
  args: {
    pluginName: v.string(),
  },
  handler: async (ctx, args) => {
    const plugin = await ctx.db
      .query("plugins")
      .withIndex("by_name", (q) => q.eq("name", args.pluginName))
      .first();

    if (!plugin || !plugin.iconFileId) {
      return null;
    }

    return await ctx.storage.getUrl(plugin.iconFileId);
  },
});

// Test action to debug base64 encoding
export const testBase64Action = action({
  args: {
    base64Content: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("=== TEST BASE64 ACTION ===");
    console.log("Input length:", args.base64Content.length);
    console.log("Input preview:", args.base64Content.substring(0, 100));
    
    try {
      const decoded = atob(args.base64Content);
      console.log("Decoded content:", decoded);
      
      const parsed = JSON.parse(decoded);
      console.log("Parsed JSON:", parsed);
      
      return { success: true, decoded, parsed };
    } catch (error) {
      console.log("Error:", error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// File validation functions
function validateManifestFile(base64Content: string): boolean {
  try {
    console.log("=== MANIFEST VALIDATION START ===");
    console.log("Base64 length:", base64Content.length);
    console.log("Base64 preview:", base64Content.substring(0, 100));
    
    // Try to decode base64 using atob (browser/Convex compatible)
    let content: string;
    try {
      content = atob(base64Content);
      console.log("Successfully decoded base64");
      console.log("Decoded content preview:", content.substring(0, 200));
    } catch (decodeError) {
      console.log("Base64 decode error:", decodeError);
      return false;
    }
    
    // Try to parse JSON
    let manifest: any;
    try {
      manifest = JSON.parse(content);
      console.log("Successfully parsed JSON");
      console.log("Manifest keys:", Object.keys(manifest));
    } catch (parseError) {
      console.log("JSON parse error:", parseError);
      console.log("Content that failed to parse:", content);
      return false;
    }
    
    // Validate required fields
    const hasName = typeof manifest.name === 'string';
    const hasVersion = typeof manifest.version === 'string';
    const hasAuthor = typeof manifest.author === 'string';
    
    console.log("Field validation:", { hasName, hasVersion, hasAuthor });
    console.log("Field values:", { 
      name: manifest.name, 
      version: manifest.version, 
      author: manifest.author 
    });
    
    const isValid = hasName && hasVersion && hasAuthor;
    console.log("Final validation result:", isValid);
    console.log("=== MANIFEST VALIDATION END ===");
    
    return isValid;
  } catch (error) {
    console.log("Unexpected error in manifest validation:", error);
    return false;
  }
}

function validateCoreFile(base64Content: string): boolean {
  try {
    const content = atob(base64Content);
    
    // Basic JavaScript validation - check for common syntax
    return content.includes('function') || 
           content.includes('const') || 
           content.includes('let') || 
           content.includes('var') ||
           content.includes('class') ||
           content.includes('export');
  } catch {
    return false;
  }
}

function validateIconFile(base64Content: string): boolean {
  try {
    const content = atob(base64Content);
    
    // Basic SVG validation
    return content.includes('<svg') && content.includes('</svg>');
  } catch {
    return false;
  }
}

// Spaces table queries and mutations
export const getAllSpaces = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("spaces").collect();
  },
});

export const getSpaceByName = query({
  args: {
    spaceName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("spaces")
      .withIndex("by_spaceName", (q) => q.eq("spaceName", args.spaceName))
      .first();
  },
});

export const updateSpaceStatus = mutation({
  args: {
    spaceName: v.string(),
    isFull: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existingSpace = await ctx.db
      .query("spaces")
      .withIndex("by_spaceName", (q) => q.eq("spaceName", args.spaceName))
      .first();
    
    if (existingSpace) {
      await ctx.db.patch(existingSpace._id, { isFull: args.isFull });
      return existingSpace._id;
    } else {
      return await ctx.db.insert("spaces", args);
    }
  },
});

export const createSpace = mutation({
  args: {
    spaceName: v.string(),
    isFull: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("spaces", args);
  },
});