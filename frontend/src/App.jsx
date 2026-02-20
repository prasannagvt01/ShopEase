import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Layout from './components/layout/Layout';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetails = lazy(() => import('./pages/admin/OrderDetails'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminUserDetail = lazy(() => import('./pages/admin/UserDetail'));
const AdminComplaints = lazy(() => import('./pages/admin/Complaints'));
const AdminTransactions = lazy(() => import('./pages/admin/Transactions'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminManagement = lazy(() => import('./pages/admin/AdminManagement'));
const AdminActivityLogs = lazy(() => import('./pages/admin/ActivityLogs'));
const Support = lazy(() => import('./pages/Support'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Returns = lazy(() => import('./pages/Returns'));
const Contact = lazy(() => import('./pages/Contact'));

// Auth guards
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));
const AdminRoute = lazy(() => import('./components/auth/AdminRoute'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/support" element={<Support />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Routes */}
            <Route path="/cart" element={
              <Suspense fallback={<PageLoader />}><ProtectedRoute><Cart /></ProtectedRoute></Suspense>
            } />
            <Route path="/checkout" element={
              <Suspense fallback={<PageLoader />}><ProtectedRoute><Checkout /></ProtectedRoute></Suspense>
            } />
            <Route path="/profile" element={
              <Suspense fallback={<PageLoader />}><ProtectedRoute><Profile /></ProtectedRoute></Suspense>
            } />
            <Route path="/orders" element={
              <Suspense fallback={<PageLoader />}><ProtectedRoute><Orders /></ProtectedRoute></Suspense>
            } />
            <Route path="/orders/:id" element={
              <Suspense fallback={<PageLoader />}><ProtectedRoute><OrderDetails /></ProtectedRoute></Suspense>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminDashboard /></AdminRoute></Suspense>
            } />
            <Route path="/admin/products" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminProducts /></AdminRoute></Suspense>
            } />
            <Route path="/admin/products/new" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminProductForm /></AdminRoute></Suspense>
            } />
            <Route path="/admin/products/:id/edit" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminProductForm /></AdminRoute></Suspense>
            } />
            <Route path="/admin/categories" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminCategories /></AdminRoute></Suspense>
            } />
            <Route path="/admin/orders" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminOrders /></AdminRoute></Suspense>
            } />
            <Route path="/admin/orders/:id" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminOrderDetails /></AdminRoute></Suspense>
            } />
            <Route path="/admin/users" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminUsers /></AdminRoute></Suspense>
            } />
            <Route path="/admin/users/:id" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminUserDetail /></AdminRoute></Suspense>
            } />
            <Route path="/admin/complaints" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminComplaints /></AdminRoute></Suspense>
            } />
            <Route path="/admin/transactions" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminTransactions /></AdminRoute></Suspense>
            } />
            <Route path="/admin/inventory" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminInventory /></AdminRoute></Suspense>
            } />
            <Route path="/admin/coupons" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminCoupons /></AdminRoute></Suspense>
            } />
            <Route path="/admin/reports" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminReports /></AdminRoute></Suspense>
            } />
            <Route path="/admin/management" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminManagement /></AdminRoute></Suspense>
            } />
            <Route path="/admin/logs" element={
              <Suspense fallback={<PageLoader />}><AdminRoute><AdminActivityLogs /></AdminRoute></Suspense>
            } />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </Layout>
    </Router>
  );
}

export default App;
