import { FormEvent, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../../lib/auth.context';

export default function EmailPasswordLogin({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { axios, setToken } = useAuth();

  function handleLogin(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    (async () => {
      try {
        setIsLoading(true);
        const resp = await axios.post('/v1/auth/password', {
          email,
          password,
        });
        setToken(resp.data.authToken);
      } catch (err: any) {
        console.log(err);
        alert(err?.response?.data?.message ?? err?.message ?? err);
      } finally {
        setIsLoading(false);
      }
    })();
  }

  return (
    <Form className="d-flex flex-column gap-2" onSubmit={handleLogin}>
      <Form.Control
        type="text"
        placeholder="Email"
        onChange={(ev) => setEmail(ev.target.value)}
        value={email}
      />
      <Form.Control
        type="password"
        placeholder="Password"
        onChange={(ev) => setPassword(ev.target.value)}
        value={password}
      />
      <div className="mt-1 d-flex gap-1">
        <Button variant="outline-primary" onClick={onBack}>
          <i className="bi bi-arrow-left-short me-1"></i>
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-fill"
          disabled={isLoading}
        >
          {isLoading && <Spinner size="sm" className="mx-2" />}
          Login
        </Button>
      </div>
    </Form>
  );
}
