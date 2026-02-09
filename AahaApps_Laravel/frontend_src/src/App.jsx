import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminLayout from './layout/AdminLayout';
import PublicLayout from './layout/PublicLayout';
import Dashboard from './pages/Dashboard';
import CardManager from './pages/CardManager';
import MenuManager from './pages/MenuManager';
import SettingsManager from './pages/SettingsManager';
import BannerManager from './pages/BannerManager';
import Home from './pages/Home';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

import PageManager from './pages/PageManager';
import PageForm from './pages/PageForm';
import DynamicPage from './pages/DynamicPage';
import Profile from './pages/Profile';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/:slug" element={<DynamicPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="cards" element={<CardManager />} />
            <Route path="cards/:id" element={<CardManager />} />
            <Route path="menus" element={<MenuManager />} />
            <Route path="pages" element={<PageManager />} />
            <Route path="pages/create" element={<PageForm />} />
            <Route path="pages/:id" element={<PageForm />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="banners" element={<BannerManager />} />
            <Route path="profile" element={<Profile />} />

          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
