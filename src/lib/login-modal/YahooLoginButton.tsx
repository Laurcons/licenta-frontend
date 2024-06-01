import axios from 'axios';
import { config } from '../config';
import { useAuth } from '../hooks/useAuth';

export default function YahooLoginButton() {
  const { setToken } = useAuth();

  function onLoginClick() {
    const nonce = 'code-' + (Math.random() * 100000000).toString();
    const params = new URLSearchParams();
    params.append('client_id', config.yahooClientId);
    params.append('redirect_uri', config.yahooRedirectUri);
    params.append('response_type', 'code');
    params.append('scope', 'openid');
    params.append('nonce', nonce);
    params.append('state', config.isLocal ? 'islocal' : '');
    const wnd = window.open(
      `https://api.login.yahoo.com/oauth2/request_auth?${params}`,
      '_blank',
      'location=yes,height=770,width=520,scrollbars=yes,status=yes'
    );
    if (!wnd) {
      alert('Could not open Yahoo login. Please try again later');
      return;
    }
    window.addEventListener('message', (ev: MessageEvent) => {
      console.log(ev);
      if (ev.data && ev.data.type === 'yahoo-code') {
        (async () => {
          try {
            const resp = await axios.post(
              config.apiBase + '/v1/auth/yahoo',
              {
                code: ev.data.code,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            setToken(resp.data.authToken);
          } catch (err: any) {
            alert('Something went wrong :(');
          }
        })();
      }
    });
  }

  return (
    <>
      <img
        src="/yahoo-sign-in.png"
        height="40"
        role="button"
        onClick={onLoginClick}
      />
    </>
  );
}
