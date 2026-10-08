// SmartQR App Component
// Main router with authentication and business context

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { BusinessProvider } from './providers/BusinessProvider'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import PublicMenuPage from './pages/PublicMenuPage'
import PublicCustomerHubPage from './pages/PublicCustomerHubPage'
import PublicWifiPage from './pages/PublicWifiPage'
import PublicReviewPage from './pages/PublicReviewPage'
import MenuPage from './pages/MenuPage'
import WifiPage from './pages/WiFiPage'
import ReviewPage from './pages/ReviewPage'
import AdminQrPage from './pages/admin/AdminQrPage'
import AdminQrPrintPage from './pages/admin/AdminQrPrintPage'
import SuperAdminPage from './pages/admin/SuperAdminPage'
import { SuperAdminGuard } from './components/admin/SuperAdminGuard'
import { SuperAdminLayout } from './components/admin/SuperAdminLayout'
import NotFoundPage from './pages/NotFoundPage'
import { AdminRouteGuard } from './components/admin/AdminRouteGuard'
import { AdminLayout } from './components/admin/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/super" replace />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/m/:slug" element={<PublicMenuPage />} />
            <Route path="/q/:slug" element={<PublicCustomerHubPage />} />
            <Route path="/w/:slug" element={<PublicWifiPage />} />
            <Route path="/r/:slug" element={<PublicReviewPage />} />

            {/* Super Admin Routes (Separated from Tenant Layout) */}
            <Route element={<SuperAdminGuard />}>
              <Route element={<SuperAdminLayout />}>
                <Route path="/super" element={<SuperAdminPage />} />
              </Route>
            </Route>

            {/* Admin routes with AdminShell layout */}
            <Route
              element={
                <AdminRouteGuard>
                  <AdminLayout />
                </AdminRouteGuard>
              }
            >
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/menu" element={<MenuPage />} />
              <Route path="/admin/wifi" element={<WifiPage />} />
              <Route path="/admin/review" element={<ReviewPage />} />
              <Route path="/admin/qr" element={<AdminQrPage />} />
              <Route path="/admin/qr/print" element={<AdminQrPrintPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
