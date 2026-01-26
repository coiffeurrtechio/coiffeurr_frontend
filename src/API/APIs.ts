import Config from "../configs/config";
import { logout } from "../utils/Storage/slice/authSlice";

export const logoutUser = () => async (dispatch) => {
  try {
    await fetch(`${Config.API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include", // 🔥 clears cookies
    });
  } catch (error) {
    console.error("Logout API failed", error);
  } finally {
    dispatch(logout());
  }
};
