import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { NextRequest, NextResponse } from 'next/server';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Call the Convex mutation to remove non-existent plugins
    const result = await convex.mutation(api.context.removeNonExistentPlugins, {
      userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to clean invalid plugins:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
