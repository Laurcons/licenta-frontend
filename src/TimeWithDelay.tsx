import { Dayjs } from 'dayjs';
import { Badge } from 'react-bootstrap';

export function TimeWithDelay({ time, diff }: { time: Dayjs; diff: number }) {
  return (
    <>
      {time.format('HH:mm')}
      {diff !== 0 && (
        <Badge bg={diff < 0 ? 'success' : 'danger'} className="ms-2">
          {diff > 0 && <>+</>}
          {diff}
        </Badge>
      )}
    </>
  );
}
