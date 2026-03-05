/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FlightMap } from './components/Map';

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50">
      <FlightMap />
    </div>
  );
}
