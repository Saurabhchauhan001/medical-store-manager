import { useEffect, useRef, useState } from 'react';

const SCRIPT_ID = 'google-identity-services';

function loadGoogleScript() {
  const existingScript = document.getElementById(SCRIPT_ID);

  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({ clientId, disabled, onCredential }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState('');
  const [buttonWidth, setButtonWidth] = useState(320);

  useEffect(() => {
    if (!buttonRef.current) {
      return undefined;
    }

    const updateWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(Math.max(220, Math.floor(buttonRef.current.clientWidth || 320)));
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(buttonRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderGoogleButton = async () => {
      if (!clientId || disabled || !buttonRef.current) {
        return;
      }

      try {
        setError('');
        await loadGoogleScript();

        if (cancelled || !window.google?.accounts?.id || !buttonRef.current) {
          return;
        }

        buttonRef.current.innerHTML = '';

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (credential) {
              onCredential(credential);
            }
          },
          ux_mode: 'popup',
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: buttonWidth,
          logo_alignment: 'left',
        });
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError.message || 'Google sign-in is unavailable right now.');
        }
      }
    };

    renderGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [buttonWidth, clientId, disabled, onCredential]);

  return (
    <div className="space-y-3">
      <div
        ref={buttonRef}
        className="min-h-11 w-full overflow-hidden rounded-full"
      />
      {error && (
        <p className="text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}
