import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './pages/App';
import './lib/dexie/dexie';
import { gtfsdb } from './lib/dexie/dexie';
import { Gtfs } from './lib/gtfs';
import HomePage from './pages/home/HomePage';
import TrackPage from './pages/track/TrackPage';
import TripDataUpdaterProvider from './lib/hooks/TripDataUpdater';

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
    <RouterProvider router={router} />
  </TripDataUpdaterProvider>
  // </React.StrictMode>
);
