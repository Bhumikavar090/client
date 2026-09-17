const TOKEN_KEY = "devtrace_token";
const USER_KEY = "devtrace_user";

export interface DevTraceUser {
  id: string;
  name: string;
  email: string;
}

export const auth = {
  setSession(token: string, user: DevTraceUser) {
    if (typeof window === "undefined") return;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): DevTraceUser | null {
    if (typeof window === "undefined") return null;

    const user = localStorage.getItem(USER_KEY);

    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!auth.getToken();
  },

  logout() {
    if (typeof window === "undefined") return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getAuthHeaders(): HeadersInit {
    const token = auth.getToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  },
};