import { Route, Routes } from 'react-router-dom';
import { LoginFeature, ProtectedRoute } from '@react-front/login-feature';
import { Dashboard } from './dashboard';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginFeature />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
