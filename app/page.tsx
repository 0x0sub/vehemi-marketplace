'use client'

import { useEffect, useMemo } from 'react';
import { Container, Theme } from '../settings/generated/types';
import { MarketplacePage } from '../components/MarketplacePage';

let theme: Theme = 'dark';

let container: Container = 'none';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  useEffect(() => {
    setTheme(theme);
  }, []);

  const generatedComponent = useMemo(() => {    
    return <MarketplacePage />; // %EXPORT_STATEMENT%
  }, []);

  if (container === 'centered') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {generatedComponent}
      </div>
    );
  } else {
    return generatedComponent;
  }
}

export default App;