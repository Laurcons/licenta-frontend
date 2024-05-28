import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './pages/App';
import './lib/dexie/dexie';
import HomePage from './pages/home/HomePage';
import TrackPage from './pages/track/TrackPage';
import TripDataUpdaterProvider from './lib/trip-data-updater.context';
import { LangProvider } from './lib/lang.context';

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
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
      <RouterProvider router={router} />
    </LangProvider>
  </TripDataUpdaterProvider>
  // </React.StrictMode>
);
