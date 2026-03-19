import { ITripRepository, IItineraryService } from '../../domain/interfaces';
import { TripContext, ItineraryPlan, CalendarEvent } from '../../domain/entities';

export class BuildItinerary {
  constructor(
    private tripRepo: ITripRepository,
    private itineraryService: IItineraryService,
  ) {}

  async execute(params: {
    tripId: string;
    calendarEvents?: CalendarEvent[];
    savedPlaces?: string[];
    lang?: string;
  }): Promise<ItineraryPlan> {
    const trip = await this.tripRepo.findTripById(params.tripId);
    if (!trip) throw new Error('Trip not found');

    const user = await this.tripRepo.findUserById(trip.userId);
    if (!user) throw new Error('User not found');

    const context: TripContext = {
      destination: trip.destination,
      startDate: trip.startDate.toISOString().split('T')[0],
      endDate: trip.endDate.toISOString().split('T')[0],
      tripPurpose: user.tripPurpose,
      savedPlaces: params.savedPlaces || [],
      calendarEvents: params.calendarEvents || [],
      dietaryPref: user.dietaryPref,
      lang: params.lang || user.preferredLang || 'en',
    };

    const plan = await this.itineraryService.generateItinerary(context);

    for (const day of plan.days) {
      const dateObj = new Date(day.date);
      await this.tripRepo.upsertItineraryDay({
        tripId: params.tripId,
        date: dateObj,
        events: JSON.stringify(day.events),
        freeGaps: JSON.stringify(day.freeGaps),
      });
    }

    return plan;
  }
}
