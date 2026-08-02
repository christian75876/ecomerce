import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import { routes } from '@application/router/routes';
import RouteFallback from '@organisms/navigation/RouteFallback';
import PageTransitionLayout from '@presentation/ui/layouts/PageTransitionLayout';
import {
  canAccessAdminPanel,
  isAuthenticated,
} from '@/shared/utils/checkIsUserAuthenticated.util';
import { ROUTES } from '@/shared/constants/routes';
import { useHandleUnauthorized } from '@/infrastructure/repositories/api/errors/ErrorUtils';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return canAccessAdminPanel()
    ? children
    : <Navigate to={ROUTES.PUBLIC.HOME} replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() && canAccessAdminPanel()
    ? <Navigate to={ROUTES.PRIVATE.DASHBOARD} replace />
    : children;
};

function GlobalGuards() {
  useHandleUnauthorized();
  return null;
}

const AppRouter = () => {
  return (
    <>
      <GlobalGuards />
      <Suspense fallback={<RouteFallback />}>
        <PageTransitionLayout>
          <Routes>
            <>
              {routes.map(
                ({
                  path,
                  element,
                  private: isPrivate,
                  publicOnly,
                  layout: Layout,
                  hasGradient
                }) => {
                  const WrappedElement = Layout ? (
                    <Layout hasGradient={hasGradient}>{element}</Layout>
                  ) : (
                    element
                  );

                  const RouteElement = isPrivate ? (
                    <PrivateRoute>{WrappedElement}</PrivateRoute>
                  ) : publicOnly === false ? (
                    WrappedElement
                  ) : (
                    <PublicRoute>{WrappedElement}</PublicRoute>
                  );

                  return (
                    <Route
                      key={path}
                      path={path}
                      element={RouteElement}
                    />
                  );
                }
              )}
            </>
          </Routes>
        </PageTransitionLayout>
      </Suspense>
    </>
  );
};

export default AppRouter;
