import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, type LoginResult, useAuth } from './AuthContext';

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock('../data-access/auth.api', () => ({
  AuthApi: { login: loginMock },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function okResponse(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  } as unknown as Response;
}

function errorResponse(status: number) {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as unknown as Response;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    loginMock.mockReset();
  });

  describe('useAuth', () => {
    it('throws when used outside AuthProvider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth debe utilizarse dentro de AuthProvider'
      );

      consoleError.mockRestore();
    });
  });

  describe('initial state', () => {
    it('starts with a null token when localStorage is empty', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.token).toBeNull();
    });

    it('hydrates the token saved in localStorage', () => {
      localStorage.setItem('token', 'saved-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.token).toBe('saved-token');
    });
  });

  describe('login', () => {
    it('stores the access token and returns success', async () => {
      loginMock.mockResolvedValue(
        okResponse({ accessToken: 'new-token' })
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: LoginResult | undefined;
      await act(async () => {
        loginResult = await result.current.login('user@test.com', 'secret');
      });

      expect(loginResult).toEqual({ status: 'success' });
      expect(result.current.token).toBe('new-token');
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(loginMock).toHaveBeenCalledWith('user@test.com', 'secret');
    });

    it('returns invalid-credentials on 401 and keeps the session empty', async () => {
      loginMock.mockResolvedValue(errorResponse(401));
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: LoginResult | undefined;
      await act(async () => {
        loginResult = await result.current.login('user@test.com', 'wrong');
      });

      expect(loginResult).toEqual({ status: 'invalid-credentials' });
      expect(result.current.token).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('returns server-error with the HTTP status on 500', async () => {
      loginMock.mockResolvedValue(errorResponse(500));
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: LoginResult | undefined;
      await act(async () => {
        loginResult = await result.current.login('user@test.com', 'secret');
      });

      expect(loginResult).toEqual({ status: 'server-error', httpStatus: 500 });
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('returns server-error with the HTTP status on 429', async () => {
      loginMock.mockResolvedValue(errorResponse(429));
      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: LoginResult | undefined;
      await act(async () => {
        loginResult = await result.current.login('user@test.com', 'secret');
      });

      expect(loginResult).toEqual({ status: 'server-error', httpStatus: 429 });
    });

    it('propagates network errors so the form can show them', async () => {
      loginMock.mockRejectedValue(new TypeError('Failed to fetch'));
      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login('user@test.com', 'secret');
        })
      ).rejects.toThrow('Failed to fetch');
      expect(localStorage.getItem('token')).toBeNull();
    });

    // Pendiente: hoy un 200 sin accessToken guarda la cadena "undefined"
    // y deja al usuario autenticado. Convertir en test real al validar la respuesta.
    it.todo('rejects a 200 response that has no accessToken');
  });

  describe('logout', () => {
    it('clears the token from state and localStorage', async () => {
      localStorage.setItem('token', 'saved-token');
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(result.current.token).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
