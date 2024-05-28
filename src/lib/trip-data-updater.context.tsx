import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Gtfs } from './gtfs';

export const TripDataUpdaterContext = createContext({
  isUpdating: false,
  setIsUpdating: (val: boolean) => {
    console.error('Context not initialized');
  },
});

export default function TripDataUpdaterProvider(props: PropsWithChildren) {
  const [isUpdating, setIsUpdating] = useState(false);
  const ctx = { isUpdating, setIsUpdating };
  return (
    <TripDataUpdaterContext.Provider value={ctx}>
      {props.children}
    </TripDataUpdaterContext.Provider>
  );
}

export function useTripDataUpdater() {
  const context = useContext(TripDataUpdaterContext);
  useEffect(() => {
    context.setIsUpdating(true);
    Gtfs.updateTripData().then(() => context.setIsUpdating(false));
  }, []);
}
