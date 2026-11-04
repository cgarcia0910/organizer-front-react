import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginFeature from './login-feature';

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock, logout: vi.fn(), user: null, isLoading: false }),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginFeature />} />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

describe('LoginFeature', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renders the form', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  it('shows required errors and does not call login when the form is empty', async () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Email is required.')).toBeTruthy();
    expect(screen.getByText('Password is required.')).toBeTruthy();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('shows a format error for an invalid email', async () => {
    renderLogin();

    fillAndSubmit('not-an-email', 'secret');

    expect(
      await screen.findByText('Please enter a valid email address.')
    ).toBeTruthy();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('calls login with the form values and navigates home on success', async () => {
    loginMock.mockResolvedValue({ status: 'success' });
    renderLogin();

    fillAndSubmit('user@test.com', 'secret');

    expect(await screen.findByText('Home page')).toBeTruthy();
    expect(loginMock).toHaveBeenCalledWith('user@test.com', 'secret');
  });

  it('shows an error when the credentials are rejected', async () => {
    loginMock.mockResolvedValue({ status: 'invalid-credentials' });
    renderLogin();

    fillAndSubmit('user@test.com', 'wrong');

    expect(await screen.findByText('Invalid email or password')).toBeTruthy();
    expect(screen.queryByText('Home page')).toBeNull();
  });

  it('shows a generic error when the server fails', async () => {
    loginMock.mockResolvedValue({ status: 'server-error', httpStatus: 500 });
    renderLogin();

    fillAndSubmit('user@test.com', 'secret');

    expect(
      await screen.findByText('Something went wrong, try again later')
    ).toBeTruthy();
    expect(screen.queryByText('Invalid email or password')).toBeNull();
    expect(screen.queryByText('Home page')).toBeNull();
  });

  it('shows an error when the server cannot be reached', async () => {
    loginMock.mockRejectedValue(new Error('network'));
    renderLogin();

    fillAndSubmit('user@test.com', 'secret');

    expect(await screen.findByText('Could not reach the server')).toBeTruthy();
  });

  it('disables the button while the request is in flight', async () => {
    let resolveLogin: (value: { status: 'invalid-credentials' }) => void = () =>
      undefined;
    loginMock.mockReturnValue(
      new Promise<{ status: 'invalid-credentials' }>((resolve) => {
        resolveLogin = resolve;
      })
    );
    renderLogin();

    fillAndSubmit('user@test.com', 'secret');

    const button = await screen.findByRole('button', { name: /signing in/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);

    resolveLogin({ status: 'invalid-credentials' });
    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement)
          .disabled
      ).toBe(false)
    );
  });
});