import { useLiveQuery } from 'dexie-react-hooks';
import { Badge, Button, Card } from 'react-bootstrap';
import { gtfsdb, localdb } from '../../lib/dexie/dexie';
import { LinkContainer } from 'react-router-bootstrap';

export default function PreviousTrips() {
  const prevTrips = useLiveQuery(async () => {
    const trips = await localdb.userTrips
      .toArray()
      .then((ts) =>
        ts.sort(
          (a, b) => b.trackStartedAt.getTime() - a.trackStartedAt.getTime()
        )
      );
    return Promise.all(
      trips.map(async (trip) => {
        const gtfsTrip = await gtfsdb.trips.get(trip.trainNum);
        const gtfsStopTimes = await gtfsdb.stop_times
          .where({
            trip_id: gtfsTrip!.trip_id,
          })
          .sortBy('stop_sequence');
        const gtfsStops = await gtfsdb.stops
          .bulkGet(gtfsStopTimes.map((st) => st.stop_id))
          .then((stops) =>
            stops.map((stop) => {
              const gtfsStopTime = gtfsStopTimes.find(
                (st) => st.stop_id === stop!.stop_id
              );
              return {
                ...stop,
                stopTime: gtfsStopTime,
              };
            })
          );
        return {
          ...trip,
          gtfsTrip,
          gtfsStops,
          gtfsDestination:
            gtfsStops.find((s) => s.stop_id === trip.destinationId) ??
            gtfsStops.at(-1),
        };
      })
    );
  }, []);

  function handleDelete(id: number) {
    localdb.userTrips.delete(id);
  }

  return (
    <Card className="mb-3">
      <Card.Body>
        <h1 className="fs-3">Previous trips</h1>
        {prevTrips?.length === 0 && (
          <p>Your previous trips will be displayed here.</p>
        )}
        {(prevTrips?.length ?? 0) > 0 && (
          <>
            {prevTrips!.map((trip) => (
              <Card key={trip.id} className="mb-2">
                <Card.Body className="d-flex">
                  <LinkContainer
                    to={{
                      pathname: `/track/${trip.trainNum}`,
                      search: `destinationId=${trip.destinationId}&userTripId=${trip.id}`,
                    }}
                  >
                    <div className="d-flex flex-fill flex-column" role="button">
                      <div>In {trip.date}</div>
                      <div>
                        <Badge bg="primary" className="me-2">
                          {trip.gtfsTrip?.trip_short_name}{' '}
                          {trip.gtfsTrip?.trip_id}
                        </Badge>
                        to {trip.gtfsDestination?.stop_name}
                      </div>
                    </div>
                  </LinkContainer>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(trip.id!)}
                    >
                      <i className="bi-trash"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </>
        )}
      </Card.Body>
    </Card>
  );
}
