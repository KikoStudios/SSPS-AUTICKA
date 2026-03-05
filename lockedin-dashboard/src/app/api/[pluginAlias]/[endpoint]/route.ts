import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

/**
 * Dynamic Plugin API Endpoint Handler
 * 
 * Handles requests to /api/[pluginAlias]/[endpoint]
 * Routes requests to plugin-specific handlers
 */

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { pluginAlias: string; endpoint: string } }
) {
  return handlePluginApiRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { pluginAlias: string; endpoint: string } }
) {
  return handlePluginApiRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { pluginAlias: string; endpoint: string } }
) {
  return handlePluginApiRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pluginAlias: string; endpoint: string } }
) {
  return handlePluginApiRequest(request, params, 'DELETE');
}

async function handlePluginApiRequest(
  request: NextRequest,
  params: { pluginAlias: string; endpoint: string },
  method: string
) {
  try {
    const { pluginAlias, endpoint } = params;

    // Validate API key if required
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Verify API key with Convex
    const apiKeyValid = await convex.query(api.publicApi.validateApiKey, {
      key: apiKey,
    });

    if (!apiKeyValid) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 403 }
      );
    }

    // Get plugin information
    const plugin = await convex.query(api.pluginFramework.getPluginByEndpoint, {
      pluginAlias,
    });

    if (!plugin) {
      return NextResponse.json(
        { error: `Plugin ${pluginAlias} not found` },
        { status: 404 }
      );
    }

    if (!plugin.isActive) {
      return NextResponse.json(
        { error: `Plugin ${pluginAlias} is not active` },
        { status: 403 }
      );
    }

    // Check if plugin has registered this endpoint
    const hasEndpoint = plugin.apiEndpoints?.includes(endpoint);
    if (!hasEndpoint) {
      return NextResponse.json(
        { error: `Endpoint ${endpoint} not found for plugin ${pluginAlias}` },
        { status: 404 }
      );
    }

    // Parse request body for POST/PUT
    let body = null;
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);

    // Call plugin-specific API handler
    const result = await convex.mutation(api.pluginApi.handlePluginApiCall, {
      pluginAlias,
      endpoint,
      method,
      body: body ? JSON.stringify(body) : null,
      queryParams: JSON.stringify(searchParams),
      apiKey,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Plugin API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
