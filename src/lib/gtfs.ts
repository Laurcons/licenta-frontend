import axios, { AxiosResponse } from 'axios';
import { GtfsFileNameMap, gtfsdb, localdb } from './dexie/dexie';
import dayjs from 'dayjs';
import { parse as csvParse } from 'csv-parse/browser/esm/sync';
import { config } from './config';

export class Gtfs {
  static files: (keyof GtfsFileNameMap)[] = [
    'agency',
    'calendar',
    'calendar_dates',
    'routes',
    'stop_times',
    'stops',
    'trips',
  ];

  static async isFirstTimeDownload() {
    const lastFileName = this.files.at(-1);
    const setting = await localdb.settings.get(`lastUpdate-${lastFileName}`);
    return !setting;
  }

  static async updateTripData(
    onDownloadDecision?: (decision: boolean) => void
  ) {
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
    let isDownloadingAnything = false;
    for (const fileName of this.files) {
      let data: AxiosResponse<string>;
      // try {
      data = await axios.get<string>(`/trip-data-gtfs/${fileName}.txt`, {
        baseURL: config.apiBase,
      });
      // } catch (err: any) {}
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
      if (!isDownloadingAnything) {
        isDownloadingAnything = true;
        onDownloadDecision?.(true);
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
    if (!isDownloadingAnything) {
      onDownloadDecision?.(false);
    }
    console.log('GTFS data updated');
  }
}
