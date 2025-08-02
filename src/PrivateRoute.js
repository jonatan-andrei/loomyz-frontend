import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContexts";
import LoadingPage from "./components/loading-page/LoadingPage";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  return user ? children : <Navigate to="/" replace />;
}