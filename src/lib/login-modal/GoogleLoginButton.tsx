import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../language.context';
import { config } from '../config';
import { useAuth } from '../auth.context';
import axios from 'axios';

export default function GoogleLoginButton() {
  const googleBtnRef = useRef(null);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const { language, t } = useLanguage();
  const { setToken } = useAuth();

  function validateWithApi(data: { credential: string }) {
    (async () => {
      try {
        const resp = await axios.post(
          `${config.apiBase}/v1/auth/google`,
          {
            token: data.credential,
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
