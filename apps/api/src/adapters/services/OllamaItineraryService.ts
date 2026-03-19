import { IItineraryService } from '../../domain/interfaces';
import { TripContext, ItineraryPlan } from '../../domain/entities';
import { config } from '../../infrastructure/config';
import * as fallbackData from '../../data/fallbackItineraries.json';

const fallbackItineraries: Record<string, any> = fallbackData as any;

export class OllamaItineraryService implements IItineraryService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = config.OLLAMA_BASE_URL;
    this.model = config.OLLAMA_MODEL;
  }

  async generateItinerary(context: TripContext): Promise<ItineraryPlan> {
    const prompt = this.buildPrompt(context);

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.warn(`Ollama API returned ${response.status}, using fallback itinerary`);
        return this.getFallback(context.destination, context);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || '';

      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return this.getFallback(context.destination, context);
        }
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndNormalize(parsed, context);
      } catch {
        console.warn('Failed to parse LLM response, using fallback');
        return this.getFallback(context.destination, context);
      }
    } catch (error) {
      console.warn('Ollama connection failed, using fallback itinerary:', (error as Error).message);
      return this.getFallback(context.destination, context);
    }
  }

  private buildPrompt(context: TripContext): string {
    return `You are TripMind, an expert AI travel companion. Respond ONLY in valid JSON.
No preamble, no markdown fences, no explanation. Pure JSON.

User context:
- Destination: ${context.destination}
- Trip dates: ${context.startDate} to ${context.endDate}
- Trip purpose: ${context.tripPurpose}
- Saved places: ${JSON.stringify(context.savedPlaces)}
- Calendar events: ${JSON.stringify(context.calendarEvents)}
- Dietary preference: ${context.dietaryPref || 'none'}
- Language: ${context.lang}

Build a complete day-by-day itinerary. Detect calendar gaps between existing events and suggest activities for those gaps. Insert breathing room on over-packed days (more than 5 activities in 8 hours). Generate a document checklist for the destination. Return the response in ${context.lang}.

${context.tripPurpose === 'business' ? 'Bias suggestions toward co-working spaces, quick lunch spots, and gyms.' : 'Bias suggestions toward experiences, local food, and hidden gems.'}

Response schema:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "events": [
        {
          "time": "HH:MM",
          "duration_minutes": 60,
          "type": "activity|food|transport|break|meeting",
          "title": "...",
          "description": "...",
          "location": "...",
          "isGapSuggestion": false,
          "isBreathingRoom": false
        }
      ],
      "freeGaps": [{"start": "HH:MM", "end": "HH:MM", "durationMinutes": 45}]
    }
  ],
  "documentChecklist": ["Passport (valid 6+ months)", "..."],
  "culturalNudges": ["..."]
}`;
  }

  private validateAndNormalize(parsed: any, context: TripContext): ItineraryPlan {
    if (!parsed.days || !Array.isArray(parsed.days)) {
      return this.getFallback(context.destination, context);
    }

    return {
      days: parsed.days.map((day: any) => ({
        date: day.date || 'unknown',
        events: Array.isArray(day.events) ? day.events.map((e: any) => ({
          time: e.time || '09:00',
          duration_minutes: e.duration_minutes || 60,
          type: e.type || 'activity',
          title: e.title || 'Activity',
          description: e.description || '',
          location: e.location || context.destination,
          isGapSuggestion: e.isGapSuggestion || false,
          isBreathingRoom: e.isBreathingRoom || false,
        })) : [],
        freeGaps: Array.isArray(day.freeGaps) ? day.freeGaps : [],
      })),
      documentChecklist: parsed.documentChecklist || [],
      culturalNudges: parsed.culturalNudges || [],
    };
  }

  private getFallback(destination: string, context: TripContext): ItineraryPlan {
    const cityKeys = Object.keys(fallbackItineraries);
    const matchedCity = cityKeys.find(
      (city) => destination.toLowerCase().includes(city.toLowerCase())
    );

    const fallback = matchedCity
      ? (fallbackItineraries as any)[matchedCity]
      : (fallbackItineraries as any)['Singapore'];

    const startDate = new Date(context.startDate);
    const days = fallback.days.map((day: any, index: number) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      return {
        ...day,
        date: date.toISOString().split('T')[0],
      };
    });

    return {
      days,
      documentChecklist: fallback.documentChecklist || [],
      culturalNudges: fallback.culturalNudges || [],
    };
  }
}
