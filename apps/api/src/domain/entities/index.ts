export interface UserEntity {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  preferredLang: string;
  tripPurpose: string;
  dietaryPref: string | null;
  seatPreference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripEntity {
  id: string;
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItineraryEvent {
  time: string;
  duration_minutes: number;
  type: 'activity' | 'food' | 'transport' | 'break' | 'meeting';
  title: string;
  description: string;
  location: string;
  isGapSuggestion: boolean;
  isBreathingRoom: boolean;
}

export interface FreeGap {
  start: string;
  end: string;
  durationMinutes: number;
}

export interface ItineraryDayEntity {
  id: string;
  tripId: string;
  date: Date;
  events: ItineraryEvent[];
  freeGaps: FreeGap[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlightBookingEntity {
  id: string;
  tripId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  airline: string;
  status: string;
  price: number;
  confirmationCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HotelBookingEntity {
  id: string;
  tripId: string;
  hotelName: string;
  checkIn: Date;
  checkOut: Date;
  confirmationCode: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseEntity {
  id: string;
  userId: string;
  tripId: string | null;
  amount: number;
  currency: string;
  category: string;
  description: string;
  receiptText: string | null;
  date: Date;
  createdAt: Date;
}

export interface AlternativeFlight {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  duration: string;
  seatsAvailable: number;
  amenities: string[];
  score?: number;
}

export interface DisruptionResolution {
  alternativeFlights: AlternativeFlight[];
  selectedFlight: AlternativeFlight;
  updatedHotelCheckIn: Date;
  updatedCabBooking: { pickup: string; dropoff: string; time: Date; };
  updatedItinerary: ItineraryDayEntity[];
  qrCodeData: string;
  confirmationToken: string;
}

export interface TripContext {
  destination: string;
  startDate: string;
  endDate: string;
  tripPurpose: string;
  savedPlaces: string[];
  calendarEvents: CalendarEvent[];
  dietaryPref: string | null;
  lang: string;
  weather?: any;
}

export interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  location?: string;
}

export interface ItineraryPlan {
  days: {
    date: string;
    events: ItineraryEvent[];
    freeGaps: FreeGap[];
  }[];
  documentChecklist: string[];
  culturalNudges: string[];
}
