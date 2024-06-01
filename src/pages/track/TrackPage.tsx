import { useEffect, useMemo } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import useItineraryQuery from '../../lib/hooks/useItineraryQuery';
import { LinkContainer } from 'react-router-bootstrap';
import { gtfsdb, localdb } from '../../lib/dexie/dexie';
import dayjs from 'dayjs';
import { LiveLocation } from './LiveLocation';
import { useLiveQuery } from 'dexie-react-hooks';
import { DxStop } from '../../lib/dexie/models/dx-stop';
import { DxStopTime } from '../../lib/dexie/models/dx-stopTime';
import LiveAnimation from './LiveAnimation';
import { UserTrip } from '../../lib/dexie/models/user-trip';
import { useLanguage } from '../../lib/language';
import { useTripDataUpdater } from '../../lib/trip-data-updater';

export default function TrackPage() {
  const { trainNum } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const destinationId = useMemo(
    () => searchParams.get('destinationId'),
    [searchParams]
  );
  const userTripId = useMemo(
    () => searchParams.get('userTripId'),
    [searchParams]
  );
  const db = useItineraryQuery(trainNum ?? '');
  const userTrip = useLiveQuery(() => {
    if (!userTripId) return undefined;
    return localdb.userTrips.get(parseInt(userTripId));
  }, [userTripId]);

  if (!trainNum || !db) return <IncorrectTrainNum trainNum={trainNum} />;
  if (userTripId && !userTrip) {
    // if there is an id but no trip, it means the id is invalid
    //  (maybe from another account?)
    setSearchParams((prev) => {
      const curr = new URLSearchParams(prev);
      curr.delete('userTripId');
      return curr;
    });
    return null;
  }

  return <ValidTrackPage {...{ trainNum, destinationId, db, userTrip }} />;
}

function ValidTrackPage({
  trainNum,
  destinationId,
  db,
  userTrip,
}: {
  trainNum: string;
  destinationId: string | null;
  db: ReturnType<typeof useItineraryQuery>;
  userTrip?: UserTrip;
}) {
  const { t } = useLanguage();
  const destination = useLiveQuery(async () => {
    if (!destinationId) return undefined;
    const destStop = (await gtfsdb.stops.get(destinationId)) as DxStop;
    const destStopTime = (await gtfsdb.stop_times.get({
      stop_id: destinationId,
      trip_id: db!.trip.trip_id,
    })) as DxStopTime;
    return {
      ...destStop,
      stop_time: destStopTime,
    };
  }, [destinationId]);

  useEffect(() => {
    (async () => {
      // add in trip history
      // check if not already added
      const search = {
        date: dayjs().format('YYYY-MM-DD'),
        trainNum,
        destinationId: destinationId ?? undefined,
      };
      const prevTrip = await localdb.userTrips.get(search);
      if (prevTrip) return;
      await localdb.userTrips.put({
        ...search,
        trackStartedAt: new Date(),
      });
    })();
  }, [trainNum, destinationId]);

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <div className="float-end">
            <LiveAnimation />
          </div>
          <h1 className="fs-3">
            {t(
              'track.header.title',
              db!.trip.trip_short_name,
              db!.trip.trip_id
            )}
            {/* Tracking train {db!.trip.trip_short_name} {db!.trip.trip_id} */}
          </h1>
          <p>
            {t(
              'track.header.fromTo',
              db!.stops.at(0)?.stop_name,
              db!.stops.at(-1)?.stop_name
            )}
            {/* From {db!.stops.at(0)?.stop_name} to {db!.stops.at(-1)?.stop_name} */}
            {destination && (
              <>
                <br />
                {t('track.header.destination', destination?.stop_name)}
                {/* You are traveling to {destination?.stop_name} */}
                {userTrip?.ticketDecodedInfo && (
                  <>
                    {t(
                      'track.header.ticket',
                      userTrip.ticketDecodedInfo.serial
                    )}
                  </>
                  // <> on ticket {userTrip.ticketDecodedInfo.serial}</>
                )}
              </>
            )}
          </p>
        </Card.Body>
      </Card>
      <LiveLocation trainNum={db!.trip.trip_id} destination={destination} />
    </>
  );
}

function ErrorBackButton() {
  return (
    <LinkContainer to="/">
      <Button variant="outline-primary" size="sm" className="mb-3">
        Back to home
      </Button>
    </LinkContainer>
  );
}

function IncorrectTrainNum({ trainNum }: { trainNum?: string }) {
  const { isUpdating } = useTripDataUpdater();
  return (
    <>
      <ErrorBackButton />
      {!isUpdating && (
        <Alert variant="danger">Invalid train number {trainNum}.</Alert>
      )}
    </>
  );
}
