import { Plane } from '../services/opensky';
import { getCountryFlag } from '../utils/flags';
import { X, Plane as PlaneIcon, MapPin, Activity, Compass, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface FlightDetailsProps {
  plane: Plane;
  onClose: () => void;
}

export function FlightDetails({ plane, onClose }: FlightDetailsProps) {
  const positionSources = ['ADS-B', 'ASTERIX', 'MLAT', 'FLARM'];
  const source = positionSources[plane.position_source] || 'Unknown';

  const getVerticalRateIcon = (rate: number) => {
    if (rate > 0) return <ArrowUpRight className="w-5 h-5 text-emerald-500" />;
    if (rate < 0) return <ArrowDownRight className="w-5 h-5 text-blue-500" />;
    return <ArrowRight className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full md:w-[450px] lg:w-[600px] shrink-0 shadow-xl z-10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 relative shrink-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-sm">
            <PlaneIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              {plane.callsign || 'Unknown Callsign'}
            </h2>
            <div className="flex items-center gap-2 text-slate-500 font-mono text-sm mt-1">
              <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700">{plane.icao24.toUpperCase()}</span>
              {plane.squawk && <span>Squawk: {plane.squawk}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8 flex-1 overflow-y-auto">
        {/* Registration & Origin */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Flight Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-slate-500 text-sm mb-1">Origin Country</div>
              <div className="font-medium text-slate-900 flex items-center gap-2">
                <span className="text-xl leading-none">{getCountryFlag(plane.origin_country)}</span>
                <span className="truncate">{plane.origin_country}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="text-slate-500 text-sm mb-1">Status</div>
              <div className="font-medium text-slate-900">
                {plane.on_ground ? 'On Ground' : 'In Air'}
              </div>
            </div>
          </div>
        </section>

        {/* Telemetry */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Telemetry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5"><Activity className="w-4 h-4" /></div>
              <div>
                <div className="text-sm text-slate-500">Altitude (Baro)</div>
                <div className="font-mono font-medium text-slate-900 text-lg">
                  {plane.baro_altitude ? `${Math.round(plane.baro_altitude * 3.28084).toLocaleString()} ft` : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5"><MapPin className="w-4 h-4" /></div>
              <div>
                <div className="text-sm text-slate-500">Speed</div>
                <div className="font-mono font-medium text-slate-900 text-lg">
                  {plane.velocity ? `${Math.round(plane.velocity * 1.94384)} kts` : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5"><Compass className="w-4 h-4" /></div>
              <div>
                <div className="text-sm text-slate-500">Heading</div>
                <div className="font-mono font-medium text-slate-900 text-lg">
                  {plane.true_track ? `${Math.round(plane.true_track)}°` : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5">
                {getVerticalRateIcon(plane.vertical_rate || 0)}
              </div>
              <div>
                <div className="text-sm text-slate-500">Vertical Rate</div>
                <div className="font-mono font-medium text-slate-900 text-lg">
                  {plane.vertical_rate ? `${Math.round(plane.vertical_rate * 3.28084 * 60)} ft/m` : 'Level'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Technical Details</h3>
          <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
            <div className="p-3 flex justify-between items-center">
              <span className="text-sm text-slate-500">Position Source</span>
              <span className="text-sm font-medium text-slate-900">{source}</span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-sm text-slate-500">Last Contact</span>
              <span className="text-sm font-medium text-slate-900">
                {plane.last_contact ? new Date(plane.last_contact * 1000).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-sm text-slate-500">Geo Altitude</span>
              <span className="text-sm font-medium text-slate-900 font-mono">
                {plane.geo_altitude ? `${Math.round(plane.geo_altitude * 3.28084).toLocaleString()} ft` : 'N/A'}
              </span>
            </div>
            <div className="p-3 flex justify-between items-center">
              <span className="text-sm text-slate-500">Coordinates</span>
              <span className="text-sm font-medium text-slate-900 font-mono">
                {plane.latitude?.toFixed(4)}, {plane.longitude?.toFixed(4)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
