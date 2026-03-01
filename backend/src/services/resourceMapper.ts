/**
 * Resource mapper - Maps countries to their primary natural resources
 */
export const countryResourceMap: Record<string, string[]> = {
  // Middle East
  "Saudi Arabia": ["oil", "natural_gas", "phosphates"],
  Iran: ["oil", "natural_gas", "copper", "iron_ore"],
  Iraq: ["oil", "natural_gas", "phosphates"],
  "United Arab Emirates": ["oil", "natural_gas"],
  Kuwait: ["oil", "natural_gas"],
  Qatar: ["natural_gas", "oil"],
  Oman: ["oil", "natural_gas"],
  Yemen: ["oil", "natural_gas"],
  Israel: ["phosphates", "potash"],
  Syria: ["oil", "natural_gas", "phosphates"],

  // Africa
  Nigeria: ["oil", "natural_gas", "tin"],
  "South Africa": ["gold", "platinum", "diamonds", "chromium", "manganese"],
  Kenya: ["coffee", "tea", "flowers"],
  Angola: ["oil", "diamonds"],
  "Democratic Republic of the Congo": ["cobalt", "copper", "diamonds", "gold"],
  Zambia: ["copper", "cobalt"],
  Zimbabwe: ["gold", "platinum", "diamonds"],
  Tanzania: ["gold", "tanzanite", "phosphates"],
  Ghana: ["gold", "cocoa", "oil"],
  Mali: ["gold", "phosphates"],
  Burkina Faso: ["cotton", "gold"],
  Ethiopia: ["coffee", "gold", "platinum"],
  Sudan: ["oil", "gold", "chromium"],
  "South Sudan": ["oil"],
  Cameroon: ["oil", "cocoa", "timber"],
  Guinea: ["bauxite", "gold", "diamonds"],
  "Sierra Leone": ["diamonds", "iron_ore", "gold"],
  Mozambique: ["coal", "natural_gas", "titanium"],

  // Asia-Pacific
  Indonesia: ["oil", "natural_gas", "tin", "palm_oil", "coal"],
  "Papua New Guinea": ["natural_gas", "gold", "copper"],
  Philippines: ["gold", "copper", "nickel", "chromium"],
  Myanmar: ["jade", "rubies", "natural_gas", "timber"],
  Thailand: ["tin", "tungsten", "gemstones"],
  Vietnam: ["coal", "tin", "tungsten"],
  Malaysia: ["oil", "natural_gas", "tin", "palm_oil"],
  "East Timor": ["oil", "natural_gas"],
  Afghanistan: ["copper", "iron_ore", "lithium", "rare_earths"],
  Pakistan: ["coal", "salt", "chromium"],
  India: ["iron_ore", "coal", "manganese", "bauxite"],
  Bangladesh: ["coal", "natural_gas"],
  "Sri Lanka": ["graphite", "sapphires"],
  Australia: [
    "iron_ore",
    "coal",
    "gold",
    "lithium",
    "uranium",
    "rare_earths",
  ],

  // Europe
  Russia: [
    "oil",
    "natural_gas",
    "coal",
    "iron_ore",
    "nickel",
    "palladium",
    "rare_earths",
  ],
  Ukraine: ["iron_ore", "manganese", "coal", "potash"],
  Poland: ["coal", "copper", "sulfur"],
  Romania: ["oil", "natural_gas", "gold", "copper"],
  "Bosnia and Herzegovina": ["coal", "copper", "lead", "zinc"],
  Albania: ["chromium", "copper", "nickel"],

  // Americas
  "United States": [
    "coal",
    "natural_gas",
    "oil",
    "copper",
    "gold",
    "lithium",
    "uranium",
  ],
  Canada: [
    "oil",
    "natural_gas",
    "gold",
    "copper",
    "nickel",
    "uranium",
    "lithium",
  ],
  Mexico: ["oil", "natural_gas", "silver", "gold", "copper"],
  Brazil: ["iron_ore", "gold", "diamonds", "bauxite", "manganese"],
  Peru: ["copper", "gold", "silver", "zinc", "lead"],
  Chile: ["copper", "lithium", "molybdenum", "gold"],
  Colombia: ["oil", "coal", "gold", "silver", "emeralds"],
  Venezuela: ["oil", "gold", "iron_ore"],
  Bolivia: ["tin", "lithium", "natural_gas", "gold"],
  Paraguay: ["soybeans", "beef"],
  Argentina: ["oil", "natural_gas", "lithium", "gold", "wheat"],

  // Default resources for unmapped countries
  Unknown: ["gold", "oil"],
};

