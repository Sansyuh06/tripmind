import prisma from './infrastructure/database';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@tripmind.app' },
    update: {},
    create: {
      email: 'demo@tripmind.app',
      name: 'Demo Traveller',
      passwordHash,
      preferredLang: 'en',
      tripPurpose: 'leisure',
      dietaryPref: 'vegetarian',
      seatPreference: 'aisle',
    },
  });

  console.log(`  ✅ User created: ${user.email}`);

  const tripStart = new Date();
  tripStart.setDate(tripStart.getDate() + 7);
  const tripEnd = new Date(tripStart);
  tripEnd.setDate(tripEnd.getDate() + 3);

  const trip = await prisma.trip.upsert({
    where: { id: 'demo-trip-singapore' },
    update: {},
    create: {
      id: 'demo-trip-singapore',
      userId: user.id,
      destination: 'Singapore',
      startDate: tripStart,
      endDate: tripEnd,
      status: 'active',
    },
  });

  console.log(`  ✅ Trip created: ${trip.destination}`);

  const depTime = new Date(tripStart);
  depTime.setHours(8, 0, 0, 0);
  const arrTime = new Date(tripStart);
  arrTime.setHours(16, 30, 0, 0);

  const flight = await prisma.flightBooking.upsert({
    where: { id: 'demo-flight-sq421' },
    update: {},
    create: {
      id: 'demo-flight-sq421',
      tripId: trip.id,
      flightNumber: 'SQ421',
      origin: 'BOM',
      destination: 'SIN',
      departureTime: depTime,
      arrivalTime: arrTime,
      airline: 'Singapore Airlines',
      status: 'confirmed',
      price: 450,
      confirmationCode: 'SQBOM2SIN',
    },
  });

  console.log(`  ✅ Flight created: ${flight.flightNumber}`);

  const hotel = await prisma.hotelBooking.upsert({
    where: { id: 'demo-hotel-mbs' },
    update: {},
    create: {
      id: 'demo-hotel-mbs',
      tripId: trip.id,
      hotelName: 'Marina Bay Sands',
      checkIn: new Date(tripStart.getTime() + 6 * 60 * 60 * 1000),
      checkOut: tripEnd,
      confirmationCode: 'MBS-DEMO-001',
      status: 'confirmed',
    },
  });

  console.log(`  ✅ Hotel created: ${hotel.hotelName}`);

  // Create fallback itinerary days
  const fallback = require('./data/fallbackItineraries.json');
  const singaporeItinerary = (fallback as any).Singapore;

  for (let i = 0; i < singaporeItinerary.days.length; i++) {
    const dayDate = new Date(tripStart);
    dayDate.setDate(dayDate.getDate() + i);

    await prisma.itineraryDay.upsert({
      where: { id: `demo-day-${i + 1}` },
      update: { events: JSON.stringify(singaporeItinerary.days[i].events), freeGaps: JSON.stringify(singaporeItinerary.days[i].freeGaps) },
      create: {
        id: `demo-day-${i + 1}`,
        tripId: trip.id,
        date: dayDate,
        events: JSON.stringify(singaporeItinerary.days[i].events),
        freeGaps: JSON.stringify(singaporeItinerary.days[i].freeGaps),
      },
    });
  }

  console.log(`  ✅ Itinerary days seeded`);
  console.log('\n✅ Seed complete!');
  console.log(`\n📧 Login: demo@tripmind.app / password123`);
  console.log(`🆔 Trip ID: ${trip.id}`);
  console.log(`✈️  Flight ID: ${flight.id}`);

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  prisma.$disconnect();
  process.exit(1);
});
