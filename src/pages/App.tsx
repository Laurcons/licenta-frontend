import '../main.scss';
import { Button, ButtonGroup, Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Outlet } from 'react-router-dom';
import { Language, useLanguage } from '../lib/language.context';
import { useAuth } from '../lib/auth.context';
import LoginModal from '../lib/login-modal/LoginModal';
import NotConnectedBanner from './NotConnectedBanner';
import UpdatingTripDataBanner from './UpdatingTripDataBanner';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const {
    user,
    setToken,
    isLoading: isUserLoading,
    setShowLoginModal,
    hasInternet,
  } = useAuth();

  return (
    <>
      <Navbar expand="md" bg="dark" data-bs-theme="dark" className="text-light">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              {t('navbar.title')}
              {!hasInternet && (
                <>
                  <i className="bi bi-wifi-off ms-2"></i>
                </>
              )}
            </Navbar.Brand>
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
            {!isUserLoading && !user && hasInternet && (
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
      <NotConnectedBanner />
      <UpdatingTripDataBanner />
      <div className="container py-3">
        <Outlet />
      </div>
      <LoginModal />
    </>
  );
}

export default App;
