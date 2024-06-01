import { useLiveQuery } from 'dexie-react-hooks';
import { Card } from 'react-bootstrap';
import { useGeolocated } from 'react-geolocated';
import { gtfsdb } from '../../lib/dexie/dexie';
import { useMemo } from 'react';
import { CoordUtil } from '../../lib/coord.util';
import { useLanguage } from '../../lib/language';

export function LiveLocationSection() {
  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchPosition: true,
  });
  const { t } = useLanguage();

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
          <h1 className="fs-3">{t('home.liveLocation.title')}</h1>
          {t(
            'home.liveLocation.youAreNear',
            closestStop?.stop_name,
            Math.floor((closestStop?.distance ?? 0) * 1000),
            !!coords && Math.floor(coords?.accuracy * 100) / 100
          )}
        </Card.Body>
      </Card>
    </>
  );
}
