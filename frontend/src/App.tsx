import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OverviewPage } from './pages/OverviewPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { CountriesPage } from './pages/CountriesPage';
import { PrioritiesPage } from './pages/PrioritiesPage';
import { SamPage } from './pages/SamPage';

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="countries" element={<CountriesPage />} />
        <Route path="priorities" element={<PrioritiesPage />} />
        <Route path="sam" element={<SamPage />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/app/overview" replace />} />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/app/overview" replace />} />
    </Routes>
  );
}
