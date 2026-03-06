import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Commodities from '@/pages/Commodities';
import Deposit from '@/pages/Deposit';
import Withdraw from '@/pages/Withdraw';
import { ToastContainer, useToast } from '@/components/ui/Toast';

// Toast wrapper component
function ToastWrapper() {
  const { toasts, remove } = useToast();
  return <ToastContainer toasts={toasts} onRemove={remove} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastWrapper />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/commodities" element={<Commodities />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
