import { useState } from 'react';
import { LiveLocationSection } from './LiveLocationSection';
import NewTripFormSection from './NewTripFormSection';
import PreviousTripsSection from './PreviousTripsSection';
import ScanQRModal from './ScanQRModal';
import { useAuth } from '../../lib/auth.context';
import LoginSection from './LoginSection';

export default function HomePage() {
  const [isScanningQr, setIsScanningQr] = useState(false);
  const { user, isLoading: isUserLoading, hasInternet } = useAuth();

  return (
    <>
      <LiveLocationSection />
      <NewTripFormSection onScanClick={() => setIsScanningQr(true)} />
      {!isUserLoading && !user && hasInternet && <LoginSection />}
      <PreviousTripsSection />
      <ScanQRModal
        isOpen={isScanningQr}
        onClose={() => setIsScanningQr(false)}
      />
    </>
  );
}
