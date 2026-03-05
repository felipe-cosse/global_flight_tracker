export interface Plane {
  icao24: string;
  callsign: string;
  origin_country: string;
  time_position: number;
  last_contact: number;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  on_ground: boolean;
  velocity: number;
  true_track: number;
  vertical_rate: number;
  sensors: number[];
  geo_altitude: number;
  squawk: string;
  spi: boolean;
  position_source: number;
}

export async function fetchPlanesInBounds(
  lamin: number,
  lomin: number,
  lamax: number,
  lomax: number
): Promise<Plane[]> {
  const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment.');
    }
    throw new Error('Failed to fetch planes');
  }
  const data = await response.json();
  if (!data.states) {
    return [];
  }
  return data.states.map((state: any[]) => ({
    icao24: state[0],
    callsign: state[1]?.trim() || 'Unknown',
    origin_country: state[2],
    time_position: state[3],
    last_contact: state[4],
    longitude: state[5],
    latitude: state[6],
    baro_altitude: state[7],
    on_ground: state[8],
    velocity: state[9],
    true_track: state[10],
    vertical_rate: state[11],
    sensors: state[12],
    geo_altitude: state[13],
    squawk: state[14],
    spi: state[15],
    position_source: state[16],
  }));
}
