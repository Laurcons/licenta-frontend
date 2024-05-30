import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  return (
    <>
      <h1>Error in app</h1>
    </>
  );
}
