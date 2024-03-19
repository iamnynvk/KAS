import axios from "axios";
import { URL } from "../url.config";

const axiosInstance = axios.create({
  baseURL: URL.api,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
