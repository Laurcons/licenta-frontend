import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Button, Card, Collapse, Form } from 'react-bootstrap';
import { gtfsdb } from '../../lib/dexie/dexie';
import { DxUtils } from '../../lib/dexie/dx.utils';
import { useNavigate } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import useItineraryQuery from '../../lib/hooks/useItineraryQuery';

export default function NewTripForm({
  onScanClick,
}: {
  onScanClick?: () => void;
}) {
  const [trainNum, setTrainNum] = useState('');
  const [destinationId, setDestinationId] = useState<string | null>(null);

  const db = useItineraryQuery(trainNum);

  return (
    <Card className="mb-3">
      <Card.Body>
        <h1 className="fs-2">New trip</h1>
        <p>Where are we going?</p>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Train number:</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g. 2038"
              value={trainNum}
              onChange={(ev) => setTrainNum(ev.target.value)}
            ></Form.Control>
            <small className="text-muted">
              Enter the train number without letters
            </small>
          </Form.Group>
          <Collapse in={!!db?.route}>
            <div>
              <dl>
                <dt>Train:</dt>
                <dd>
                  {db?.trip.trip_short_name} {db?.trip.trip_id}{' '}
                  {db?.route.route_short_name}
                  <br />
                  Depart
                  {db &&
                  DxUtils.timeToDayjs(
                    db!.stopTimes[0].departure_time
                  ).isBefore()
                    ? 'ed'
                    : 's'}{' '}
                  today at{' '}
                  {db &&
                    DxUtils.timeToDayjs(db!.stopTimes[0].departure_time).format(
                      'HH:mm'
                    )}
                </dd>
              </dl>
              <Form.Group className="mb-3">
                <Form.Label>Destination:</Form.Label>
                <Form.Select
                  value={destinationId ?? 'none'}
                  onChange={(ev) =>
                    setDestinationId(
                      ev.target.value === 'none' ? null : ev.target.value
                    )
                  }
                >
                  <option value="none">None</option>
                  {db?.stops
                    .filter((stop) => stop.stop_time?.stop_sequence !== 1)
                    .map((stop) => (
                      <option key={stop.stop_id} value={stop.stop_id}>
                        {stop.stop_name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </div>
          </Collapse>
          <div className="d-flex gap-1">
            <LinkContainer
              to={{
                pathname: `/track/${trainNum}`,
                search: `destinationId=${destinationId ?? ''}`,
              }}
            >
              <Button disabled={!db}>
                <i className="bi-cursor me-2"></i>
                Track this trip
              </Button>
            </LinkContainer>
            <Button variant="outline-primary" onClick={() => onScanClick?.()}>
              <i className="bi-camera me-2"></i>
              Or scan ticket QR
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
