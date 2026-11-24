import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AnnouncementBar from './AnnouncementBar';
import ErrorBoundary from './ErrorBoundary';
import DemoBanner from './DemoBanner';
import { initMetaPixel } from '../../utils/metaPixel';
import { isDemoMode } from '../../api/demo/demoAdapter';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    initMetaPixel();
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col bg-canvas text-content selection:bg-brand selection:text-white ${
        isDemoMode() ? 'pb-16 sm:pb-12' : ''
      }`}
    >
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <ErrorBoundary resetKey={location.pathname + location.search}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <DemoBanner />
    </div>
  );
};

export default Layout;
