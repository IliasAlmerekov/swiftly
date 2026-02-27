import { Link } from 'react-router-dom';

import { paths } from '@/config/paths';

const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-muted-foreground text-sm tracking-wide uppercase">404</p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you requested does not exist or has been moved.
      </p>
      <Link
        to={paths.auth.login.getHref()}
        className="bg-primary text-primary-foreground inline-flex rounded-md px-4 py-2 text-sm font-medium"
      >
        Go to login
      </Link>
    </main>
  );
};

export default NotFoundPage;
