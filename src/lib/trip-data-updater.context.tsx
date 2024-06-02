import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Gtfs } from './gtfs';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from './auth.context';

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
  const { handleAxiosError } = useAuth();

  const isFirstTime = useLiveQuery(async () => {
    return await Gtfs.isFirstTimeDownload();
  });

  function startUpdate() {
    setIsChecking(true);
    Gtfs.updateTripData((downloadDecision) => {
      if (downloadDecision) {
        setIsChecking(false);
        setIsUpdating(true);
      }
    })
      .catch(handleAxiosError)
      .finally(() => {
        setIsUpdating(false);
      });
  }

  useEffect(() => {
    startUpdate();
  }, []);

  const ctx = {
    isUpdating,
    isChecking,
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
