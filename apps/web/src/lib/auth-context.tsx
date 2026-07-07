"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "./api";

interface AuthState {
  token: string | null;
  setupComplete: boolean | null;
  loading: boolean;
}

type Role = "parent" | "child" | null;

interface AuthContextValue extends AuthState {
  role: Role;
  login: (password: string) => Promise<void>;
  setup: (data: {
    password: string;
    systemName: string;
    locale: string;
    timezone: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  setupComplete: null,
  loading: true,
  role: null,
  login: async () => {},
  setup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    setupComplete: null,
    loading: true,
  });
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const stored = localStorage.getItem("hemmaos-token");
    // Set token immediately so authCheck can use it
    if (stored) api.setToken(stored);

    api
      .authCheck()
      .then((info) => {
        setState({
          token: stored,
          setupComplete: info.setupComplete,
          loading: false,
        });
      })
      .catch(() => {
        setState({
          token: stored,
          setupComplete: null,
          loading: false,
        });
      });
  }, []);

  // Update the API client + fetch the current user's role when token changes
  useEffect(() => {
    if (state.token) {
      api.setToken(state.token);
      api
        .me()
        .then((m) => setRole(m.role))
        .catch(() => setRole(null));
    } else {
      setRole(null);
    }
  }, [state.token]);

  async function login(password: string) {
    const result = await api.login(password);
    localStorage.setItem("hemmaos-token", result.token);
    api.setToken(result.token);
    setState((prev) => ({ ...prev, token: result.token }));
  }

  async function setup(data: {
    password: string;
    systemName: string;
    locale: string;
    timezone: string;
  }) {
    const result = await api.setup(data);
    localStorage.setItem("hemmaos-token", result.token);
    api.setToken(result.token);
    setState({ token: result.token, setupComplete: true, loading: false });
  }

  function logout() {
    localStorage.removeItem("hemmaos-token");
    api.setToken(null);
    setState((prev) => ({ ...prev, token: null }));
  }

  return (
    <AuthContext.Provider value={{ ...state, role, login, setup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
