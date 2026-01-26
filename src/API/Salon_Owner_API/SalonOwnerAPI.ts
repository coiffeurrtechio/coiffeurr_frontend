import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Config from "../../configs/config";
import { login, logout } from "../../utils/Storage/slice/authSlice";
import { logoutUser } from "../APIs";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export function useSalonApi() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const generateAccessToken = async (): Promise<string | null> => {
    const userData = localStorage.getItem("authState");
    if (!userData) return null;
    const parsed = JSON.parse(userData);
    const accessToken = parsed?.user?.accessToken
    const refreshToken = parsed?.refreshToken

    try {
      const response = await fetch(`${Config.API_BASE_URL}/refreshtoken`, {
        headers: {
          "Content-Type": "application/json",
          // Authorization: accessToken ? `Bearer ${accessToken}` : "",
          "X-Refresh-Token": refreshToken, // 👈 send refresh token in header
        },
        credentials: "include",
      });

      if (!response.ok) {
        // dispatch(logout());
        dispatch(logoutUser());

        navigate("/login");
        return null;
      }

      const result = await response.json();
      dispatch(
        login({
          user: result             // user details (id, email, etc.)
        })
      );


      // const json = await response.json();

      // localStorage.setItem(
      //   "authState",
      //   JSON.stringify({
      //     ...parsed,
      //     user: {
      //       json
      //     },
      //   })
      // );
      // localStorage.setItem("accessToken", JSON.stringify(json.accessToken));


      return result;
    } catch {
      navigate("/login");
      return null;
    }
  };



  const apiSalonRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const userData = localStorage.getItem("authState");

      if (!userData) return { data: null, error: "No user data", status: 401 };

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.user?.accessToken;

      const response = await fetch(`${Config.API_Salon_owner}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${accessToken}`,
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
          const retryResponse = await fetch(`${Config.API_Salon_owner}${endpoint}`, {
            headers: {
              "Content-Type": "application/json",
              ...(options.headers || {}),
            },
            credentials: "include",
            ...options,
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


  const apiSalonPost = async <T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const userData = localStorage.getItem("authState");

      if (!userData) return { data: null, error: "No user data", status: 401 };

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.user?.accessToken;

      const response = await fetch(`${Config.API_Salon_owner}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${accessToken}`,
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
              // Authorization: `Bearer ${newToken}`,
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




  const apiSalonPut = async <T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const userData = localStorage.getItem("authState");

      if (!userData) return { data: null, error: "No user data", status: 401 };

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.user?.accessToken;
      const response = await fetch(`${Config.API_Salon_owner}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${accessToken}`,

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
              // Authorization: `Bearer ${newToken}`,
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

  return { generateAccessToken, apiSalonPost, apiSalonRequest, apiSalonPut };
}
