import { Collapse, Spinner } from 'react-bootstrap';
import { useTripDataUpdater } from '../lib/trip-data-updater.context';

export default function UpdatingTripDataBanner() {
  const { isUpdating } = useTripDataUpdater();
  return (
    <>
      <Collapse in={isUpdating}>
        <div>
          <div
            style={{
              display: 'flex',
              gap: 15,
              justifyContent: 'center',
              alignItems: 'center',
              background: 'yellow',
              padding: '10 2',
            }}
          >
            <Spinner size="sm" animation="border" />
            Updating trip information...
          </div>
        </div>
      </Collapse>
    </>
  );
}
