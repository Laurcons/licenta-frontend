import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Gtfs } from './gtfs';
import { useLiveQuery } from 'dexie-react-hooks';

export const TripDataUpdaterContext = createContext({
  isUpdating: true,
  // setIsUpdating: (val: boolean) => {
  //   console.error('Context not initialized');
  // },
  isChecking: false,
  startUpdate: () => {},
  isFirstTime: false,
});

export default function TripDataUpdaterProvider(props: PropsWithChildren) {
  const [isChecking, setIsChecking] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const isFirstTime = useLiveQuery(async () => {
    return await Gtfs.isFirstTimeDownload();
  });

  function startUpdate() {
    Gtfs.updateTripData((downloadDecision) => {
      if (downloadDecision) {
        setIsChecking(false);
        setIsUpdating(true);
      }
    }).then(() => {
      setIsUpdating(false);
    });
  }

  const ctx = {
    isUpdating,
    isChecking,
    // setIsUpdating,
    isFirstTime: !!isFirstTime,
    startUpdate,
  };
  return (
    <TripDataUpdaterContext.Provider value={ctx}>
      {props.children}
    </TripDataUpdaterContext.Provider>
  );
}

export function useTripDataUpdater() {
  return useContext(TripDataUpdaterContext);
}
