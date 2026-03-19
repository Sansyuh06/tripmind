import { TripEntity, ItineraryDayEntity, FlightBookingEntity, HotelBookingEntity, UserEntity } from '../entities';

export interface ITripRepository {
  findTripById(id: string): Promise<TripEntity | null>;
  findTripsByUserId(userId: string): Promise<TripEntity[]>;
  createTrip(data: Omit<TripEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TripEntity>;
  updateTrip(id: string, data: Partial<TripEntity>): Promise<TripEntity>;
  findItineraryDays(tripId: string): Promise<ItineraryDayEntity[]>;
  upsertItineraryDay(data: { tripId: string; date: Date; events: string; freeGaps: string }): Promise<ItineraryDayEntity>;
  findFlightsByTripId(tripId: string): Promise<FlightBookingEntity[]>;
  findFlightById(id: string): Promise<FlightBookingEntity | null>;
  updateFlight(id: string, data: Partial<FlightBookingEntity>): Promise<FlightBookingEntity>;
  findHotelsByTripId(tripId: string): Promise<HotelBookingEntity[]>;
  updateHotel(id: string, data: Partial<HotelBookingEntity>): Promise<HotelBookingEntity>;
  findUserById(id: string): Promise<UserEntity | null>;
}

export interface IItineraryService {
  generateItinerary(context: import('../entities').TripContext): Promise<import('../entities').ItineraryPlan>;
}

export interface IFlightService {
  findAlternatives(origin: string, destination: string, date: Date, preferences?: { seatPreference?: string }): Promise<import('../entities').AlternativeFlight[]>;
}

export interface IExpenseService {
  scanReceipt(receiptText: string, lang: string): Promise<{ amount: number; currency: string; category: string; description: string }>;
}
