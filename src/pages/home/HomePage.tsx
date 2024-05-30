import { useState } from 'react';
import { LiveLocationSection } from './LiveLocationSection';
import NewTripFormSection from './NewTripFormSection';
import PreviousTripsSection from './PreviousTripsSection';
import ScanQRModal from './ScanQRModal';
import LoginSection from './LoginSection';

export default function HomePage() {
  const [isScanningQr, setIsScanningQr] = useState(false);

  return (
    <>
      <LiveLocationSection />
      <NewTripFormSection onScanClick={() => setIsScanningQr(true)} />
      <LoginSection />
      <PreviousTripsSection />
      <ScanQRModal
        isOpen={isScanningQr}
        onClose={() => setIsScanningQr(false)}
      />
    </>
  );
}
