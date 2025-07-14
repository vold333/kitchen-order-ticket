import React, { useState, useEffect } from "react";
import { useMediaQuery } from 'react-responsive'; 
import MobileView from "./MobileViewMenu"; 
import DesktopView from "./TabViewMenu"; 

function MainMenuComponent() {
  
  const [shouldRenderMobileView, setShouldRenderMobileView] = useState(false);

  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const isTabletOrDesktop = useMediaQuery({ query: '(min-width: 768px)' });

  const handleValidation = () => {
    if (isMobile) {
      setShouldRenderMobileView(true);
    } else if (isTabletOrDesktop) {
      setShouldRenderMobileView(false);
    }
  };

  React.useEffect(() => {
    handleValidation();
  }, [isMobile, isTabletOrDesktop]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
  
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);  
  
  return (
    <div className="min-h-screen flex flex-col bg-white">      

      {/* Conditional Render based on validation */}
      {shouldRenderMobileView ? (
        <MobileView /> // Mobile view component
      ) : (
        <DesktopView /> // Desktop view component
      )}
    </div>
  );
}

export default MainMenuComponent;
