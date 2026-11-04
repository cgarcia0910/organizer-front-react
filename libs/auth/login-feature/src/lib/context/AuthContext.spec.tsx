import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, type AuthUser, type LoginResult, useAuth } from './AuthContext';

const { loginMock, whoamiMock, logoutMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  whoamiMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock('../data-access/auth.api', () => ({
  AuthApi: { login: loginMock, whoami: whoamiMock, logout: logoutMock },
}));

const adminUser: AuthUser = {
  email: 'user@test.com',
  roles: ['CATALOG_ADMIN'],
  tenant: { id: 't1', name: 'Tenant' },
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function okResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
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

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper });
}

async function waitForInitialLoad(result: ReturnType<typeof renderAuth>['result']) {
  await waitFor(() => expect(result.current.isLoading).toBe(false));
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    loginMock.mockReset();
    whoamiMock.mockReset();
    logoutMock.mockReset();

    // Sin sesión por defecto: el montaje de AuthProvider llama a whoami.
    whoamiMock.mockResolvedValue(errorResponse(401));
    logoutMock.mockResolvedValue(okResponse({}));
  });

  describe('useAuth', () => {
    it('throws when used outside AuthProvider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth debe utilizarse dentro de AuthProvider',
      );

      consoleError.mockRestore();
    });
  });

  describe('initial state', () => {
    it('starts loading and ends with no user when there is no session', async () => {
      const { result } = renderAuth();

      expect(result.current.isLoading).toBe(true);

      await waitForInitialLoad(result);

      expect(result.current.user).toBeNull();
    });

    it('restores the user from the session cookie through whoami', async () => {
      whoamiMock.mockResolvedValue(okResponse(adminUser));

      const { result } = renderAuth();
      await waitForInitialLoad(result);

      expect(result.current.user).toEqual(adminUser);
      expect(whoamiMock).toHaveBeenCalledTimes(1);
    });

    it('ends loading with no user when whoami rejects', async () => {
      whoamiMock.mockRejectedValue(new TypeError('Failed to fetch'));

      const { result } = renderAuth();
      await waitForInitialLoad(result);

      expect(result.current.user).toBeNull();
    });

    // Pendiente: el payload de whoami no se valida; un 200 con forma inesperada
    // se guarda tal cual en `user`.
    it.todo('validates the whoami payload shape');
  });

  describe('login', () => {

    it('returns invalid-credentials on 401 without calling whoami', async () => {
      loginMock.mockResolvedValue(errorResponse(401));
      const { result } = renderAuth();
      await waitForInitialLoad(result);

      let loginResult: LoginResult | undefined;
      await act(async () => {
        loginResult = await result.current.login('user@test.com', 'wrong');
      });

      expect(loginResult).toEqual({ status: 'invalid-credentials' });
      expect(whoamiMock).toHaveBeenCalledTimes(1); // solo el del montaje
      expect(result.current.user).toBeNull();
    });

    it.each([500, 429])('returns server-error with the HTTP status %i', async (status) => {
      loginMock.mockResolvedValue(errorResponse(status));
      const { result } = renderAuth();
      await waitForInitialLoad(result);

      let loginResult: LoginResult | undefined;
      await act(async () => {
        loginResult = await result.current.login('user@test.com', 'secret');
      });

      expect(loginResult).toEqual({ status: 'server-error', httpStatus: status });
      expect(result.current.user).toBeNull();
    });

    it('returns server-error when login succeeds but whoami fails', async () => {
      loginMock.mockResolvedValue(okResponse({}));
      whoamiMock
        .mockResolvedValueOnce(errorResponse(401))
        .mockResolvedValueOnce(errorResponse(500));
      const { result } = renderAuth();
      await waitForInitialLoad(result);

      let loginResult: LoginResult | undefined;
      await act(async () => {
        loginResult = await result.current.login('user@test.com', 'secret');
      });

      expect(loginResult).toEqual({ status: 'server-error', httpStatus: 500 });
      expect(result.current.user).toBeNull();
    });

    it('propagates network errors so the form can show them', async () => {
      loginMock.mockRejectedValue(new TypeError('Failed to fetch'));
      const { result } = renderAuth();
      await waitForInitialLoad(result);

      await expect(
        act(async () => {
          await result.current.login('user@test.com', 'secret');
        }),
      ).rejects.toThrow('Failed to fetch');
      expect(result.current.user).toBeNull();
    });

    it('does not write anything to browser storage', async () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      loginMock.mockResolvedValue(okResponse({}));
      whoamiMock
        .mockResolvedValueOnce(errorResponse(401))
        .mockResolvedValueOnce(okResponse(adminUser));
      const { result } = renderAuth();
      await waitForInitialLoad(result);

      await act(async () => {
        await result.current.login('user@test.com', 'secret');
      });

      expect(setItemSpy).not.toHaveBeenCalled();
      expect(localStorage.length).toBe(0);

      setItemSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('calls the logout endpoint and clears the user', async () => {
      whoamiMock.mockResolvedValue(okResponse(adminUser));
      const { result } = renderAuth();
      await waitForInitialLoad(result);
      expect(result.current.user).toEqual(adminUser);

      await act(async () => {
        await result.current.logout();
      });

      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(result.current.user).toBeNull();
    });

    it('still clears the user when the logout request fails', async () => {
      whoamiMock.mockResolvedValue(okResponse(adminUser));
      logoutMock.mockRejectedValue(new TypeError('Failed to fetch'));
      const { result } = renderAuth();
      await waitForInitialLoad(result);

      let logoutError: unknown;
      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          logoutError = error;
        }
      });

      expect((logoutError as Error).message).toBe('Failed to fetch');
      expect(result.current.user).toBeNull();
    });
  });
});
