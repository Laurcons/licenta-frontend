import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { User } from './models/user';
import axiosStatic, { AxiosError, AxiosInstance } from 'axios';
import { config } from './config';
import { localdb } from './dexie/dexie';

const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  token: string | null;
  setToken: (tok: string | null) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  axios: AxiosInstance;
  hasInternet: boolean;
  retryAuth: () => void;
  handleAxiosError: (err: any) => void;
}>({
  user: null,
  isLoading: true,
  token: null,
  setToken: () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
  axios: axiosStatic.create(),
  hasInternet: true,
  retryAuth: () => {},
  handleAxiosError: (err: any) => {},
});

export function AuthProvider(props: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [axios, setAxios] = useState<AxiosInstance>(createAxiosInstance);
  const [hasInternet, setHasInternet] = useState(true);

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

  function createAxiosInstance() {
    let instance: AxiosInstance;
    if (!user) {
      instance = axiosStatic.create({
        baseURL: config.apiBase,
      });
    } else {
      instance = axiosStatic.create({
        baseURL: config.apiBase,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    instance.interceptors.response.use(
      (resp) => resp,
      (error) => handleAxiosError(error)
    );
    return instance;
  }

  function handleAxiosError(error: any) {
    console.error('Handing axios error in auth context', error);
    if (error instanceof AxiosError) {
      if (
        (error.response && error.response.status === 502) ||
        !error.response
      ) {
        // has internet, api unavailable (502 Bad Gateway) OR
        // server unreachable (server off / no internet)
        setHasInternet(false);
        setUser(null);
      } else {
        setHasInternet(true);
      }
      if (error.response?.data.message === 'Unauthorized') {
        setUser(null);
      }
    }
    throw error;
  }

  function tryAuth() {
    // if (!token) {
    //   setUser(null);
    //   setIsLoading(false);
    //   return;
    // }
    (async () => {
      // try to use token
      try {
        setIsLoading(true);
        const userResp = await axiosStatic.get('/users/me', {
          baseURL: config.apiBase,
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
        // set user
        setUser(userResp.data.user);
        setShowLoginModal(false);
        setHasInternet(true);
      } catch (err: any) {
        handleAxiosError(err);
        // if (err instanceof AxiosError && err.response?.status === 403) {
        //   setTokenAndStorage(null);
        // }
      } finally {
        setIsLoading(false);
      }
    })();
  }

  // load token from localdb
  useEffect(() => {
    (async () => {
      const setting = await localdb.settings.get('authToken');
      if (setting) {
        setToken(setting.value);
        setIsLoading(true);
      }
    })();
  }, []);

  // try to log in
  useEffect(() => {
    tryAuth();
  }, [token]);

  // configure axios instance
  useEffect(() => {
    setAxios(createAxiosInstance);
  }, [user]);

  const ctx = {
    user,
    token,
    setToken: setTokenAndStorage,
    isLoading,
    showLoginModal,
    setShowLoginModal,
    axios,
    hasInternet: navigator.onLine ? hasInternet : false,
    retryAuth: tryAuth,
    handleAxiosError,
  };
  return (
    <AuthContext.Provider value={ctx}>{props.children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
