import { Modal } from 'react-bootstrap';
import GoogleLoginButton from './GoogleLoginButton';
import YahooLoginButton from './YahooLoginButton';
import { useLanguage } from '../language.context';
import { useAuth } from '../auth.context';

export default function LoginModal() {
  const { t } = useLanguage();
  const { showLoginModal, setShowLoginModal } = useAuth();
  return (
    <>
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('loginModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Save your trip history with an account. Avoid remembering yet
            another password by logging in with your favorite provider.
          </p>
          <div className="d-flex flex-column align-items-center gap-3">
            <GoogleLoginButton />
            <YahooLoginButton />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
