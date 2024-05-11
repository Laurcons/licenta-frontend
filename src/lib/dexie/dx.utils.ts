import dayjs from 'dayjs';

export class DxUtils {
  static toDate(gtfsDateString: string) {
    return new Date(
      gtfsDateString.slice(0, 4) +
        '-' +
        gtfsDateString.slice(4, 6) +
        '-' +
        gtfsDateString.slice(6, 8)
    );
  }

  static toDayjs(gtfsDateString: string) {
    return dayjs(this.toDate(gtfsDateString));
  }

  static timeToDayjs(gtfsTime: string) {
    return dayjs('2020-01-01T' + gtfsTime);
  }
}
