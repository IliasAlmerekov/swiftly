import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import TicketDetailPage from "./features/tickets/pages/TicketDetailPage";
import AppLayout from "./shared/components/layout/AppLayout";
import { ThemeProvider } from "./provider/theme-provider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserProfile from "./features/users/pages/UserProfile";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes with sidebar */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            }
          />
          <Route
            path="/tickets/:ticketId"
            element={
              <AppLayout
                title="Scooteq HelpDesk - Ticket Details"
                currentTab="my-tickets"
              >
                <TicketDetailPage />
              </AppLayout>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <AppLayout title="User Profile" currentTab="user-profile">
                <UserProfile isViewingOtherUser={true} />
              </AppLayout>
            }
          />
          <Route
            path="/user-profile"
            element={
              <AppLayout title="Profile" currentTab="user-profile">
                <UserProfile />
              </AppLayout>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
