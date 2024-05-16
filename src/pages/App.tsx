import '../main.scss';
import { Alert, Container, Nav, Navbar, Spinner } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Outlet } from 'react-router-dom';
import useTripDataStatus from '../lib/hooks/useTripDataStatus';
import { useTripDataUpdater } from '../lib/hooks/TripDataUpdater';

function App() {
  useTripDataUpdater();
  const { isUpdating: isUpdatingTripData } = useTripDataStatus();
  return (
    <>
      <Navbar expand="md" bg="dark" data-bs-theme="dark" className="text-light">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>CFR Companion</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="top-nav" />
          <Navbar.Collapse id="top-nav">
            <LinkContainer to="/login">
              <Nav.Link>Log in</Nav.Link>
            </LinkContainer>
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
