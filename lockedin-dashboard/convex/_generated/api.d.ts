/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as TEMP_clearAuth from "../TEMP_clearAuth.js";
import type * as apiKeys from "../apiKeys.js";
import type * as auth from "../auth.js";
import type * as authHelpers from "../authHelpers.js";
import type * as context from "../context.js";
import type * as createAdmin from "../createAdmin.js";
import type * as debug from "../debug.js";
import type * as fixAdmin from "../fixAdmin.js";
import type * as http from "../http.js";
import type * as iot from "../iot.js";
import type * as migration from "../migration.js";
import type * as permissions from "../permissions.js";
import type * as pluginApi from "../pluginApi.js";
import type * as pluginFramework from "../pluginFramework.js";
import type * as publicApi from "../publicApi.js";
import type * as securedApi from "../securedApi.js";
import type * as securedSpaces from "../securedSpaces.js";
import type * as spaces from "../spaces.js";
import type * as userMigration from "../userMigration.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  TEMP_clearAuth: typeof TEMP_clearAuth;
  apiKeys: typeof apiKeys;
  auth: typeof auth;
  authHelpers: typeof authHelpers;
  context: typeof context;
  createAdmin: typeof createAdmin;
  debug: typeof debug;
  fixAdmin: typeof fixAdmin;
  http: typeof http;
  iot: typeof iot;
  migration: typeof migration;
  permissions: typeof permissions;
  pluginApi: typeof pluginApi;
  pluginFramework: typeof pluginFramework;
  publicApi: typeof publicApi;
  securedApi: typeof securedApi;
  securedSpaces: typeof securedSpaces;
  spaces: typeof spaces;
  userMigration: typeof userMigration;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
