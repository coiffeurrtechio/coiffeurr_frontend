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

export function usersalonApi() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const generateAccessToken = async (): Promise<string | null> => {
    // const userData = localStorage.getItem("authState");
    // // if (!userData) return null;
    // const parsed = JSON.parse(userData);
    // const accessToken = parsed?.user?.access_token
    // const refreshToken = parsed?.refreshToken

    try {
      const response = await fetch(`${Config.API_BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          // Remove "Content-Type" if you aren't sending a body
        },
        // body: JSON.stringify({}), // Send an empty object to satisfy some fetch implementations
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


      const json = await response.json();

      localStorage.setItem(
        "authState",
        JSON.stringify({
          ...parsed,
          user: {
            json
          },
        })
      );
      localStorage.setItem("accessToken", JSON.stringify(json.accessToken));


      return result;
    } catch {
      navigate("/login");
      return null;
    }
  };



  const userapiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const userData = localStorage.getItem("authState");
      if (!userData) return { data: null, error: "No user data", status: 401 };

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.user?.access_token;
      console.log("parsed =", parsed);
      console.log("accessToken =", accessToken);


      const response = await fetch(`${Config.API_Customers}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...(options.headers || {}),
        },
        credentials: "include",
        ...options,
      });

      const status = response.status;
      console.log("response", response);

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
          // Save new token to localStorage
          localStorage.setItem(
            "authState",
            JSON.stringify({ ...parsed, accessToken: newToken })
          );

          // Retry original request with new token
          const retryResponse = await fetch(`${Config.API_Customers}${endpoint}`, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${newToken}`,
              ...(options.headers || {}),
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





  const userapiPost = async <T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const userData = localStorage.getItem("authState");
      if (!userData) return { data: null, error: "No user data", status: 401 };

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.user?.access_token;
      const isFormData = body instanceof FormData;

      const response = await fetch(`${Config.API_Customers}${endpoint}`, {
        method: "POST",
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          Authorization: `Bearer ${accessToken}`,
          ...(options.headers || {}),
        },
        body: isFormData ? (body as any) : JSON.stringify(body),
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
          data: json,
          error: json?.data || `Error: ${response.statusText}`,
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
      const userData = localStorage.getItem("authState");
      if (!userData) return { data: null, error: "No user data", status: 401 };

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.user?.access_token;
      console.log("parsed =", parsed);
      console.log("accessToken =", accessToken);


      const mergedHeaders = {
        "Content-Type": "application/json",
        ...options.headers, // Includes your X-User-Id
        "Authorization": `Bearer ${accessToken}`, // Explicitly added last
      };

      const response = await fetch(`${Config.API_Customers}${endpoint}`, {
        ...options, // 2. Spread options FIRST
        method: "POST", // 3. Set Method and Headers SECOND to ensure they aren't overwritten
        headers: mergedHeaders,
        body: JSON.stringify(body),
        credentials: "include",
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
              "Authorization": `Bearer ${newToken}`,
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



  const apiCustomerPut = async <T, B = unknown>(
    endpoint: string,
    body: B,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const userData = localStorage.getItem("authState");
      if (!userData) return { data: null, error: "No user data", status: 401 };

      const parsed = JSON.parse(userData);
      const accessToken = parsed?.user?.access_token;
      console.log("parsed =", parsed);
      console.log("accessToken =", accessToken);


      const mergedHeaders = {
        "Content-Type": "application/json",
        ...options.headers, // Includes your X-User-Id
        "Authorization": `Bearer ${accessToken}`, // Explicitly added last
      };

      const response = await fetch(`${Config.API_Customers}${endpoint}`, {
        ...options, // 2. Spread options FIRST
        method: "PUT", // 3. Set Method and Headers SECOND to ensure they aren't overwritten
        headers: mergedHeaders,
        body: JSON.stringify(body),
        credentials: "include",
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
              "Authorization": `Bearer ${newToken}`,
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


  //   const apiCustomerpiPost = async <T>(
  //   endpoint: string,
  //   options: RequestInit = {}
  // ): Promise<ApiResponse<T>> => {
  //   try {
  //     const userData = localStorage.getItem("authState");
  //     if (!userData) return { data: null, error: "No user data", status: 401 };

  //     const parsed = JSON.parse(userData);
  //     const accessToken = parsed?.user?.access_token;
  //     console.log("parsed =", parsed);
  //     console.log("accessToken =", accessToken);


  //     const response = await fetch(`${Config.API_Customers}${endpoint}`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //         ...(options.headers || {}),
  //       },
  //       credentials: "include",
  //       ...options,
  //     });

  //     const status = response.status;
  //     console.log("response", response);

  //     let json: any = null;
  //     try {
  //       json = await response.json();
  //     } catch {
  //       json = null;
  //     }

  //     // If unauthorized, try refreshing token once
  //     if (status === 401) {
  //       const newToken = await generateAccessToken();
  //       if (newToken) {
  //         // Save new token to localStorage
  //         // localStorage.setItem(
  //         //   "authState",
  //         //   JSON.stringify({ ...parsed, accessToken: newToken })
  //         // );

  //         // Retry original request with new token
  //         const retryResponse = await fetch(`${Config.API_Customers}${endpoint}`, {
  //           ...options,
  //           headers: {
  //             "Content-Type": "application/json",
  //             // Authorization: `Bearer ${newToken}`,
  //             ...(options.headers || {}),
  //           },
  //           credentials: "include",
  //         });

  //         const retryJson = await retryResponse.json();
  //         return {
  //           data: retryJson as T,
  //           error: null,
  //           status: retryResponse.status,
  //         };
  //       } else {
  //         navigate("/login");
  //         return { data: null, error: "Unauthorized", status: 401 };
  //       }
  //     }

  //     if (!response.ok) {
  //       return {
  //         data: null,
  //         error: json?.message || `Error: ${response.statusText}`,
  //         status,
  //       };
  //     }

  //     return { data: json as T, error: null, status };
  //   } catch (err: any) {
  //     return { data: null, error: err.message || "Network error", status: 500 };
  //   }
  // };


  return { userapiRequest, generateAccessToken, userapiPost, apiCustomerpiPost, apiCustomerPut };
}
