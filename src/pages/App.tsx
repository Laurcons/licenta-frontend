import '../main.scss';
import {
  Alert,
  Button,
  ButtonGroup,
  Container,
  Nav,
  Navbar,
  Spinner,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Outlet } from 'react-router-dom';
import useTripDataStatus from '../lib/hooks/useTripDataStatus';
import { useTripDataUpdater } from '../lib/trip-data-updater.context';
import { Language, useLanguage } from '../lib/lang.context';
import { useAuth } from '../lib/hooks/useAuth';

function App() {
  useTripDataUpdater();
  const { language, setLanguage, t } = useLanguage();
  const { isUpdating: isUpdatingTripData } = useTripDataStatus();
  const { user, setToken } = useAuth();

  return (
    <>
      <Navbar expand="md" bg="dark" data-bs-theme="dark" className="text-light">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>{t('navbar.title')}</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="top-nav" />
          <Navbar.Collapse id="top-nav">
            <div className="me-auto"></div>
            {!!user && (
              <Nav className="flex gap-2">
                <Nav.Item>{user.name}</Nav.Item>
                <Nav.Item role="button" onClick={() => setToken(null)}>
                  <i className="bi bi-box-arrow-right"></i>
                </Nav.Item>
              </Nav>
            )}
            <ButtonGroup aria-label="Language select" className="ms-3">
              <Button
                size="sm"
                variant={
                  language === Language.ro ? 'primary' : 'outline-primary'
                }
                onClick={() => setLanguage(Language.ro)}
              >
                RO
              </Button>
              <Button
                size="sm"
                variant={
                  language === Language.en ? 'primary' : 'outline-primary'
                }
                onClick={() => setLanguage(Language.en)}
              >
                EN
              </Button>
            </ButtonGroup>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="container py-3">
        {isUpdatingTripData && (
          <Alert variant="warning">
            <Spinner variant="border" className="float-end" />
            Updating trip information...
          </Alert>
        )}
        <Outlet />
      </div>
    </>
  );
}

export default App;
