import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthService } from '../services/auth/AuthService';

interface IUser {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  last_access: Date;
  access_expiration: Date;
}

interface IAuthContextData {
  logout: () => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | void>;
  user: IUser | null;
  accessToken?: string;
}

const AuthContext = createContext({} as IAuthContextData);

const LOCAL_STORAGE_KEY__ACCESS_TOKEN = 'APP_ACCESS_TOKEN';
const LOCAL_STORAGE_KEY__USER_INFO = 'APP_USER_INFO';

interface IAuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string>();
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEY__ACCESS_TOKEN);
    const userInfo = localStorage.getItem(LOCAL_STORAGE_KEY__USER_INFO);

    if (token) setAccessToken(token);

    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);

        // Converte strings ISO para Date
        const userWithDates: IUser = {
          ...parsedUser,
          last_access: parsedUser.last_access ? new Date(parsedUser.last_access) : null,
          access_expiration: parsedUser.access_expiration ? new Date(parsedUser.access_expiration) : null,
        };

        setUser(userWithDates);
      } catch (e) {
        console.warn('Erro ao parsear usuário do localStorage:', e);
        localStorage.removeItem(LOCAL_STORAGE_KEY__USER_INFO);
        setUser(null);
      }
    }
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const result = await AuthService.auth(email, password);
    if (result instanceof Error) {
      return result.message;
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY__ACCESS_TOKEN, result.access);
      localStorage.setItem(LOCAL_STORAGE_KEY__USER_INFO, JSON.stringify(result.user));
      setAccessToken(result.access);
      setUser(result.user);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY__ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEY__USER_INFO);
    setAccessToken(undefined);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => !!accessToken, [accessToken]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login: handleLogin, logout: handleLogout, user, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
