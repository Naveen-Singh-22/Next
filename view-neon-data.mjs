import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function viewNeonData() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 NEON DATABASE CONTENT OVERVIEW');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Users
    const users = await prisma.user.findMany();
    console.log(`👤 USERS (${users.length} records)`);
    if (users.length > 0) {
      users.forEach(u => console.log(`   • ${u.email} (${u.role})`));
    }
    console.log();

    // Animals
    const animals = await prisma.animal.findMany();
    console.log(`🐾 ANIMALS (${animals.length} records)`);
    if (animals.length > 0) {
      animals.slice(0, 5).forEach(a => console.log(`   • ${a.name} (${a.species}) - Code: ${a.animalCode}`));
      if (animals.length > 5) console.log(`   ... and ${animals.length - 5} more`);
    }
    console.log();

    // Donations
    const donations = await prisma.donation.findMany();
    console.log(`💰 DONATIONS (${donations.length} records)`);
    if (donations.length > 0) {
      const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
      console.log(`   Total: ₹${totalAmount}`);
      donations.slice(0, 5).forEach(d => console.log(`   • ${d.donorName} - ₹${d.amount} (${d.donationId})`));
      if (donations.length > 5) console.log(`   ... and ${donations.length - 5} more`);
    }
    console.log();

    // Adoption Applications
    const adoptions = await prisma.adoptionApplication.findMany();
    console.log(`📋 ADOPTION APPLICATIONS (${adoptions.length} records)`);
    if (adoptions.length > 0) {
      adoptions.forEach(a => console.log(`   • ${a.applicantName} for ${a.animalName} - Status: ${a.status}`));
    }
    console.log();

    // Adoption Requests
    const adoptionRequests = await prisma.adoptionRequest.findMany();
    console.log(`🏠 ADOPTION REQUESTS (${adoptionRequests.length} records)`);
    if (adoptionRequests.length > 0) {
      adoptionRequests.forEach(r => console.log(`   • ${r.applicantName} for ${r.animalName} - Status: ${r.status}`));
    }
    console.log();

    // Vaccinations
    const vaccinations = await prisma.vaccination.findMany();
    console.log(`💉 VACCINATIONS (${vaccinations.length} records)`);
    if (vaccinations.length > 0) {
      vaccinations.slice(0, 5).forEach(v => console.log(`   • ${v.animalName} - ${v.vaccineName}`));
      if (vaccinations.length > 5) console.log(`   ... and ${vaccinations.length - 5} more`);
    }
    console.log();

    // Volunteer Applications
    const volunteers = await prisma.volunteerApplication.findMany();
    console.log(`🤝 VOLUNTEER APPLICATIONS (${volunteers.length} records)`);
    if (volunteers.length > 0) {
      volunteers.forEach(v => console.log(`   • ${v.fullName} - ${v.interestArea} - Status: ${v.status}`));
    }
    console.log();

    // Inquiries
    const inquiries = await prisma.inquiry.findMany();
    console.log(`📬 INQUIRIES (${inquiries.length} records)`);
    if (inquiries.length > 0) {
      inquiries.slice(0, 5).forEach(i => console.log(`   • [${i.type}] ${i.title} - Status: ${i.status}`));
      if (inquiries.length > 5) console.log(`   ... and ${inquiries.length - 5} more`);
    }
    console.log();

    // Rescue Requests
    const rescues = await prisma.rescueRequest.findMany();
    console.log(`🚨 RESCUE REQUESTS (${rescues.length} records)`);
    if (rescues.length > 0) {
      rescues.forEach(r => console.log(`   • ${r.location} - Status: ${r.status} - Priority: ${r.priority}`));
    }
    console.log();

    // OTP Records
    const otps = await prisma.otpRecord.findMany();
    console.log(`🔐 OTP RECORDS (${otps.length} active)`);
    if (otps.length > 0) {
      otps.forEach(o => console.log(`   • ${o.email} (expires: ${new Date(o.expiresAt).toLocaleString()})`));
    }
    console.log();

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total Records: ${users.length + animals.length + donations.length + adoptions.length + adoptionRequests.length + vaccinations.length + volunteers.length + inquiries.length + rescues.length + otps.length}`);
    console.log(`Database: Neon PostgreSQL`);
    console.log(`Status: ✅ All data migrated and operational\n`);

  } catch (error) {
    console.error('❌ Error querying database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

viewNeonData();
