export class AuthApi {
  public static login(email: string, password: string): Promise<Response> {
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
  }

  public static whoami() {
    return fetch('/api/auth/whoami', {method: 'GET'})
  }

  public static logout(): Promise<Response> {
    return fetch('/api/auth/logout', {method: 'POST'})
  }
}
