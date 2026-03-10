import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import RequestsList from './pages/requests/RequestsList';
import PostRequest from './pages/requests/PostRequest';
import RequestDetail from './pages/requests/RequestDetail';
import DonationsList from './pages/donations/DonationsList';
import OfferDonation from './pages/donations/OfferDonation';
import DonationDetail from './pages/donations/DonationDetail';
import Profile from './pages/Profile';
import Chat from './pages/chat/Chat';
import MyChats from './pages/chat/MyChats';
import ProtectedRoute from './components/shared/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />

          {/* Protected routes */}
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="requests" element={<RequestsList />} />
          <Route path="requests/new" element={<ProtectedRoute><PostRequest /></ProtectedRoute>} />
          <Route path="requests/:id" element={<RequestDetail />} />

          <Route path="donations" element={<DonationsList />} />
          <Route path="donations/new" element={<ProtectedRoute><OfferDonation /></ProtectedRoute>} />
          <Route path="donations/:id" element={<DonationDetail />} />

          {/* Chat routes */}
          <Route path="chat/:chatId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="my-chats" element={<ProtectedRoute><MyChats /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
