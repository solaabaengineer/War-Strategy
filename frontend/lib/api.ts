/**
 * API client utilities
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Fetch conflicts from API
 */
export async function fetchConflicts(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/conflicts`);
  if (!response.ok) {
    throw new Error("Failed to fetch conflicts");
  }
  return response.json();
}

/**
 * Fetch active conflicts
 */
export async function fetchActiveConflicts(minIntensity: number = 20): Promise<any> {
  const response = await fetch(
    `${API_BASE}/api/v1/conflicts/active/${minIntensity}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch active conflicts");
  }
  return response.json();
}

/**
 * Fetch balance sheet
 */
export async function fetchBalanceSheet(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/balance-sheet`);
  if (!response.ok) {
    throw new Error("Failed to fetch balance sheet");
  }
  return response.json();
}

/**
 * Fetch purchases
 */
export async function fetchPurchases(limit: number = 100): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/purchases?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch purchases");
  }
  return response.json();
}

/**
 * Fetch system status
 */
export async function fetchStatus(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/status`);
  if (!response.ok) {
    throw new Error("Failed to fetch status");
  }
  return response.json();
}

/**
 * Fetch resource holders by country
 */
export async function fetchResourcesByCountry(country: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/v1/resources/${country}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch resources for ${country}`);
  }
  return response.json();
}
