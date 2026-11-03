import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RoutinesPage from "./pages/RoutinesPage.jsx";
import RoutineEditorPage from "./pages/RoutineEditorPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// All URLs of the app. It grows each sprint (Technical Design §1.3):
// Sprint 2 adds /workout and /history, Sprint 3 adds /progress.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/routines" replace />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/routines/new" element={<RoutineEditorPage />} />
        <Route path="/routines/:id/edit" element={<RoutineEditorPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
