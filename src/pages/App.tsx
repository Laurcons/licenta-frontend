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
import { useTripDataUpdater } from '../lib/trip-data-updater';
import { Language, useLanguage } from '../lib/language';
import { useAuth } from '../lib/hooks/useAuth';
import LoginModal from '../lib/login-modal/LoginModal';
import { useEffect } from 'react';

function App() {
  useTripDataUpdater();
  const { language, setLanguage, t } = useLanguage();
  const { isUpdating: isUpdatingTripData, startUpdate: startTripDataUpdate } =
    useTripDataUpdater();
  const {
    user,
    setToken,
    isLoading: isUserLoading,
    setShowLoginModal,
  } = useAuth();

  useEffect(() => {
    startTripDataUpdate();
  }, []);

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
            {!isUserLoading && !user && (
              <>
                <Nav.Item role="button" onClick={() => setShowLoginModal(true)}>
                  <i className="bi bi-box-arrow-in-right"></i>
                </Nav.Item>
              </>
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
      <LoginModal />
    </>
  );
}

export default App;
