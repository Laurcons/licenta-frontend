import { useState } from 'react';
import { LiveLocationSection } from './LiveLocationSection';
import NewTripFormSection from './NewTripFormSection';
import PreviousTripsSection from './PreviousTripsSection';
import ScanQRModal from './ScanQRModal';
import { useAuth } from '../../lib/hooks/useAuth';
import LoginSection from './LoginSection';

export default function HomePage() {
  const [isScanningQr, setIsScanningQr] = useState(false);
  const { user, isLoading: isUserLoading } = useAuth();

  return (
    <>
      <LiveLocationSection />
      <NewTripFormSection onScanClick={() => setIsScanningQr(true)} />
      {!isUserLoading && !user && <LoginSection />}
      <PreviousTripsSection />
      <ScanQRModal
        isOpen={isScanningQr}
        onClose={() => setIsScanningQr(false)}
      />
    </>
  );
}
