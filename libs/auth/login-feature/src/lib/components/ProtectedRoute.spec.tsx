import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock('../context/AuthContext', () => ({
  useAuth: useAuthMock,
}));

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

  it('redirects to /login when there is no token', () => {
    useAuthMock.mockReturnValue({ token: null });

    renderAt('/');

    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.queryByText('Home page')).toBeNull();
  });

  it('renders the protected content when there is a token', () => {
    useAuthMock.mockReturnValue({ token: 'fake-token' });

    renderAt('/');

    expect(screen.getByText('Home page')).toBeTruthy();
    expect(screen.queryByText('Login page')).toBeNull();
  });

  it('keeps the requested path in location.state.from when redirecting', () => {
    useAuthMock.mockReturnValue({ token: null });

    renderAt('/calendar');

    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.getByText('from: /calendar')).toBeTruthy();
  });

  it('renders the matching nested route when authenticated', () => {
    useAuthMock.mockReturnValue({ token: 'fake-token' });

    renderAt('/calendar');

    expect(screen.getByText('Calendar page')).toBeTruthy();
  });
});
