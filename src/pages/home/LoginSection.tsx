import { Card } from 'react-bootstrap';
import GoogleLoginButton from './GoogleLoginButton';
import YahooLoginButton from './YahooLoginButton';

export default function LoginSection() {
  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <p>Save your trip history with an account.</p>
          <div className="d-flex flex-md-row flex-column align-items-center gap-3">
            <GoogleLoginButton />
            <YahooLoginButton />
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
