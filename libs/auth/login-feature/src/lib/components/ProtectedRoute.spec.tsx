import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock('../context/AuthContext', () => ({
  useAuth: useAuthMock,
}));

const adminUser: AuthUser = {
  email: 'user@test.com',
  roles: ['CATALOG_ADMIN'],
  tenant: { id: 't1', name: 'Tenant' },
};

function LoginPage() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from;

  return (
    <div>
      <p>Login page</p>
      <p>{`from: ${from?.pathname ?? 'none'}`}</p>
    </div>
  );
}

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/calendar" element={<div>Calendar page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it('shows a loading state and does not redirect while the session is being restored', () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: true });

    renderAt('/');

    expect(screen.getByText('Cargando...')).toBeTruthy();
    expect(screen.queryByText('Login page')).toBeNull();
    expect(screen.queryByText('Home page')).toBeNull();
  });

  it('redirects to /login when there is no user', () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: false });

    renderAt('/');

    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.queryByText('Home page')).toBeNull();
  });

  it('renders the protected content when there is a user', () => {
    useAuthMock.mockReturnValue({ user: adminUser, isLoading: false });

    renderAt('/');

    expect(screen.getByText('Home page')).toBeTruthy();
    expect(screen.queryByText('Login page')).toBeNull();
  });

  it('keeps the requested path in location.state.from when redirecting', () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: false });

    renderAt('/calendar');

    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.getByText('from: /calendar')).toBeTruthy();
  });

  it('renders the matching nested route when authenticated', () => {
    useAuthMock.mockReturnValue({ user: adminUser, isLoading: false });

    renderAt('/calendar');

    expect(screen.getByText('Calendar page')).toBeTruthy();
  });
});
