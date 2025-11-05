// JWT-based authentication for admin panel
import axios from "axios";
import { url } from "../assets/assets";

export async function loginWithCredentials(id, password) {
  try {
    const response = await axios.post(`${url}/api/user/admin-login`, {
      id,
      password
    });

    if (response.data?.success) {
      return {
        token: response.data.token,
        user: response.data.user
      };
    } else {
      throw new Error(response.data?.message || "Login failed");
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Login failed");
  }
}
