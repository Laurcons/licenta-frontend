import { Badge, Card, Table } from 'react-bootstrap';
import { DxStop } from '../../lib/dexie/models/dx-stop';
import { useEffect, useMemo, useState } from 'react';
import { DxStopTime } from '../../lib/dexie/models/dx-stopTime';
import { DxUtils } from '../../lib/dexie/dx.utils';
import { TimeWithDelay } from './TimeWithDelay';
import dayjs from 'dayjs';
import { useLanguage } from '../../lib/language.context';

export function Timetable({
  prevStation,
  nextStation,
  progressPercent,
  destination,
}: {
  prevStation: DxStop & { stop_time: DxStopTime };
  nextStation: DxStop & { stop_time: DxStopTime };
  progressPercent: number;
  destination?: DxStop & { stop_time: DxStopTime };
}) {
  const { t } = useLanguage();
  const prevTime = useMemo(
    () =>
      DxUtils.timeToDayjs(
        prevStation.stop_time.arrival_time ||
          prevStation.stop_time.departure_time
      ),
    [prevStation]
  );
  const nextTime = useMemo(
    () => DxUtils.timeToDayjs(nextStation.stop_time.arrival_time),
    [nextStation]
  );
  const destTime = useMemo(
    () =>
      destination
        ? DxUtils.timeToDayjs(destination.stop_time.arrival_time)
        : undefined,
    [destination]
  );
  // const now = DxUtils.timeToDayjs('23:15');
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    function set() {
      setNow(DxUtils.timeToDayjs(dayjs().format('HH:mm')));
      setTimeout(set, 1000);
    }
    set();
  }, []);

  const { actualNextDiff, actualNextTime } = useMemo(() => {
    const totalDuration = nextTime.diff(prevTime, 'seconds');
    const elapsedReal = now.diff(prevTime, 'seconds');
    const elapsedExpected = (progressPercent / 100) * totalDuration;
    const elapsedDiff = elapsedReal - elapsedExpected;
    const actualNextTime = nextTime.add(elapsedDiff, 'seconds');
    return {
      actualNextTime,
      actualNextDiff: Math.round(elapsedDiff / 60),
    };
  }, [prevTime, nextTime, now]);

  // const { actualPrevDiff, actualPrevTime } = useMemo(() => {
  //   const actualPrevTime = prevTime.add(actualNextDiff, 'minutes');
  //   return {
  //     actualPrevTime,
  //     actualPrevDiff: actualNextDiff,
  //   };
  // }, [prevTime, actualNextDiff]);

  const { actualDestDiff, actualDestTime } = useMemo(() => {
    if (!destTime || !actualNextDiff)
      return { actualDestDiff: undefined, actualDestTime: undefined };
    const actualDestTime = destTime.add(actualNextDiff, 'minutes');
    return {
      actualDestTime,
      actualDestDiff: actualNextDiff,
    };
  }, [destTime, actualNextDiff]);

  return (
    <>
      <Card>
        <Card.Header>{t('track.timetable.title')}</Card.Header>
        <Card.Body>
          <Table>
            <thead>
              <tr>
                <th>
                  <i className="bi-clock me-2"></i>
                  {now.format('HH')}
                  <span className="x-blink">:</span>
                  {now.format('mm')}
                </th>
                <th>{prevStation.stop_name}</th>
                <th>{nextStation.stop_name}</th>
                {destination && <th>{destination.stop_name}</th>}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t('track.timetable.timetabled')}</td>
                {/* <td>Timetabled</td> */}
                <td>{prevTime.format('HH:mm')}</td>
                <td>{nextTime.format('HH:mm')}</td>
                {destTime && <td>{destTime.format('HH:mm')}</td>}
              </tr>
              <tr>
                <td>{t('track.timetable.expected')}</td>
                {/* <td>Expected</td> */}
                <td>
                  {/* <TimeWithDelay diff={actualPrevDiff} time={actualPrevTime} /> */}
                </td>
                <td>
                  <TimeWithDelay diff={actualNextDiff} time={actualNextTime} />
                </td>
                {actualDestTime && (
                  <td>
                    <TimeWithDelay
                      diff={actualDestDiff}
                      time={actualDestTime}
                    />
                  </td>
                )}
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}
