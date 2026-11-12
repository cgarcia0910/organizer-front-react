import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@react-front/login-feature';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './app';

vi.mock('./nx-welcome', () => ({
  default: () => <div>Home page</div>,
}));

function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects an unauthenticated user from / to the login page', () => {
    renderApp('/');

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(screen.queryByText('Home page')).toBeNull();
  });

  it('renders the login page at /login', () => {
    renderApp('/login');

    expect(screen.getByRole('heading', { name: 'Sign in' }));
  });

  it('renders the protected home page when there is a token', () => {
    localStorage.setItem('token', 'fake-token');

    renderApp('/');

    expect(screen.getByText('Home page')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Sign in' })).toBeNull();
  });
});
