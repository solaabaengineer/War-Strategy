import axios, { AxiosInstance } from "axios";

/**
 * Conflict data from ACLED API
 */
interface ACLEDConflictData {
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  event_type: string;
  fatalities: number;
  event_date: string;
}

/**
 * GDELT event data
 */
interface GDELTEventData {
  Actor1Geo_Lat: number;
  Actor1Geo_Long: number;
  Actor1Geo_CountryCode: string;
  EventRootCode: number;
  NumMentions: number;
  GoldsteinScale: number;
  DATEADDED: string;
}

/**
 * Conflict detection with intensity scoring
 */
export class ConflictDetector {
  private acledClient: AxiosInstance;
  private gdeltClient: AxiosInstance;
  private conflictCache: Map<string, any> = new Map();
  private lastUpdateTime: number = 0;
  private updateIntervalMs: number = 6 * 60 * 60 * 1000; // 6 hours

  constructor() {
    this.acledClient = axios.create({
      baseURL: "https://api.acleddata.com",
      timeout: 30000,
    });

    this.gdeltClient = axios.create({
      baseURL: "https://api.gdeltproject.org",
      timeout: 30000,
    });
  }

  /**
   * Detect active military conflicts from ACLED API
   * 
   * @returns Array of conflicts with intensity scores and locations
   */
  async detectConflicts(): Promise<any[]> {
    try {
      const now = Date.now();
      if (now - this.lastUpdateTime < this.updateIntervalMs) {
        return Array.from(this.conflictCache.values());
      }

      // Get ACLED data for last 6 hours
      const sixHoursAgo = new Date(now - 6 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const acledResponse = await this.acledClient.get("/api/v1/events", {
        params: {
          iso: -1,
          event_type: "Military intervention|Battles|Violence against civilians",
          year: new Date().getFullYear(),
          limit: 10000,
          orderby: "time",
        },
      });

      const conflicts = new Map<string, any>();

      // Process ACLED data
      if (acledResponse.data?.data) {
        for (const event of acledResponse.data.data) {
          const country = event.country || "Unknown";
          if (!conflicts.has(country)) {
            conflicts.set(country, {
              country,
              region: event.region || event.admin1 || "Unknown region",
              latitude: parseFloat(event.latitude) || 0,
              longitude: parseFloat(event.longitude) || 0,
              eventCount: 0,
              deathToll: 0,
              intensity: 0,
              lastUpdate: new Date(),
              sources: ["ACLED"],
            });
          }

          const conflict = conflicts.get(country)!;
          conflict.eventCount += 1;
          conflict.deathToll += parseInt(event.fatalities) || 0;
        }
      }

      // Enrich with GDELT data
      await this.enrichWithGDELT(conflicts);

      // Calculate intensity scores (0-100)
      for (const conflict of conflicts.values()) {
        conflict.intensity = this.calculateIntensity(conflict);
      }

      this.conflictCache = conflicts;
      this.lastUpdateTime = now;

      return Array.from(conflicts.values());
    } catch (error) {
      console.error("Error detecting conflicts:", error);
      return Array.from(this.conflictCache.values());
    }
  }

  /**
   * Enrich conflict data with GDELT events
   * 
   * @param conflicts Map of conflicts to enrich
   */
  private async enrichWithGDELT(conflicts: Map<string, any>): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const response = await this.gdeltClient.get(
        `/api/v2/summary/json?search=war%20*%20conflict&timespan=1`,
        {
          timeout: 20000,
        }
      );

      if (response.data?.articles) {
        for (const article of response.data.articles.slice(0, 100)) {
          // Parse article for relevant countries
          for (const conflict of conflicts.values()) {
            if (article.title?.toLowerCase().includes(conflict.country.toLowerCase())) {
              if (!conflict.sources.includes("GDELT")) {
                conflict.sources.push("GDELT");
              }
            }
          }
        }
      }
    } catch (error) {
      console.debug("GDELT enrichment skipped:", error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Calculate intensity score from conflict metrics
   * 
   * @param conflict Conflict data
   * @returns Intensity score 0-100
   */
  private calculateIntensity(conflict: any): number {
    let intensity = 0;

    // Event count component (max 40 points)
    const eventScore = Math.min(40, (conflict.eventCount || 0) * 2);
    intensity += eventScore;

    // Death toll component (max 40 points)
    const deathScore = Math.min(40, (conflict.deathToll || 0) / 100);
    intensity += deathScore;

    // Recency component (max 20 points)
    const hours = (Date.now() - conflict.lastUpdate.getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 20 - hours / 6);
    intensity += recencyScore;

    return Math.min(100, Math.round(intensity));
  }

  /**
   * Get conflict by country code
   * 
   * @param countryCode ISO country code
   * @returns Conflict data or null
   */
  getConflictByCountry(countryCode: string): any | null {
    return Array.from(this.conflictCache.values()).find(
      (c) => c.country.toLowerCase() === countryCode.toLowerCase()
    ) || null;
  }

  /**
   * Get all active conflicts above intensity threshold
   * 
   * @param minIntensity Minimum intensity threshold
   * @returns Array of conflicts above threshold
   */
  getActiveConflicts(minIntensity: number = 20): any[] {
    return Array.from(this.conflictCache.values())
      .filter((c) => c.intensity >= minIntensity)
      .sort((a, b) => b.intensity - a.intensity);
  }
}
