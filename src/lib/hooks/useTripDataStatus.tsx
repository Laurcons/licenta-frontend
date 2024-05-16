import { useContext } from 'react';
import { TripDataUpdaterContext } from './TripDataUpdater';

export default function useTripDataStatus() {
  const { isUpdating } = useContext(TripDataUpdaterContext);
  return {
    isUpdating,
  };
}
