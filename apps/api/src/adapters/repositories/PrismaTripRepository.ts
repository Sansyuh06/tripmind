import prisma from '../../infrastructure/database';
import { ITripRepository } from '../../domain/interfaces';
import { TripEntity, ItineraryDayEntity, FlightBookingEntity, HotelBookingEntity, UserEntity } from '../../domain/entities';

export class PrismaTripRepository implements ITripRepository {
  async findTripById(id: string): Promise<TripEntity | null> {
    return prisma.trip.findUnique({ where: { id } });
  }

  async findTripsByUserId(userId: string): Promise<TripEntity[]> {
    return prisma.trip.findMany({ where: { userId }, orderBy: { startDate: 'asc' } });
  }

  async createTrip(data: Omit<TripEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TripEntity> {
    return prisma.trip.create({ data });
  }

  async updateTrip(id: string, data: Partial<TripEntity>): Promise<TripEntity> {
    const { id: _, createdAt, updatedAt, ...updateData } = data as any;
    return prisma.trip.update({ where: { id }, data: updateData });
  }

  async findItineraryDays(tripId: string): Promise<ItineraryDayEntity[]> {
    const days = await prisma.itineraryDay.findMany({
      where: { tripId },
      orderBy: { date: 'asc' },
    });
    return days.map((d) => ({
      ...d,
      events: JSON.parse(d.events),
      freeGaps: JSON.parse(d.freeGaps),
    }));
  }

  async upsertItineraryDay(data: { tripId: string; date: Date; events: string; freeGaps: string }): Promise<ItineraryDayEntity> {
    const existing = await prisma.itineraryDay.findFirst({
      where: { tripId: data.tripId, date: data.date },
    });

    let day;
    if (existing) {
      day = await prisma.itineraryDay.update({
        where: { id: existing.id },
        data: { events: data.events, freeGaps: data.freeGaps },
      });
    } else {
      day = await prisma.itineraryDay.create({ data });
    }

    return {
      ...day,
      events: JSON.parse(day.events),
      freeGaps: JSON.parse(day.freeGaps),
    };
  }

  async findFlightsByTripId(tripId: string): Promise<FlightBookingEntity[]> {
    return prisma.flightBooking.findMany({ where: { tripId } });
  }

  async findFlightById(id: string): Promise<FlightBookingEntity | null> {
    return prisma.flightBooking.findUnique({ where: { id } });
  }

  async updateFlight(id: string, data: Partial<FlightBookingEntity>): Promise<FlightBookingEntity> {
    const { id: _, createdAt, updatedAt, ...updateData } = data as any;
    return prisma.flightBooking.update({ where: { id }, data: updateData });
  }

  async findHotelsByTripId(tripId: string): Promise<HotelBookingEntity[]> {
    return prisma.hotelBooking.findMany({ where: { tripId } });
  }

  async updateHotel(id: string, data: Partial<HotelBookingEntity>): Promise<HotelBookingEntity> {
    const { id: _, createdAt, updatedAt, ...updateData } = data as any;
    return prisma.hotelBooking.update({ where: { id }, data: updateData });
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
