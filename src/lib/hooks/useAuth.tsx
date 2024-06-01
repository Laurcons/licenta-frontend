import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { User } from '../models/user';
import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { localdb } from '../dexie/dexie';

const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  token: string | null;
  setToken: (tok: string | null) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}>({
  user: null,
  isLoading: true,
  token: null,
  setToken: () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
});

export function AuthProvider(props: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    (async () => {
      // load from localdb
      const setting = await localdb.settings.get('authToken');
      if (setting) {
        setToken(setting.value);
        setIsLoading(true);
      }
    })();
  }, []);

  useEffect(() => {
    console.log('Checking', { user, token, isLoading });
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    (async () => {
      // try to use token
      try {
        const userResp = await axios.get(config.apiBase + '/users/me', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
        // set user
        setUser(userResp.data.user);
        setIsLoading(false);
        setShowLoginModal(false);
      } catch (err: any) {
        if (err instanceof AxiosError) {
          setToken(null);
          return;
        }
      }
    })();
  }, [token]);

  function setTokenAndStorage(tok: string | null) {
    if (tok) {
      localdb.settings.put({
        key: 'authToken',
        value: tok,
      });
    } else {
      localdb.settings.delete('authToken');
    }
    setToken(tok);
  }

  const ctx = {
    user,
    token,
    setToken: setTokenAndStorage,
    isLoading,
    showLoginModal,
    setShowLoginModal,
  };
  return (
    <AuthContext.Provider value={ctx}>{props.children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
