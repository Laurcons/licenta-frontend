import { useState } from 'react';
import { InfoForm } from './InfoForm';
import { LiveLocationNoTrip } from './LiveLocationNoTrip';
import './main.scss';
import { DxTrip } from './lib/dexie/models/dx-trip';
import { LiveLocation } from './LiveLocation';
import { DxStop } from './lib/dexie/models/dx-stop';
import { DxStopTime } from './lib/dexie/models/dx-stopTime';

function App() {
  const [trip, setTrip] = useState<DxTrip | undefined>(undefined);
  const [destination, setDestination] = useState<
    (DxStop & { stop_time: DxStopTime }) | undefined
  >(undefined);

  return (
    <div className="container py-3">
      <InfoForm onTrip={setTrip} onDestination={setDestination} />
      {!trip && <LiveLocationNoTrip />}
      {trip && <LiveLocation trip={trip} destination={destination} />}
    </div>
  );
}

export default App;
