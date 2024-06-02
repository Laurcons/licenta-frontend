import { Modal, Spinner } from 'react-bootstrap';
import GoogleLoginButton from './GoogleLoginButton';
import YahooLoginButton from './YahooLoginButton';
import { useLanguage } from '../../lib/language.context';
import { useAuth } from '../../lib/auth.context';
import { useState } from 'react';

export default function LoginModal() {
  const { t } = useLanguage();
  const { showLoginModal, setShowLoginModal, isLoading } = useAuth();
  const [status, setStatus] = useState('');

  return (
    <>
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('loginModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('loginModal.text')}</p>
          <div className="d-flex flex-column align-items-center gap-3">
            {!status && !isLoading && (
              <>
                <GoogleLoginButton onStatus={setStatus} />
                <YahooLoginButton onStatus={setStatus} />
              </>
            )}
            {(status || isLoading) && (
              <>
                <Spinner />
                <span>{status || 'Signing you in...'}</span>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
