import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API, { disconnectSocket } from "./api";

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await API.post("/auth/login", credentials);
    localStorage.setItem("token", data.data.token);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await API.post("/auth/register", userData);
    localStorage.setItem("token", data.data.token);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Registration failed");
  }
});

export const getMe = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
  // Retry transient failures (rate limit, network, server hiccup) so a reload
  // doesn't bounce a logged-in user to /login. A real 401 stops immediately.
  for (let attempt = 0; ; attempt++) {
    try {
      const { data } = await API.get("/auth/me");
      return data.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || attempt >= 2) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
      }
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
});

const authSlice = createSlice({
  name: "auth",
  // authChecked stays false on reload while a stored token is being verified via getMe,
  // so ProtectedRoute can wait instead of redirecting to /login too early.
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    authChecked: !localStorage.getItem("token"),
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      // Drop the socket so the next login can't inherit this user's identity
      disconnectSocket();
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const fulfilled = (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.authChecked = true;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, fulfilled)
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.authChecked = true;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

const store = configureStore({
  reducer: { auth: authSlice.reducer },
});

export default store;
