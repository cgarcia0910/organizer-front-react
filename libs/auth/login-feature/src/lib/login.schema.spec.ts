import { describe, expect, it } from 'vitest';
import { loginSchema } from './login.schema';

function firstError(input: unknown, field: 'email' | 'password') {
  const result = loginSchema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('loginSchema', () => {
  it('accepts a valid email and a non-empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: 'secret',
    });

    expect(result.success).toBe(true);
  });

  describe('email', () => {
    it('reports "required" for an empty string', () => {
      expect(firstError({ email: '', password: 'x' }, 'email')).toBe(
        'Email is required.',
      );
    });

    it('rejects a missing field with a zod type error', () => {
      // El formulario nunca envía el campo sin valor (defaultValues lo inicializa a '').
      expect(firstError({ password: 'x' }, 'email')).toBeDefined();
    });

    it('reports the format message for a value without @', () => {
      expect(
        firstError({ email: 'not-an-email', password: 'x' }, 'email'),
      ).toBe('Please enter a valid email address.');
    });

    it('reports the format message for a value without a domain', () => {
      expect(firstError({ email: 'user@', password: 'x' }, 'email')).toBe(
        'Please enter a valid email address.',
      );
    });

    it('does not report the format message for an empty string', () => {
      expect(firstError({ email: '', password: 'x' }, 'email')).not.toBe(
        'Please enter a valid email address.',
      );
    });
  });

  describe('password', () => {
    it('reports "required" for an empty string', () => {
      expect(
        firstError({ email: 'user@test.com', password: '' }, 'password'),
      ).toBe('Password is required.');
    });

    it('rejects a missing field with a zod type error', () => {
      // El formulario nunca envía el campo sin valor (defaultValues lo inicializa a '').
      expect(firstError({ email: 'user@test.com' }, 'password')).toBeDefined();
    });

    it('does not enforce a minimum length, that is left to the server', () => {
      const result = loginSchema.safeParse({
        email: 'user@test.com',
        password: 'a',
      });

      expect(result.success).toBe(true);
    });
  });
});
