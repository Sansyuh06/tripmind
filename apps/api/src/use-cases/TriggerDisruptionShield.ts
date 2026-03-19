import { v4 as uuidv4 } from 'uuid';
import { ITripRepository, IItineraryService, IFlightService } from '../../domain/interfaces';
import { DisruptionResolution, ItineraryDayEntity, TripContext } from '../../domain/entities';
import { QRCodeService } from '../services/QRCodeService';

export class TriggerDisruptionShield {
  constructor(
    private tripRepo: ITripRepository,
    private flightService: IFlightService,
    private itineraryService: IItineraryService,
    private qrService: QRCodeService,
  ) {}

  async execute(params: {
    tripId: string;
    flightId: string;
    disruptionType: 'cancelled' | 'delayed' | 'missed';
    lang?: string;
  }): Promise<DisruptionResolution> {
    // Step 1: Load trip, flight, hotel, and user
    const trip = await this.tripRepo.findTripById(params.tripId);
    if (!trip) throw new Error('Trip not found');

    const flight = await this.tripRepo.findFlightById(params.flightId);
    if (!flight) throw new Error('Flight not found');

    const user = await this.tripRepo.findUserById(trip.userId);
    if (!user) throw new Error('User not found');

    const hotels = await this.tripRepo.findHotelsByTripId(params.tripId);
    const hotel = hotels[0];

    // Step 2: Find alternative flights
    let alternativeFlights;
    try {
      alternativeFlights = await this.flightService.findAlternatives(
        flight.origin,
        flight.destination,
        flight.departureTime,
        { seatPreference: user.seatPreference || undefined }
      );
    } catch (error) {
      throw new Error('Failed to find alternative flights');
    }

    if (alternativeFlights.length === 0) {
      throw new Error('No alternative flights available');
    }

    // Step 3: Score and select best alternative
    const selectedFlight = alternativeFlights[0]; // Already sorted by score from service

    // Step 4: Calculate new hotel check-in
    const updatedHotelCheckIn = new Date(selectedFlight.arrivalTime);
    updatedHotelCheckIn.setHours(updatedHotelCheckIn.getHours() + 2);

    // Step 5: Re-generate itinerary for affected day
    let updatedItinerary: ItineraryDayEntity[];
    try {
      const context: TripContext = {
        destination: trip.destination,
        startDate: trip.startDate.toISOString().split('T')[0],
        endDate: trip.endDate.toISOString().split('T')[0],
        tripPurpose: user.tripPurpose,
        savedPlaces: [],
        calendarEvents: [{
          title: `Flight ${selectedFlight.flightNumber} arrives`,
          start: selectedFlight.arrivalTime.toISOString(),
          end: new Date(selectedFlight.arrivalTime.getTime() + 60 * 60 * 1000).toISOString(),
          location: flight.destination,
        }],
        dietaryPref: user.dietaryPref,
        lang: params.lang || user.preferredLang || 'en',
      };

      const plan = await this.itineraryService.generateItinerary(context);
      updatedItinerary = plan.days.map((day) => ({
        id: uuidv4(),
        tripId: params.tripId,
        date: new Date(day.date),
        events: day.events,
        freeGaps: day.freeGaps,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    } catch {
      // Fallback: simple time-shifted original itinerary
      const existingDays = await this.tripRepo.findItineraryDays(params.tripId);
      updatedItinerary = existingDays.map((day) => ({
        ...day,
        events: day.events.map((e) => ({
          ...e,
          description: `[Updated after disruption] ${e.description}`,
        })),
      }));
    }

    // Step 6: Generate QR code
    const confirmationToken = uuidv4().substring(0, 8);
    const qrUrl = `https://tripmind.app/confirm/${confirmationToken}?action=pay&amount=${selectedFlight.price}&flight=${selectedFlight.flightNumber}`;
    let qrCodeData = '';
    try {
      qrCodeData = await this.qrService.generateQR(qrUrl);
    } catch {
      qrCodeData = '';
    }

    // Update the disrupted flight status
    try {
      await this.tripRepo.updateFlight(params.flightId, { status: params.disruptionType });
      await this.tripRepo.updateTrip(params.tripId, { status: 'disrupted' });
      if (hotel) {
        await this.tripRepo.updateHotel(hotel.id, { checkIn: updatedHotelCheckIn });
      }
    } catch (error) {
      console.warn('Failed to update records:', error);
    }

    // Step 7: Return full resolution
    return {
      alternativeFlights: alternativeFlights.slice(0, 3),
      selectedFlight,
      updatedHotelCheckIn,
      updatedCabBooking: {
        pickup: `${flight.destination} Airport`,
        dropoff: hotel ? hotel.hotelName : `Hotel in ${trip.destination}`,
        time: new Date(updatedHotelCheckIn.getTime() - 30 * 60 * 1000),
      },
      updatedItinerary,
      qrCodeData,
      confirmationToken,
    };
  }
}
