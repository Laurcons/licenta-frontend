import Dexie from 'dexie';
import { DxAgency } from './models/dx-agency';
import { DxCalendarDate } from './models/dx-calendarDate';
import { DxCalendar } from './models/dx-calendar';
import { DxRoute } from './models/dx-route';
import { DxStopTime } from './models/dx-stopTime';
import { DxStop } from './models/dx-stop';
import { DxTrip } from './models/dx-trip';
import { Setting } from './models/setting';
import { UserTrip } from './models/user-trip';

export class GtfsDatabase extends Dexie {
  agency!: Dexie.Table<DxAgency, string>;
  calendar_dates!: Dexie.Table<DxCalendarDate, string>;
  calendar!: Dexie.Table<DxCalendar, string>;
  routes!: Dexie.Table<DxRoute, string>;
  stop_times!: Dexie.Table<DxStopTime, string>;
  stops!: Dexie.Table<DxStop, string>;
  trips!: Dexie.Table<DxTrip, string>;

  constructor() {
    super('mersultrenurilor');
    this.version(1).stores({
      agency: 'agency_id',
      calendar_dates: 'service_id',
      calendar: 'service_id',
      routes: 'route_id,agency_id',
      stop_times: '[trip_id+stop_id+stop_sequence],arrival_time',
      stops: 'stop_id,stop_name',
      trips: 'trip_id,route_id,service_id',
    });
  }
}

export class LocalDatabase extends Dexie {
  settings!: Dexie.Table<Setting, string>;
  userTrips!: Dexie.Table<UserTrip, number>;

  constructor() {
    super('localdatabase');
    this.version(1).stores({
      settings: 'key',
      userTrips: '++id,trainNum,trackStartedAt',
    });
  }
}

export interface GtfsFileNameMap {
  agency: DxAgency;
  calendar_dates: DxCalendarDate;
  calendar: DxCalendar;
  routes: DxRoute;
  stop_times: DxStopTime;
  stops: DxStop;
  trips: DxTrip;
}

export const gtfsdb = new GtfsDatabase();
export const localdb = new LocalDatabase();

// gtfsdb.on('close', console.error);
// gtfsdb.on('blocked', console.error);
// gtfsdb.on('populate', console.error);
// gtfsdb.on('versionchange', console.error);
