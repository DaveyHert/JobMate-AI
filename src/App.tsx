import {
  // MemoryRouter,
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import PopupUi from "./components/PopupUi";
import Dashboard from "./components/Dashboard";

function App() {
  // Check if we're in the popup context or dashboard context
  const isPopup =
    window.location.pathname.includes("popup") || window.innerWidth < 600;
  console.log(isPopup);

  return (
    <Router>
      <div className='min-h-screen'>
        {/* Development Navigation Bar - only show in dev mode */}
        {process.env.NODE_ENV === "development" && (
          <div className='bg-gray-600 text-white p-2 text-sm flex gap-4 items-center'>
            <span className='font-medium'>Dev Mode:</span>
            <Link
              to='/'
              className='px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors'
            >
              Popup View
            </Link>
            <Link
              to='/dashboard'
              className='px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors'
            >
              Dashboard View
            </Link>
            <span className='text-gray-300 ml-auto'>
              Current:{" "}
              {window.location.pathname.includes("dashboard")
                ? "Dashboard"
                : "Popup"}
            </span>
          </div>
        )}

        <Routes>
          <Route path='/' element={<PopupUi />} />
          <Route path='/popup' element={<PopupUi />} />
          <Route path='/popup.html' element={<PopupUi />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/dashboard.html' element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
