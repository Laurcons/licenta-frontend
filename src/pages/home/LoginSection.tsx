import { Button, Card } from 'react-bootstrap';
import { useAuth } from '../../lib/auth.context';

export default function LoginSection() {
  const { setShowLoginModal, hasInternet } = useAuth();
  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <p>Save your trips with an one-click account.</p>
          {hasInternet && (
            <Button onClick={() => setShowLoginModal(true)}>
              Log in or create account
            </Button>
          )}
          {!hasInternet && (
            <>
              <p>
                <i className="bi bi-wifi-off me-2"></i>
                Please check back again when you're connected.
              </p>
            </>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
