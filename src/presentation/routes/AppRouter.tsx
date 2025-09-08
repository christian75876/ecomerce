import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import { routes } from '@application/router/routes';
import RouteFallback from '@organisms/navigation/RouteFallback';
import PageTransitionLayout from '@presentation/ui/layouts/PageTransitionLayout';
import { isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? children : <Navigate to='/login' replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <Navigate to='/dashboard' replace /> : children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <PageTransitionLayout>
          <Routes>
            <>
              <Route path='/' element={<Navigate to='/home' replace />} />
              {routes.map(
                ({
                  path,
                  element,
                  private: isPrivate,
                  layout: Layout,
                  hasGradient
                }) => {
                  const WrappedElement = Layout ? (
                    <Layout hasGradient={hasGradient}>{element}</Layout>
                  ) : (
                    element
                  );
                  return (
                    <Route
                      key={path}
                      path={path}
                      element={
                        isPrivate ? (
                          <PrivateRoute>{WrappedElement}</PrivateRoute>
                        ) : (
                          <PublicRoute>{WrappedElement}</PublicRoute>
                        )
                      }
                    />
                  );
                }
              )}
            </>
          </Routes>
        </PageTransitionLayout>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
