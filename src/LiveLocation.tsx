import { useLiveQuery } from 'dexie-react-hooks';
import { DxTrip } from './lib/dexie/models/dx-trip';
import { gtfsdb } from './lib/dexie/dexie';
import { Card } from 'react-bootstrap';
import { useGeolocated } from 'react-geolocated';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CoordUtil } from './lib/coord.util';
import { DxStop } from './lib/dexie/models/dx-stop';
import { DxStopTime } from './lib/dexie/models/dx-stopTime';
import { Timetable } from './Timetable';

export function LiveLocation({
  trip,
  destination,
}: {
  trip: DxTrip;
  destination?: DxStop & { stop_time: DxStopTime };
}) {
  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchPosition: true,
  });
  const [visitedStops, setVisitedStops] = useState<string[]>([]);

  const db = useLiveQuery(async () => {
    const stopTimes = await gtfsdb.stop_times
      .where({
        trip_id: trip.trip_id,
      })
      .sortBy('stop_sequence');
    if (!stopTimes) return undefined;
    const stops = await gtfsdb.stops
      .bulkGet(stopTimes.map((st) => st.stop_id))
      .then((ss) =>
        ss
          .filter((s) => !!s)
          .map((s) => ({
            ...(s as DxStop),
            stop_time: stopTimes.find((st) => st.stop_id === s?.stop_id)!,
          }))
          .sort((a, b) => a.stop_time.stop_sequence - b.stop_time.stop_sequence)
      );
    return {
      stopTimes,
      stops,
    };
  }, [trip]);

  const stations = useMemo(() => {
    if (!db?.stops?.length) return;
    if (!coords) return;
    const latestVisitedStopSequence = Math.max(
      ...visitedStops.map(
        (vsid) =>
          db.stops.find((s) => s.stop_id === vsid)!.stop_time.stop_sequence
      ),
      0
    );
    return (
      db.stops
        .map((stop) => ({
          ...stop,
          distance: CoordUtil.distance(
            { latitude: stop.stop_lat, longitude: stop.stop_lon },
            coords
          ),
        }))
        // do not consider stations that are visited (apart from latest one)
        .filter(
          (stop) => stop.stop_time.stop_sequence >= latestVisitedStopSequence
        )
        .reduce<(DxStop & { distance: number; stop_time: DxStopTime })[]>(
          (mins, curr) => {
            // min[0] < min[1]
            if (mins.length < 2) return [...mins, curr];
            if (curr.distance < mins[0].distance) {
              return [curr, mins[0]];
            } else if (curr.distance < mins[1].distance) {
              return [mins[0], curr];
            }
            return mins;
          },
          []
        )
        .sort((a, b) => a.stop_time.stop_sequence - b.stop_time.stop_sequence)
    );
  }, [db?.stops, coords, visitedStops]);

  const { prevStation, nextStation, progressPercent } = useMemo(() => {
    if (!stations) {
      return {
        prevStation: undefined,
        nextStation: undefined,
        progressPercent: undefined,
      };
    }
    return {
      prevStation: stations[0],
      nextStation: stations[1],
      progressPercent: Math.floor(
        (stations[0].distance * 100) /
          (stations[0].distance + stations[1].distance)
      ),
    };
  }, [stations]);

  const prevStationRef = useRef<HTMLDivElement>(null);
  const stationListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!prevStationRef.current || !stationListRef.current) return;
    stationListRef.current.scrollTo({
      left: prevStationRef.current.offsetLeft,
      behavior: 'smooth',
    });
  }, [trip, stations]);

  return (
    <>
      <Card className="mb-3">
        <Card.Header>Live location</Card.Header>
        <Card.Body className="d-flex flex-column gap-2 pb-1">
          <span>
            You are between {prevStation?.stop_name} and{' '}
            {nextStation?.stop_name} ({progressPercent}%)
          </span>
        </Card.Body>
        <div className="overflow-auto user-select-none" ref={stationListRef}>
          <div className="d-flex">
            {db &&
              db.stops.map((stop) => (
                <div
                  key={stop.stop_id}
                  className="d-flex flex-column"
                  onDoubleClick={() => {
                    if (visitedStops.includes(stop.stop_id))
                      setVisitedStops((s) =>
                        s.filter((sid) => sid !== stop.stop_id)
                      );
                    else setVisitedStops((s) => [...s, stop.stop_id]);
                  }}
                  style={{
                    height: '130px',
                  }}
                >
                  <div className="flex-fill"></div>
                  <div
                    className="text-nowrap"
                    style={{
                      width: '70px',
                      transform: 'translate(50%, 0px) rotate(-45deg)',
                      transformOrigin: 'bottom left',
                    }}
                    ref={
                      stop.stop_id === prevStation?.stop_id
                        ? prevStationRef
                        : undefined
                    }
                  >
                    {stop.stop_name}
                  </div>
                  <div className="d-flex mb-2">
                    <div
                      className="flex-fill"
                      style={
                        stop.stop_time.stop_sequence > 1
                          ? {
                              background: "url('/dash.svg')",
                              backgroundSize: 'contain',
                            }
                          : {}
                      }
                    ></div>
                    {!visitedStops.includes(stop.stop_id) ? (
                      <i className="inline-block bi-circle"></i>
                    ) : (
                      <i className="bi-check-circle"></i>
                    )}
                    <div
                      className="flex-fill"
                      style={
                        stop.stop_time.stop_sequence !== db.stops.length
                          ? {
                              background: "url('/dash.svg')",
                              backgroundSize: 'contain',
                            }
                          : {}
                      }
                    ></div>
                  </div>
                </div>
              ))}
          </div>
          {db && prevStation && progressPercent && (
            <div
              style={{
                transformOrigin: 'center',
                transform: `translate(${
                  35 +
                  (prevStation.stop_time.stop_sequence - 1) * 70 +
                  (progressPercent / 100) * 70
                }px, 0)`,
              }}
            >
              <div
                className="bi-caret-up"
                style={{
                  marginLeft: '-8px',
                  marginTop: '-15px',
                }}
              ></div>
            </div>
          )}
        </div>
        <Card.Footer>
          <small>Double tap a station circle to mark it as visited.</small>
        </Card.Footer>
      </Card>
      {prevStation && nextStation && (
        <Timetable
          {...{ prevStation, nextStation, progressPercent, destination }}
        />
      )}
    </>
  );
}
