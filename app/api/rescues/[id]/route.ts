import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authContext';

export const runtime = 'nodejs';

/**
 * PUT /api/rescues/[id]
 * Update a rescue request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const rescueId = parseInt(id, 10);
    const body = await request.json();
    const { location, description, status, priority, reporterName, reporterPhone } = body;

    const rescue = await prisma.rescueRequest.update({
      where: { id: rescueId },
      data: {
        ...(location && { location }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(reporterName !== undefined && { reporterName }),
        ...(reporterPhone !== undefined && { reporterPhone }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: rescue });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Rescue not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update rescue' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rescues/[id]
 * Delete a rescue request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const rescueId = parseInt(id, 10);
    await prisma.rescueRequest.delete({
      where: { id: rescueId },
    });

    return NextResponse.json({ success: true, message: 'Rescue deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Rescue not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete rescue' },
      { status: 500 }
    );
  }
}
