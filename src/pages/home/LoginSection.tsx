import { Button, Card } from 'react-bootstrap';
import { useAuth } from '../../lib/auth.context';
import { useLanguage } from '../../lib/language.context';

export default function LoginSection() {
  const { setShowLoginModal, hasInternet } = useAuth();
  const { t } = useLanguage();
  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <p>{t('home.loginSection.promo')}</p>
          {hasInternet && (
            <Button onClick={() => setShowLoginModal(true)}>
              {t('home.loginSection.button')}
            </Button>
          )}
          {!hasInternet && (
            <>
              <p>
                <i className="bi bi-wifi-off me-2"></i>
                {t('home.loginSection.notConnected')}
              </p>
            </>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
