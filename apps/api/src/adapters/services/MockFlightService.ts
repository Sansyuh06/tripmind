import { IFlightService } from '../../domain/interfaces';
import { AlternativeFlight } from '../../domain/entities';
import flightData from '../../data/flights.json';

interface FlightRecord {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  amenities: string[];
}

export class MockFlightService implements IFlightService {
  private flights: FlightRecord[];

  constructor() {
    this.flights = flightData.flights;
  }

  async findAlternatives(
    origin: string,
    destination: string,
    date: Date,
    preferences?: { seatPreference?: string }
  ): Promise<AlternativeFlight[]> {
    const matchingFlights = this.flights.filter(
      (f) =>
        f.origin.toUpperCase() === origin.toUpperCase() &&
        f.destination.toUpperCase() === destination.toUpperCase() &&
        f.seatsAvailable > 0
    );

    if (matchingFlights.length === 0) {
      const anyFlights = this.flights
        .filter((f) => f.seatsAvailable > 0)
        .slice(0, 3);
      return anyFlights.map((f) => this.toAlternativeFlight(f, date));
    }

    const scored = matchingFlights.map((f) => {
      const depTime = this.parseTime(f.departure);
      const timeDiffScore = Math.abs(depTime - 12) / 24;
      const priceScore = f.price / 2000;
      const seatMatch =
        preferences?.seatPreference && f.amenities.includes('wifi') ? 0 : 0.5;

      const score =
        0.4 * (1 - timeDiffScore) + 0.3 * (1 - priceScore) + 0.3 * (1 - seatMatch);

      return { flight: f, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 3).map((s) => ({
      ...this.toAlternativeFlight(s.flight, date),
      score: Math.round(s.score * 100),
    }));
  }

  private toAlternativeFlight(f: FlightRecord, date: Date): AlternativeFlight {
    const depDate = new Date(date);
    const [depH, depM] = f.departure.split(':').map(Number);
    depDate.setHours(depH, depM, 0, 0);

    const arrDate = new Date(date);
    const [arrH, arrM] = f.arrival.split(':').map(Number);
    arrDate.setHours(arrH, arrM, 0, 0);
    if (arrDate <= depDate) {
      arrDate.setDate(arrDate.getDate() + 1);
    }

    return {
      flightNumber: f.flightNumber,
      airline: f.airline,
      origin: f.origin,
      destination: f.destination,
      departureTime: depDate,
      arrivalTime: arrDate,
      price: f.price,
      duration: f.duration,
      seatsAvailable: f.seatsAvailable,
      amenities: f.amenities,
    };
  }

  private parseTime(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
  }
}
