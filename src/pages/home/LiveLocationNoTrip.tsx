import { useLiveQuery } from 'dexie-react-hooks';
import { Card } from 'react-bootstrap';
import { useGeolocated } from 'react-geolocated';
import { gtfsdb } from '../../lib/dexie/dexie';
import { useMemo } from 'react';
import { CoordUtil } from '../../lib/coord.util';

export function LiveLocationNoTrip() {
  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchPosition: true,
  });

  const stops = useLiveQuery(() => {
    return gtfsdb.stops.toArray();
  });
  const closestStop = useMemo(() => {
    if (!stops || !coords) return;
    if (stops.length < 2) return;
    return stops
      .map((stop) => ({
        ...stop,
        distance: CoordUtil.distance(
          { latitude: stop.stop_lat, longitude: stop.stop_lon },
          coords
        ),
      }))
      .reduce((min, curr) => (min.distance <= curr.distance ? min : curr));
  }, [coords, stops]);

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <h1 className="fs-3">Live location</h1>
          You are near {closestStop?.stop_name} (
          {Math.floor((closestStop?.distance ?? 0) * 1000)} m away), and your
          position is accurate to within {coords?.accuracy} m.
        </Card.Body>
      </Card>
    </>
  );
}
