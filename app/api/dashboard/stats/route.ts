import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authContext';

export const runtime = 'nodejs';

/**
 * GET /api/dashboard/stats
 * Fetch dashboard statistics (counts, summaries)
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Fetch all counts in parallel
    const [
      animalCount,
      rescueCount,
      adoptionCount,
      vaccinationCount,
      donationCount,
      volunteerCount,
      inquiryCount,
    ] = await Promise.all([
      prisma.animal.count(),
      prisma.rescueRequest.count(),
      prisma.adoptionApplication.count(),
      prisma.vaccination.count(),
      prisma.donation.count(),
      prisma.volunteerApplication.count(),
      prisma.inquiry.count(),
    ]);

    // Fetch additional data
    const [rescuesByStatus, adoptionsByStatus, volunteersByStatus, animalsByStatus, totalDonation] = await Promise.all([
      prisma.rescueRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.adoptionApplication.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.volunteerApplication.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.animal.groupBy({
        by: ['species'],
        _count: { id: true },
      }),
      prisma.donation.aggregate({
        _sum: { amount: true },
      }),
    ]);

    // Format rescue stats
    const rescueStats = rescuesByStatus.reduce((acc: any, item: any) => {
      acc[item.status || 'unknown'] = item._count.id;
      return acc;
    }, {});

    // Format adoption stats
    const adoptionStats = adoptionsByStatus.reduce((acc: any, item: any) => {
      acc[item.status || 'unknown'] = item._count.id;
      return acc;
    }, {});

    // Format volunteer stats
    const volunteerStats = volunteersByStatus.reduce((acc: any, item: any) => {
      acc[item.status || 'unknown'] = item._count.id;
      return acc;
    }, {});

    // Format animal stats
    const animalStats = animalsByStatus.reduce((acc: any, item: any) => {
      acc[item.species || 'unknown'] = item._count.id;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAnimals: animalCount,
          totalRescues: rescueCount,
          totalAdoptions: adoptionCount,
          totalVaccinations: vaccinationCount,
          totalDonations: donationCount,
          totalVolunteers: volunteerCount,
          totalInquiries: inquiryCount,
          totalDonationAmount: totalDonation._sum.amount || 0,
        },
        rescueStats,
        adoptionStats,
        volunteerStats,
        animalStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
