import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import './lib/dexie/dexie';
import { gtfsdb } from './lib/dexie/dexie';
import { Gtfs } from './lib/gtfs';

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);

Gtfs.updateTripData(gtfsdb);
