import { Axios, AxiosResponse } from 'axios';
import { config } from './config';
import { GtfsDatabase, GtfsFileNameMap, gtfsdb, localdb } from './dexie/dexie';
import dayjs from 'dayjs';
import { parse as csvParse } from 'csv-parse/browser/esm/sync';

export class Gtfs {
  static #axios = new Axios({
    baseURL: config.apiBase,
  });

  static async updateTripData() {
    const files: (keyof GtfsFileNameMap)[] = [
      'agency',
      'calendar',
      'calendar_dates',
      'routes',
      'stop_times',
      'stops',
      'trips',
    ];
    const transform: Partial<
      Record<keyof GtfsFileNameMap, Record<string, (v: string) => any>>
    > = {
      stop_times: {
        stop_sequence: parseInt,
      },
      stops: {
        stop_lat: parseFloat,
        stop_lon: parseFloat,
      },
    };
    for (const fileName of files) {
      let data: AxiosResponse;
      try {
        data = await this.#axios.get<string>(`/trip-data-gtfs/${fileName}.txt`);
      } catch (err) {
        console.error(err);
        break;
      }
      const lastUpdateSett = await localdb.settings.get(
        `lastUpdate-${fileName}`
      );
      if (
        lastUpdateSett &&
        !dayjs(data.headers['last-modified']).isAfter(lastUpdateSett.value)
      ) {
        console.log('Skipping, cached');
        continue;
      }
      const transformer = (header: string) =>
        transform[fileName]?.[header] ?? ((v: string) => v);
      const lines = csvParse(data.data, { columns: true }).map(
        (row: Record<string, string>) =>
          Object.keys(row).reduce(
            (prev, header) => ({
              ...prev,
              [header]: transformer(header)(row[header]),
            }),
            {}
          )
      );
      console.log({ lines });
      console.log(`Adding ${fileName}`);
      await gtfsdb.table(fileName).clear();
      await gtfsdb.table(fileName).bulkPut(lines, { allKeys: true });
      console.log(`Added ${fileName}`);
      console.log('Marking last update');
      await localdb.settings.put({
        key: `lastUpdate-${fileName}`,
        value: data.headers['last-modified'],
      });
    }
    console.log('GTFS data updated');
  }
}
