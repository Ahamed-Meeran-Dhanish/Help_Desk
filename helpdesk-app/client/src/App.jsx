import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './shared/components/MainLayout';
import PrivateRoute from './shared/components/PrivateRoute';

// Pages
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import DashboardPage from './modules/tickets/pages/DashboardPage';
import TicketsPage from './modules/tickets/pages/TicketsPage';
import UsersPage from './modules/users/pages/UsersPage';
import CreateTicketPage from './modules/tickets/pages/CreateTicketPage';
import TicketDetailsPage from './modules/tickets/pages/TicketDetailsPage';
import NotFoundPage from './shared/components/NotFoundPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="new-ticket" element={<CreateTicketPage />} />
            <Route path="ticket/:ticketId" element={<TicketDetailsPage />} />
            {/* Add more protected routes here */}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
