import { Routes, Route, Navigate } from "react-router-dom";
import Layout           from "./layouts/Layout";
import AppointmentsPage from "./pages/AppointmentsPage";
import CalendarPage     from "./pages/CalendarPage";
import ClientsPage      from "./pages/ClientsPage";
import StaffPage        from "./pages/StaffPage";
import AnalyticsPage    from "./pages/AnalyticsPage";
import ServicesPage     from "./pages/ServicesPage";
import ProductsPage     from "./pages/ProductsPage";
import SettingsPage     from "./pages/SettingsPage";
import LoginPage        from "./pages/LoginPage";

// Импортируем только сам хук useAuth
import { useAuth }      from "./components/other/Auth";

export default function App() {
  // Хук useAuth сам возвращает актуальные auth, handleLogin, handleLogout, clinic и counters.
  // Никаких дополнительных useState и функций здесь объявлять не нужно!
  const { auth, handleLogin, handleLogout, clinic, counters } = useAuth();

  // Если пользователь не авторизован — показываем страницу логина
  if (!auth) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    );
  }

  // Если авторизован — пускаем в систему
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/appointments" replace />} />
      <Route
        element={
          <Layout
            clinic={clinic}
            user={{ name: auth.name, role: auth.role }}
            counters={counters}
            onLogout={handleLogout}
          />
        }
      >
        <Route index element={<Navigate to="/appointments" replace />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/calendar"     element={<CalendarPage />} />
        <Route path="/clients"      element={<ClientsPage />} />
        <Route path="/staff"        element={<StaffPage />} />
        <Route path="/analytics"    element={<AnalyticsPage />} />
        <Route path="/services"     element={<ServicesPage />} />
        <Route path="/products"     element={<ProductsPage />} />
        <Route path="/settings"     element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/appointments" replace />} />
    </Routes>
  );
}