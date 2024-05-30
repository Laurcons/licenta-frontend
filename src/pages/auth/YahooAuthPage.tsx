import { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

export default function YahooAuthPage() {
  const [query] = useSearchParams();

  useEffect(() => {
    const code = query.get('code');
    const isLocal = query.get('state') === 'islocal';
    if (!code) {
      alert(
        'Code not present in query. Yahoo login is broken, please try again later'
      );
      return;
    }
    if (isLocal) {
      window.location.href = `http://localhost:5173/auth/yahoo?code=${code}`;
      return;
    }
    console.log('Dispatching event', code);
    window.opener.postMessage({ type: 'yahoo-code', code }, '*');
    window.close();
  });

  return (
    <>
      <Spinner variant="border" />
    </>
  );
}
