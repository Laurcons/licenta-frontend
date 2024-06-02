import { Collapse } from 'react-bootstrap';
import { useAuth } from '../lib/auth.context';

export default function NotConnectedBanner() {
  const { retryAuth, hasInternet, isLoading } = useAuth();
  return (
    <>
      <Collapse in={!hasInternet && !isLoading}>
        <div>
          <div
            style={{
              background: 'yellow',
              // color: 'white',
              textAlign: 'center',
              padding: '10 2',
            }}
          >
            Not connected,{' '}
            <a
              href="#"
              role="button"
              style={{ color: 'blue' }}
              onClick={() => retryAuth()}
            >
              retry
            </a>
          </div>
        </div>
      </Collapse>
    </>
  );
}
