import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Popup from "./components/Popup";
import DashboardApp from "./components/dashboard/DashboardApp";
import { useThemeContext } from "./hooks/useThemeContext";

function DevNav() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeContext();
  console.log(theme);
  return (
    <div className='bg-gray-600 text-white p-2 text-sm flex gap-4 items-center'>
      <span className='font-medium'>Dev Mode:</span>
      <Link
        to='/'
        className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors'
      >
        Popup View
      </Link>
      <Link
        to='/dashboard'
        className='px-3 py-1 bg-green-600 hover:bg-green-700 rounded-sm transition-colors'
      >
        Dashboard View
      </Link>
      <button
        className='py-1 px-2 rounded bg-gray-950 cursor-pointer'
        onClick={toggleTheme}
      >
        Toggle Light/Dark
      </button>
      <span className='text-gray-300 ml-auto'>
        Current:{" "}
        {location.pathname.includes("dashboard") ? "Dashboard" : "Popup"}
      </span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className='min-h-screen'>
        {process.env.NODE_ENV === "development" && <DevNav />}
        <Routes>
          <Route path='/' element={<Popup />} />
          <Route path='/popup' element={<Popup />} />
          <Route path='/popup.html' element={<Popup />} />
          <Route path='/dashboard' element={<DashboardApp />} />
          <Route path='/dashboard.html' element={<DashboardApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
