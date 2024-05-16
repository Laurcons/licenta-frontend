import { useState } from 'react';
import { LiveLocationNoTrip } from './LiveLocationNoTrip';
import NewTripForm from './NewTripForm';
import PreviousTrips from './PreviousTrips';
import ScanQRModal from './ScanQRModal';

export default function HomePage() {
  const [isScanningQr, setIsScanningQr] = useState(false);

  return (
    <>
      <LiveLocationNoTrip />
      <NewTripForm onScanClick={() => setIsScanningQr(true)} />
      <PreviousTrips />
      <ScanQRModal
        isOpen={isScanningQr}
        onClose={() => setIsScanningQr(false)}
      />
    </>
  );
}
