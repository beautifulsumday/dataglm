import axiosLib from "axios";
import qs from "query-string";

export const axios = axiosLib.create({
  paramsSerializer: params => qs.stringify(params),
  xsrfCookieName: "csrf_token",
  xsrfHeaderName: "X-CSRF-TOKEN",
});

axios.defaults.withCredentials = true;

// axios.interceptors.response.use(response => response.data);