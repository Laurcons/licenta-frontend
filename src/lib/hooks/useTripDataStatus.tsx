import { useContext } from 'react';
import { TripDataUpdaterContext } from '../trip-data-updater.context';

export default function useTripDataStatus() {
  const { isUpdating } = useContext(TripDataUpdaterContext);
  return {
    isUpdating,
  };
}
