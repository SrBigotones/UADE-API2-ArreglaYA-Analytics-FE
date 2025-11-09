import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <Router>
          <AppNavigator />
        </Router>
      </FilterProvider>
    </AuthProvider>
  );
}