/**
 * Resource mapper service
 */
export class ResourceMapper {
  /**
   * Get primary resources for a country
   * 
   * @param country Country name
   * @returns Array of primary resource types
   */
  getResourcesByCountry(country: string): string[] {
    return countryResourceMap[country] || countryResourceMap["Unknown"];
  }

  /**
   * Get all countries producing a specific resource
   * 
   * @param resourceType Resource type to search for
   * @returns Array of countries producing the resource
   */
  getProducersByResource(resourceType: string): string[] {
    return Object.entries(countryResourceMap)
      .filter(([_, resources]) =>
        resources.some((r) => r.toLowerCase() === resourceType.toLowerCase())
      )
      .map(([country, _]) => country);
  }

  /**
   * Score attractiveness of conflict resources based on quantity and price
   * 
   * @param resources Array of resources with quantities and prices
   * @returns Attractiveness score 0-100
   */
  scoreResourceAttractiveness(resources: any[]): number {
    if (resources.length === 0) return 0;

    let score = 0;

    // Rare earths and strategic metals get higher scores
    const strategicResources = [
      "cobalt",
      "lithium",
      "rare_earths",
      "palladium",
      "uranium",
    ];
    const premiumResources = ["gold", "platinum", "diamonds"];

    for (const resource of resources) {
      if (strategicResources.includes(resource.type)) {
        score += 30;
      } else if (premiumResources.includes(resource.type)) {
        score += 20;
      } else if (
        ["oil", "natural_gas", "copper", "iron_ore"].includes(resource.type)
      ) {
        score += 10;
      } else {
        score += 5;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Get resource priority list for a conflict
   * 
   * @param country Country in conflict
   * @param conflictIntensity Conflict intensity 0-100
   * @returns Prioritized list of resources to acquire
   */
  getPriorityResources(country: string, conflictIntensity: number): string[] {
    const baseResources = this.getResourcesByCountry(country);

    // During high-intensity conflicts, prioritize strategic metals
    if (conflictIntensity > 70) {
      const strategic = [
        "cobalt",
        "lithium",
        "rare_earths",
        "palladium",
        "uranium",
      ];
      return baseResources.filter((r) => strategic.includes(r)).concat(
        baseResources.filter((r) => !strategic.includes(r))
      );
    }

    // Otherwise, prioritize by market value and scarcity
    return baseResources.sort((a, b) => {
      const valueA = this.getResourceValue(a);
      const valueB = this.getResourceValue(b);
      return valueB - valueA;
    });
  }

  /**
   * Get estimated market value for a resource type
   * 
   * @param resourceType Resource type
   * @returns Relative value score
   */
  private getResourceValue(resourceType: string): number {
    const valueMap: Record<string, number> = {
      uranium: 100,
      rare_earths: 95,
      platinum: 90,
      palladium: 85,
      cobalt: 80,
      lithium: 75,
      diamonds: 70,
      gold: 65,
      copper: 40,
      oil: 35,
      natural_gas: 30,
      iron_ore: 15,
      coal: 10,
      wheat: 5,
    };

    return valueMap[resourceType.toLowerCase()] || 5;
  }
}

/**
 * Export singleton instance
 */
export const resourceMapper = new ResourceMapper();
