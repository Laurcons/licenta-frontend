import { config } from '../../lib/config';
import { YahooCodeEvent } from '../../lib/yahoo-code-event';

export default function YahooLoginButton() {
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
    wnd.addEventListener('x-yahoo-login', (ev: Event) => {
      const codeEvent = ev as YahooCodeEvent;
      console.log('Logged in!', codeEvent.code, codeEvent);
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
      {/* <div
        role="button"
        style={{
          height: 40,
          border: '2px solid #7e1fff',
          borderRadius: '5px',
          paddingRight: 25,
          overflow: 'hidden',
          fontSize: '0.85em',
          fontWeight: 'bold',
          fontFamily: 'Yahoo Sans',
          minWidth: 200,
        }}
      >
        <img
          src="/yahoo-sign-in-logo.png"
          style={{
            height: 40,
            marginTop: -2,
            marginRight: 5,
          }}
        />
        Sign in with Yahoo
      </div> */}
    </>
  );
}
