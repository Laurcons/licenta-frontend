import { Button, Card } from 'react-bootstrap';
import { useAuth } from '../../lib/hooks/useAuth';

export default function LoginSection() {
  const { setShowLoginModal } = useAuth();
  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <p>Save your trips with an one-click account.</p>
          <Button onClick={() => setShowLoginModal(true)}>
            Log in or create account
          </Button>
        </Card.Body>
      </Card>
    </>
  );
}
