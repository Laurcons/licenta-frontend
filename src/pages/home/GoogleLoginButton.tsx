import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../lib/lang.context';
import { config } from '../../lib/config';

export default function GoogleLoginButton() {
  const googleBtnRef = useRef(null);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const { language, t } = useLanguage();

  function validateWithApi(data: { credential: string }) {
    (async () => {
      const resp = await fetch(`${config.apiBase}/v1/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.credential,
        }),
      });
      if (!resp.ok) {
        console.error(resp);
      }
    })();
  }

  useEffect(() => {
    // add script to page and wait for it to load
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    document.getElementsByTagName('head').item(0)!.appendChild(script);
    script.onload = () => setIsGoogleScriptLoaded(true);
    // cleanup
    return () => {
      script.remove();
      document.getElementById('googleidentityservice')?.remove();
      document.getElementById('googleidentityservice_button_styles')?.remove();
    };
  }, []);

  useEffect(() => {
    if (!googleBtnRef.current || !isGoogleScriptLoaded) return;

    // set up google button
    window.google.accounts.id.initialize({
      client_id: config.googleClientId,
      callback: validateWithApi,
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      locale: language,
      theme: 'filled_blue',
      size: 'large',
    });
    // no cleanup function needed, just rerender the button if required
  }, [googleBtnRef.current, isGoogleScriptLoaded, language]);

  return (
    <>
      <div id="google-btn" ref={googleBtnRef}></div>
    </>
  );
}
