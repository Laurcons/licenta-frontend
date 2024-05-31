import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './pages/App';
import './lib/dexie/dexie';
import HomePage from './pages/home/HomePage';
import TrackPage from './pages/track/TrackPage';
import TripDataUpdaterProvider from './lib/trip-data-updater.context';
import { LangProvider } from './lib/lang.context';
import YahooAuthPage from './pages/auth/YahooAuthPage';
import { AuthProvider } from './lib/hooks/useAuth';

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        path: 'auth/yahoo',
        Component: YahooAuthPage,
      },
      {
        path: 'track/:trainNum',
        Component: TrackPage,
      },
      {
        path: '/',
        Component: HomePage,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <TripDataUpdaterProvider>
    <LangProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LangProvider>
  </TripDataUpdaterProvider>
  // </React.StrictMode>
);

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (param: {
            client_id: string;
            callback: (data: { credential: string }) => void;
          }) => void;
          renderButton: (
            elem: HTMLElement,
            options: { locale: string; theme: string; size: string }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}
