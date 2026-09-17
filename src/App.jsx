import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BrowseListings from './pages/BrowseListings'
import ItemDetail from './pages/ItemDetail'
import CreateEditListing from './pages/CreateEditListing'
import SwapRequest from './pages/SwapRequest'
import SwapStatus from './pages/SwapStatus'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster position="top-center" />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute blockAdmin />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/listings" element={<BrowseListings />} />
              <Route path="/listings/new" element={<CreateEditListing />} />
              <Route path="/listings/:itemId" element={<ItemDetail />} />
              <Route
                path="/listings/:itemId/edit"
                element={<CreateEditListing />}
              />
              <Route
                path="/listings/:itemId/swap-request"
                element={<SwapRequest />}
              />
              <Route path="/swaps/:swapId" element={<SwapStatus />} />
              <Route path="/swaps/:swapId/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
