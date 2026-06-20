import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppProviders from './providers';
import AppRoutes from './routes';
import '../App.css'; // Clear default styles reference if needed

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
};
export default App;
