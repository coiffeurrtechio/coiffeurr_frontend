import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Try to rehydrate from localStorage
const storedState = localStorage.getItem("authState");
const initialState: AuthState = storedState
  ? JSON.parse(storedState)
  : {
    user: null,
    isAuthenticated: false,
  };






const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      Object.assign(state, action.payload);
      // Persist partial update to localStorage
      localStorage.setItem("authState", JSON.stringify(state));
    },
    login: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("authState", JSON.stringify(state));
      localStorage.setItem('lastVisit', Date.now().toString());;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("authState");
    },
  },
});

export const { login, logout, setAuth } = authSlice.actions;
export default authSlice.reducer;
