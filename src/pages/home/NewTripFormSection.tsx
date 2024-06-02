import { useState } from 'react';
import { Alert, Button, Card, Collapse, Form } from 'react-bootstrap';
import { DxUtils } from '../../lib/dexie/dx.utils';
import { LinkContainer } from 'react-router-bootstrap';
import useItineraryQuery from '../../lib/hooks/useItineraryQuery';
import { useLanguage } from '../../lib/language.context';
import { useTripDataUpdater } from '../../lib/trip-data-updater.context';

function IncompleteDataAlert() {
  const { isUpdating, isFirstTime } = useTripDataUpdater();
  if (!isUpdating || !isFirstTime) return null;
  return (
    <>
      <Alert variant="danger">
        Please wait while we download trip data for the first time...
      </Alert>
    </>
  );
}

export default function NewTripFormSection({
  onScanClick,
}: {
  onScanClick?: () => void;
}) {
  const [trainNum, setTrainNum] = useState('');
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const { t } = useLanguage();

  const db = useItineraryQuery(trainNum);

  return (
    <Card className="mb-3">
      <Card.Body>
        <h1 className="fs-2">{t('home.newTrip.title')}</h1>
        <p>{t('home.newTrip.subtitle')}</p>
        <IncompleteDataAlert />
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t('home.newTrip.trainNum')}</Form.Label>
            <Form.Control
              type="number"
              placeholder={t('home.newTrip.trainNumPlaceholder')}
              value={trainNum}
              onChange={(ev) => setTrainNum(ev.target.value)}
            ></Form.Control>
            <small className="text-muted">
              {t('home.newTrip.trainNumHelp')}
            </small>
          </Form.Group>
          <Collapse in={!!db?.route}>
            <div>
              <dl>
                <dt>{t('home.newTrip.trainData.title')}</dt>
                <dd>
                  {db?.trip.trip_short_name} {db?.trip.trip_id}{' '}
                  {db?.route.route_short_name}
                  <br />
                  {t(
                    db &&
                      DxUtils.timeToDayjs(
                        db!.stopTimes[0].departure_time
                      ).isBefore()
                      ? 'home.newTrip.trainData.departed'
                      : 'home.newTrip.trainData.departs',
                    db &&
                      DxUtils.timeToDayjs(
                        db!.stopTimes[0].departure_time
                      ).format('HH:mm')
                  )}
                </dd>
              </dl>
              <Form.Group className="mb-3">
                <Form.Label>
                  {t('home.newTrip.trainData.destination')}
                </Form.Label>
                <Form.Select
                  value={destinationId ?? 'none'}
                  onChange={(ev) =>
                    setDestinationId(
                      ev.target.value === 'none' ? null : ev.target.value
                    )
                  }
                >
                  <option value="none">
                    {t('home.newTrip.trainData.none')}
                  </option>
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
                {t('home.newTrip.trackBtn')}
              </Button>
            </LinkContainer>
            <Button variant="outline-primary" onClick={() => onScanClick?.()}>
              <i className="bi-camera me-2"></i>
              {t('home.newTrip.scanBtn')}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
