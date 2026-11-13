import { Header } from './components/ui';
import { AppProvider, useApp } from './lib/store';
import Ask from './pages/Ask';
import CropProblem from './pages/CropProblem';
import Experts from './pages/Experts';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Mandi from './pages/Mandi';
import Profile from './pages/Profile';
import Schemes from './pages/Schemes';
import Weather from './pages/Weather';

function Router() {
  const { page } = useApp();
  switch (page) {
    case 'ask': return <Ask />;
    case 'mandi': return <Mandi />;
    case 'weather': return <Weather />;
    case 'schemes': return <Schemes />;
    case 'learn': return <Learn />;
    case 'profile': return <Profile />;
    case 'experts': return <Experts />;
    case 'crop': return <CropProblem />;
    default: return <Home />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Header />
      <Router />
    </AppProvider>
  );
}
