import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';
import { PromptPage } from './pages/PromptPage';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import './index.css';

function App() {
  return (
    <BrowserRouter basename="/dralu">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/admin/prompt" element={<ProtectedRoute><PromptPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
