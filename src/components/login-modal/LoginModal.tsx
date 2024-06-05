import { Button, Collapse, Modal, Spinner } from 'react-bootstrap';
import GoogleLoginButton from './GoogleLoginButton';
import YahooLoginButton from './YahooLoginButton';
import { useLanguage } from '../../lib/language.context';
import { useAuth } from '../../lib/auth.context';
import { useState } from 'react';
import EmailPasswordLogin from './EmailPasswordLogin';
import EmailPasswordRegister from './EmailPasswordRegister';

export default function LoginModal() {
  const { t } = useLanguage();
  const { showLoginModal, setShowLoginModal, isLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState<
    'social' | 'login' | 'register'
  >('social');
  const [status, setStatus] = useState('');

  return (
    <>
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('loginModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('loginModal.text')}</p>
          <Collapse in={selectedTab === 'social'}>
            <div>
              <div className="d-flex flex-column align-items-center gap-3">
                {!status && !isLoading && (
                  <>
                    <GoogleLoginButton onStatus={setStatus} />
                    <YahooLoginButton onStatus={setStatus} />
                    <Button
                      variant="outline-primary"
                      onClick={() => setSelectedTab('login')}
                    >
                      <i className="bi bi-passport me-2"></i>
                      or use a password
                    </Button>
                  </>
                )}
                {(status || isLoading) && (
                  <>
                    <Spinner />
                    <span>{status || 'Signing you in...'}</span>
                  </>
                )}
              </div>
            </div>
          </Collapse>
          <Collapse in={selectedTab === 'login'}>
            <div>
              <EmailPasswordLogin onBack={() => setSelectedTab('social')} />
              <Button
                variant="outline-secondary"
                className="mt-3 w-100"
                onClick={() => setSelectedTab('register')}
              >
                No account? Make one!
              </Button>
            </div>
          </Collapse>
          <Collapse in={selectedTab === 'register'}>
            <div>
              <EmailPasswordRegister onBack={() => setSelectedTab('social')} />
              <Button
                variant="outline-secondary"
                className="mt-3 w-100"
                onClick={() => setSelectedTab('login')}
              >
                Already with an account? Login!
              </Button>
            </div>
          </Collapse>
        </Modal.Body>
      </Modal>
    </>
  );
}
