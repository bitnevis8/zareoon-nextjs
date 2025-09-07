'use client';

import { useState } from 'react';
import MobileBottomBar from './MobileBottomBar';

export default function MobileBottomBarWrapper() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <MobileBottomBar 
      onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
      isSidebarOpen={isSidebarOpen}
    />
  );
}
