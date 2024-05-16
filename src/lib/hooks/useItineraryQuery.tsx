import { useLiveQuery } from 'dexie-react-hooks';
import { gtfsdb } from '../dexie/dexie';

export default function useItineraryQuery(trainNum: string) {
  const db = useLiveQuery(async () => {
    if (!trainNum) return undefined;
    const trip = await gtfsdb.trips.get({
      trip_id: trainNum,
    });
    if (!trip) return undefined;
    const route = await gtfsdb.routes.get({
      route_id: trip.route_id,
    });
    if (!route) return undefined;
    const stopTimes = await gtfsdb.stop_times
      .where({
        trip_id: trip!.trip_id,
      })
      .sortBy('stop_sequence');
    if (!stopTimes) return undefined;
    const stops = await gtfsdb.stops
      .bulkGet(stopTimes.map((st) => st.stop_id))
      .then((ss) =>
        ss.map((s) => ({
          ...s,
          stop_time: stopTimes.find((st) => st.stop_id === s?.stop_id),
        }))
      );
    if (!stops) return undefined;
    return {
      route,
      trip,
      stopTimes,
      stops,
    };
  }, [trainNum]);
  return db;
}
