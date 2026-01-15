/**
 * Database seed script
 * Creates sample data for development and testing
 */

import { PrismaClient, UserRole, SalaryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.dailyWorkSummary.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.dayOff.deleteMany();
  await prisma.salaryConfig.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'user_admin_seed',
      email: 'admin@inploy.com',
      role: UserRole.ADMIN,
    },
  });

  console.log('✓ Created admin user');

  // Create sample employers
  const employers = await Promise.all([
    prisma.employer.create({
      data: {
        firstName: 'Juan',
        lastName: 'García',
        email: 'juan.garcia@example.com',
        phone: '+595 21 123456',
        employeeNumber: 'EMP001',
        position: 'Software Developer',
        department: 'Technology',
        baselineHoursPerWeek: 40,
        salaryConfig: {
          create: {
            salaryType: SalaryType.MONTHLY,
            baseSalaryPYG: 10000000, // ₲10,000,000 per month
            deductionFormula: {
              type: 'percentage',
              value: 5,
            },
            exchangeRate: 7300,
          },
        },
      },
    }),
    prisma.employer.create({
      data: {
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@example.com',
        phone: '+595 21 234567',
        employeeNumber: 'EMP002',
        position: 'Designer',
        department: 'Marketing',
        baselineHoursPerWeek: 40,
        salaryConfig: {
          create: {
            salaryType: SalaryType.MONTHLY,
            baseSalaryPYG: 8500000, // ₲8,500,000 per month
            deductionFormula: {
              type: 'fixed',
              value: 100000,
            },
            exchangeRate: 7300,
          },
        },
      },
    }),
    prisma.employer.create({
      data: {
        firstName: 'Carlos',
        lastName: 'Martínez',
        email: 'carlos.martinez@example.com',
        phone: '+595 21 345678',
        employeeNumber: 'EMP003',
        position: 'Freelance Developer',
        department: 'Technology',
        baselineHoursPerWeek: 40,
        salaryConfig: {
          create: {
            salaryType: SalaryType.HOURLY,
            baseSalaryPYG: 0,
            hourlyRatePYG: 50000, // ₲50,000 per hour
            deductionFormula: {
              type: 'fixed',
              value: 0,
            },
            exchangeRate: 7300,
          },
        },
      },
    }),
  ]);

  console.log(`✓ Created ${employers.length} employers`);

  // Create sample check-ins for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkIn1 = new Date(today);
  checkIn1.setHours(8, 0, 0); // 8:00 AM

  const checkIn2 = new Date(today);
  checkIn2.setHours(12, 0, 0); // 12:00 PM (lunch)

  const checkIn3 = new Date(today);
  checkIn3.setHours(13, 0, 0); // 1:00 PM (return from lunch)

  await prisma.checkIn.createMany({
    data: [
      {
        employerId: employers[0].id,
        eventType: 'ENTRADA',
        timestamp: checkIn1,
        date: today,
        voiceGreetingPlayed: true,
      },
      {
        employerId: employers[0].id,
        eventType: 'ALMUERZO',
        timestamp: checkIn2,
        date: today,
      },
      {
        employerId: employers[0].id,
        eventType: 'RETURN',
        timestamp: checkIn3,
        date: today,
      },
      {
        employerId: employers[1].id,
        eventType: 'ENTRADA',
        timestamp: checkIn1,
        date: today,
        voiceGreetingPlayed: true,
      },
    ],
  });

  console.log('✓ Created sample check-ins');

  console.log('\n✅ Seeding completed successfully!\n');
  console.log('Sample data:');
  console.log('  - Admin user: admin@inploy.com');
  console.log('  - Employers: 3 (Juan, María, Carlos)');
  console.log('  - Check-ins: Sample data for today\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
