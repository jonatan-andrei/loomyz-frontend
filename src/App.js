import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import HomePage from "./pages/home/HomePage";
import ChooseActivityTypePage from "./pages/choose-activity-type/ChooseActivityTypePage";
import PrivateRoute from "./PrivateRoute.js";
import { useEffect } from "react";
import { AuthProvider } from "./AuthContexts.js";

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/choose-activity-type" element={
          <PrivateRoute>
            <ChooseActivityTypePage />
          </PrivateRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;