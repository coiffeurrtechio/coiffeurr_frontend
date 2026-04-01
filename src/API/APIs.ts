import Config from "../configs/config";
import { logout } from "../utils/Storage/slice/authSlice";

export const logoutUser = () => async (dispatch) => {
  try {
    await fetch(`${Config.API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include", 
    });
  } catch (error) {
    console.error("Logout API failed", error);
  } finally {
    // 1. Clear Redux State
    dispatch(logout());
    // 2. Clear Storage
    localStorage.removeItem("authState");
    localStorage.removeItem("token");
  }
};