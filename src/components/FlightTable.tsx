import { useState, useMemo } from 'react';
import { Plane } from '../services/opensky';
import { Search, Filter } from 'lucide-react';
import { getCountryFlag } from '../utils/flags';

interface FlightTableProps {
  planes: Plane[];
  onPlaneClick: (plane: Plane) => void;
}

export function FlightTable({ planes, onPlaneClick }: FlightTableProps) {
  const [search, setSearch] = useState('');

  const filteredPlanes = useMemo(() => {
    return planes.filter(p => {
      const callsignMatch = p.callsign.toLowerCase().includes(search.toLowerCase());
      const squawkMatch = p.squawk?.toLowerCase().includes(search.toLowerCase());
      const countryMatch = p.origin_country.toLowerCase().includes(search.toLowerCase());
      return callsignMatch || squawkMatch || countryMatch;
    });
  }, [planes, search]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Live Flights ({filteredPlanes.length})</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search callsign, squawk, or country..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Callsign</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Country</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Route</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Type</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Squawk</th>
              <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Alt. (ft)</th>
              <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Spd. (kt)</th>
              <th className="px-4 py-3 font-medium text-right whitespace-nowrap">RSSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPlanes.map(plane => (
              <tr 
                key={plane.icao24} 
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => onPlaneClick(plane)}
              >
                <td className="px-4 py-3 font-medium text-blue-600 whitespace-nowrap">
                  {plane.callsign || 'N/A'}
                </td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                  <span className="mr-2 text-lg leading-none" title={plane.origin_country}>
                    {getCountryFlag(plane.origin_country)}
                  </span>
                  <span className="truncate max-w-[120px] inline-block align-bottom">
                    {plane.origin_country}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap italic">N/A</td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap italic">N/A</td>
                <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                  {plane.squawk || 'N/A'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                  {plane.baro_altitude ? Math.round(plane.baro_altitude * 3.28084).toLocaleString() : 'N/A'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                  {plane.velocity ? Math.round(plane.velocity * 1.94384) : 'N/A'}
                </td>
                <td className="px-4 py-3 text-right text-slate-400 whitespace-nowrap italic">N/A</td>
              </tr>
            ))}
            {filteredPlanes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No flights found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
