import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Popup from "./components/Popup";
import DashboardApp from "./components/dashboard/DashboardApp";
import { useThemeContext } from "./hooks/useThemeContext";

function DevNav() {
  const location = useLocation();
  const { toggleTheme } = useThemeContext();
  return (
    <div className='flex items-center gap-4 bg-gray-600 p-2 text-sm text-white'>
      <span className='font-medium'>Dev Mode:</span>
      <Link to='/' className='rounded-sm bg-blue-600 px-3 py-1 transition-colors hover:bg-blue-700'>
        Popup View
      </Link>
      <Link
        to='/dashboard'
        className='rounded-sm bg-green-600 px-3 py-1 transition-colors hover:bg-green-700'
      >
        Dashboard View
      </Link>
      <button className='cursor-pointer rounded bg-gray-950 px-2 py-1' onClick={toggleTheme}>
        Toggle Light/Dark
      </button>
      <span className='ml-auto text-gray-300'>
        Current: {location.pathname.includes("dashboard") ? "Dashboard" : "Popup"}
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
