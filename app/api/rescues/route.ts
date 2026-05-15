import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authContext';

export const runtime = 'nodejs';

/**
 * GET /api/rescues
 * Fetch all rescue requests with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [rescues, total] = await Promise.all([
      prisma.rescueRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rescueRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: rescues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rescues' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rescues
 * Create a new rescue request
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { location, description, priority, reporterName, reporterPhone } = body;

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location is required' },
        { status: 400 }
      );
    }

    const reportId = `RES-${Date.now()}`;
    const rescue = await prisma.rescueRequest.create({
      data: {
        reportId,
        location,
        description: description || null,
        priority: priority || 'medium',
        status: 'new',
        reporterName: reporterName || null,
        reporterPhone: reporterPhone || null,
      },
    });

    return NextResponse.json({ success: true, data: rescue }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create rescue' },
      { status: 500 }
    );
  }
}
