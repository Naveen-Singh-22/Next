import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authContext';
import { recordAdminAuditEvent } from '@/lib/adminAudit';

export const runtime = 'nodejs';

/**
 * GET /api/donations/[id]
 * Fetch donation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmin();

    const { id } = await params;
    const donationId = parseInt(id, 10);
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: donation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch donation' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/donations/[id]
 * Update donation record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmin();

    const { id } = await params;
    const donationId = parseInt(id, 10);
    const body = await request.json();
    const { donorName, email, phone, amount, coverFees } = body;

    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        ...(donorName && { donorName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(amount && { amount }),
        ...(coverFees !== undefined && { coverFees }),
      },
    });

    await recordAdminAuditEvent({
      actor,
      action: 'update',
      resource: 'donation',
      request,
      subjectId: donationId,
      details: {
        changes: Object.keys(body ?? {}),
        amount: donation.amount,
      },
    });

    return NextResponse.json({ success: true, data: donation });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update donation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/donations/[id]
 * Delete donation record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdmin();

    const { id } = await params;
    const donationId = parseInt(id, 10);
    const existing = await prisma.donation.findUnique({ where: { id: donationId } });
    await prisma.donation.delete({
      where: { id: donationId },
    });

    if (existing) {
      await recordAdminAuditEvent({
        actor,
        action: 'delete',
        resource: 'donation',
        request,
        subjectId: donationId,
        details: {
          donorName: existing.donorName,
          amount: existing.amount,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Donation deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Donation not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete donation' },
      { status: 500 }
    );
  }
}
