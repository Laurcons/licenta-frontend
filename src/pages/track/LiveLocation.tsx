import { useLiveQuery } from 'dexie-react-hooks';
import { DxTrip } from '../../lib/dexie/models/dx-trip';
import { gtfsdb } from '../../lib/dexie/dexie';
import { Card } from 'react-bootstrap';
import { useGeolocated } from 'react-geolocated';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CoordUtil } from '../../lib/coord.util';
import { DxStop } from '../../lib/dexie/models/dx-stop';
import { DxStopTime } from '../../lib/dexie/models/dx-stopTime';
import { Timetable } from './Timetable';

export function LiveLocation({
  trainNum,
  destination,
}: {
  trainNum: string;
  destination?: DxStop & { stop_time: DxStopTime };
}) {
  const [lastSnappedToStation, setLastSnappedToStation] = useState<
    (DxStop & { stop_time: DxStopTime }) | undefined
  >(undefined);

  const prevStationRef = useRef<HTMLDivElement>(null);
  const stationListRef = useRef<HTMLDivElement>(null);

  const { coords: userCoords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchPosition: true,
  });

  const db = useLiveQuery(async () => {
    if (!trainNum) return undefined;
    const trip = await gtfsdb.trips.get({
      trip_id: trainNum,
    });
    if (!trip) return undefined;
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
  }, [trainNum]);

  // closest two stations
  // (basically, stations that are the
  //  ends of the closest station-segment to us)
  const closestStations = useMemo(() => {
    if (!db?.stops?.length) return;
    if (!userCoords) return;
    console.log(
      db.stops.reduce(
        (lines, stop) => lines + `[${stop.stop_lat},${stop.stop_lon}],\n`,
        ''
      )
    );
    return (
      db.stops
        .slice() // make copy that we can sort
        .sort((a, b) => a.stop_time.stop_sequence - b.stop_time.stop_sequence)
        // create a list of pairings of consecutive stations
        .reduce<{
          pairings: {
            pair: (DxStop & { stop_time: DxStopTime })[];
            dist: number;
          }[];
          last?: DxStop & { stop_time: DxStopTime };
        }>(
          (state, curr) => {
            if (!state.last) return { ...state, last: curr };
            return {
              pairings: [
                ...state.pairings,
                {
                  pair: [state.last, curr],
                  dist: CoordUtil.distToSegment(userCoords, [
                    {
                      latitude: state.last.stop_lat,
                      longitude: state.last.stop_lon,
                    },
                    { latitude: curr.stop_lat, longitude: curr.stop_lon },
                  ]),
                },
              ],
              last: curr,
            };
          },
          { pairings: [], last: undefined }
        )
        // we do not care about the .last element
        .pairings // now find the pairing with the smallest distance and return it
        .reduce((minPairing, pairing) => {
          console.log(
            `leg ${pairing.pair[0].stop_name} to ${pairing.pair[1].stop_name} distance ${pairing.dist}`
          );
          if (pairing.dist < minPairing.dist) return pairing;
          return minPairing;
        })
        // prettier-ignore
        .pair // calculate distance to each of these (two) stations
        .map((stop) => ({
          ...stop,
          distance: CoordUtil.distance(
            { latitude: stop.stop_lat, longitude: stop.stop_lon },
            userCoords
          ),
        }))
    );
  }, [db?.stops, userCoords]);

  const isInStation = useMemo(() => {
    return closestStations?.find((st) => st.distance < 0.25); // km
  }, [closestStations]);

  const { prevStation, nextStation, progressPercent } = useMemo(() => {
    if (!closestStations) {
      return {
        prevStation: undefined,
        nextStation: undefined,
        progressPercent: undefined,
      };
    }
    return {
      prevStation: closestStations[0],
      nextStation: closestStations[1],
      progressPercent: Math.floor(
        (closestStations[0].distance * 100) /
          (closestStations[0].distance + closestStations[1].distance)
      ),
    };
  }, [closestStations]);

  useEffect(() => {
    if (!prevStationRef.current || !stationListRef.current) return;
    if (
      lastSnappedToStation &&
      prevStation &&
      prevStation.stop_time.stop_sequence <
        lastSnappedToStation?.stop_time.stop_sequence
    )
      return;
    setLastSnappedToStation(prevStation);
    stationListRef.current.scrollTo({
      left: prevStationRef.current.offsetLeft,
      behavior: 'smooth',
    });
  }, [db, closestStations]);

  return (
    <>
      <Card className="mb-3">
        <Card.Header>Live location</Card.Header>
        <Card.Body className="d-flex flex-column gap-2 pb-1">
          {!!isInStation && <span>You are in {isInStation.stop_name}</span>}
          {!isInStation && (
            <span>
              You are between {prevStation?.stop_name} and{' '}
              {nextStation?.stop_name} ({progressPercent}%).
            </span>
          )}
        </Card.Body>
        <div className="overflow-auto user-select-none" ref={stationListRef}>
          <div className="d-flex">
            {db &&
              db.stops.map((stop) => (
                <div
                  key={stop.stop_id}
                  className="d-flex flex-column"
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
                    <i className="inline-block bi-circle"></i>
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
      </Card>
      {prevStation && nextStation && (
        <Timetable
          {...{ prevStation, nextStation, progressPercent, destination }}
        />
      )}
    </>
  );
}
