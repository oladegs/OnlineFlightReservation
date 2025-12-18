import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  status: 'loading', // loading | authenticated | unauthenticated | error
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading', error: null };
    case 'SET_USER':
      return { user: action.payload, status: 'authenticated', error: null };
    case 'LOGOUT':
      return { user: null, status: 'unauthenticated', error: null };
    case 'ERROR':
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchProfile = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await authApi.profile();
      dispatch({ type: 'SET_USER', payload: data.user });
    } catch {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = useCallback(async (payload) => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await authApi.login(payload);
      dispatch({ type: 'SET_USER', payload: data.user });
    } catch (authError) {
      dispatch({
        type: 'ERROR',
        payload: authError.response?.data?.message || 'Unable to sign in',
      });
      throw authError;
    }
  }, []);

  const register = useCallback(async (payload) => {
    dispatch({ type: 'LOADING' });
    try {
      const { data } = await authApi.register(payload);
      dispatch({ type: 'SET_USER', payload: data.user });
    } catch (authError) {
      dispatch({
        type: 'ERROR',
        payload: authError.response?.data?.message || 'Unable to register',
      });
      throw authError;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const listener = () => logout();
    window.addEventListener('appointly:auth:expired', listener);
    return () => window.removeEventListener('appointly:auth:expired', listener);
  }, [logout]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refresh: fetchProfile,
      isAuthenticated: state.status === 'authenticated',
    }),
    [state, login, register, logout, fetchProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

