import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../components/Home'; 
import { apiService } from '../services/api'; 
import { AppProvider } from '../context/AppContext'; 
import LogoutButton from '../components/LogoutButton';
import BackgroundLogos from '../components/BackgroundLogos';
import Button from '../components/Button';



test('renders Home, LogoutButton, Button, and BackgroundLogos component', () => {
  render(
    <MemoryRouter>
      <AppProvider>
        <Home/>
        <LogoutButton/>
        <BackgroundLogos/>
        <Button/>
      </AppProvider>
    </MemoryRouter>
  );

});

