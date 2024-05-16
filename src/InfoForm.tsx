import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { gtfsdb } from './lib/dexie/dexie';
import { DxTrip } from './lib/dexie/models/dx-trip';
import { DxStop } from './lib/dexie/models/dx-stop';
import { DxStopTime } from './lib/dexie/models/dx-stopTime';

export function InfoForm({
  onTrip,
  onDestination,
}: {
  onTrip?: (t?: DxTrip) => void;
  onDestination?: (d?: DxStop & { stop_time: DxStopTime }) => void;
}) {
  const [trainNum, setTrainNum] = useState('3088');
  const [destinationId, setDestinationId] = useState<string | null>(null);

  const db = useLiveQuery(async () => {
    if (!trainNum) return undefined;
    const trip = await gtfsdb.trips.get({
      trip_id: trainNum,
    });
    onTrip?.(trip);
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
      trip,
      route,
      stops,
    };
  }, [trainNum]);

  const destination = useLiveQuery(async () => {
    if (!destinationId) return undefined;
    const dest = {
      ...(await gtfsdb.stops.get(destinationId)),
      stop_time: await gtfsdb.stop_times.get({
        stop_id: destinationId,
        trip_id: trainNum,
      })!,
    } as Required<DxStop & { stop_time: DxStopTime }>;
    onDestination?.(dest);
    return dest;
  }, [destinationId]);

  return (
    <>
      <InputGroup className="mb-3">
        {db && <InputGroup.Text>{db.trip.trip_short_name}</InputGroup.Text>}
        <Form.Control
          type="text"
          value={trainNum}
          onChange={(ev) => {
            setTrainNum(ev.target.value);
            setDestinationId(null);
          }}
          placeholder="Train number without prefix"
        />
        {db && <InputGroup.Text>{db.route.route_short_name}</InputGroup.Text>}
      </InputGroup>
      {db && (
        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>Destination</Form.Label>
          </Col>
          <Col>
            <Form.Select
              value={destinationId ?? 'not-selected'}
              onChange={(ev) => setDestinationId(ev.target.value)}
            >
              <option value="not-selected" disabled>
                Choose...
              </option>
              {db.stops.map((stop) => (
                <>
                  <option
                    key={stop.stop_id}
                    value={stop?.stop_id}
                    disabled={!stop?.stop_time?.arrival_time}
                  >
                    {stop?.stop_name} (
                    {(
                      stop?.stop_time?.arrival_time ||
                      stop?.stop_time?.departure_time ||
                      '??:??'
                    )
                      .split(':')
                      .slice(0, 2)
                      .join(':')}
                    )
                  </option>
                </>
              ))}
            </Form.Select>
          </Col>
        </Row>
      )}
    </>
  );
}
