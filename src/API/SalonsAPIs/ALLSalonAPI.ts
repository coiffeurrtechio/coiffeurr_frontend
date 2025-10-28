import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Config from "../../configs/config";
import { logout, setAuth } from "../../utils/Storage/slice/authSlice";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export function useApi() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const generateAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${Config.API_BASE_URL}/refreshtoken`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        dispatch(logout());
        navigate("/login");
        return null;
      }

      const json = await response.json();

      return json;
    } catch {
      navigate("/login");
      return null;
    }
  };

  const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${Config.API_Customers}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        credentials: "include",
        ...options,
      });

      const status = response.status;
      let json: any = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      // If unauthorized, try refreshing token once
      if (status === 401) {
        const newToken = await generateAccessToken();
        if (newToken) {
          // Retry original request with new token
          const retryResponse = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
              // ...(options.headers || {}),
            },
            credentials: "include",
          });

          const retryJson = await retryResponse.json();
          return {
            data: retryJson as T,
            error: null,
            status: retryResponse.status,
          };
        } else {
          navigate("/login");
          return { data: null, error: "Unauthorized", status: 401 };
        }
      }

      if (!response.ok) {
        return {
          data: null,
          error: json?.message || `Error: ${response.statusText}`,
          status,
        };
      }

      return { data: json as T, error: null, status };
    } catch (err: any) {
      return { data: null, error: err.message || "Network error", status: 500 };
    }
  };


  


  const apiPost = async <T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        body: JSON.stringify(body),
        credentials: "include",
        ...options,
      });

      const status = response.status;
      let json: any = null;

      try {
        json = await response.json();
      } catch {
        json = null;
      }

      // Handle unauthorized → try refresh
      if (status === 401) {
        const newToken = await generateAccessToken();
        if (newToken) {
          // Retry with refreshed token
          const retryResponse = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
              ...(options.headers || {}),
            },
            body: JSON.stringify(body),
            credentials: "include",
          });

          const retryJson = await retryResponse.json();
          return {
            data: retryJson as T,
            error: null,
            status: retryResponse.status,
          };
        } else {
          navigate("/login");
          return { data: null, error: "Unauthorized", status: 401 };
        }
      }

      if (!response.ok) {
        return {
          data: null,
          error: json?.message || `Error: ${response.statusText}`,
          status,
        };
      }

      return { data: json as T, error: null, status };
    } catch (err: any) {
      return { data: null, error: err.message || "Network error", status: 500 };
    }
  };
 
 
  const apiCustomerpiPost = async <T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${Config.API_Customers}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        body: JSON.stringify(body),
        credentials: "include",
        ...options,
      });

      const status = response.status;
      let json: any = null;

      try {
        json = await response.json();
      } catch {
        json = null;
      }

      // Handle unauthorized → try refresh
      if (status === 401) {
        const newToken = await generateAccessToken();
        if (newToken) {
          // Retry with refreshed token
          const retryResponse = await fetch(`${Config.API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
              ...(options.headers || {}),
            },
            body: JSON.stringify(body),
            credentials: "include",
          });

          const retryJson = await retryResponse.json();
          return {
            data: retryJson as T,
            error: null,
            status: retryResponse.status,
          };
        } else {
          navigate("/login");
          return { data: null, error: "Unauthorized", status: 401 };
        }
      }

      if (!response.ok) {
        return {
          data: null,
          error: json?.message || `Error: ${response.statusText}`,
          status,
        };
      }

      return { data: json as T, error: null, status };
    } catch (err: any) {
      return { data: null, error: err.message || "Network error", status: 500 };
    }
  };


  return { apiRequest, generateAccessToken, apiPost, apiCustomerpiPost };
}
