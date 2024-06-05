import { FormEvent, useState } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useAuth } from '../../lib/auth.context';

export default function EmailPasswordRegister({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { axios, setToken } = useAuth();

  function handleLogin(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    (async () => {
      try {
        setIsLoading(true);
        const resp = await axios.post('/v1/auth/password/register', {
          email,
          password,
          name,
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

  function isConfirmPasswordValid() {
    return password.length > 0 && password === confirmPassword;
  }

  return (
    <Form className="d-flex flex-column gap-2" onSubmit={handleLogin}>
      <Form.Control
        type="email"
        placeholder="Your email"
        onChange={(ev) => setEmail(ev.target.value)}
        minLength={5}
        value={email}
      />
      <Form.Control
        type="text"
        placeholder="Your name"
        onChange={(ev) => setName(ev.target.value)}
        value={name}
        minLength={2}
      />
      <Form.Control
        type="password"
        placeholder="Create a password"
        onChange={(ev) => setPassword(ev.target.value)}
        value={password}
        minLength={6}
      />
      <InputGroup>
        <Form.Control
          type="password"
          placeholder="Confirm your password"
          onChange={(ev) => setConfirmPassword(ev.target.value)}
          value={confirmPassword}
        />
        <InputGroup.Text
          className={isConfirmPasswordValid() ? 'bg-success' : 'bg-danger'}
        >
          {isConfirmPasswordValid() ? (
            <i className="bi bi-check"></i>
          ) : (
            <i className="bi bi-x"></i>
          )}
        </InputGroup.Text>
      </InputGroup>
      <div className="mt-1 d-flex gap-1">
        <Button variant="outline-primary" onClick={onBack}>
          <i className="bi bi-arrow-left-short me-1"></i>
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-fill"
          disabled={isLoading || !isConfirmPasswordValid()}
        >
          {isLoading && <Spinner size="sm" className="mx-2" />}
          Make an account
        </Button>
      </div>
    </Form>
  );
}
