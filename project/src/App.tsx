import React from 'react';
import { AuthProvider } from './components/Auth/AuthProvider';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;