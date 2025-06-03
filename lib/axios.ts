import axios from "axios"
import Router from "next/router"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

const logoutAndRedirect = () => {
  localStorage.clear()
  Router.push("/login")
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken || refreshToken === "null" || refreshToken === "undefined") {
        logoutAndRedirect()
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newToken = data.accessToken

        localStorage.setItem("accessToken", newToken)
        api.defaults.headers.common["Authorization"] = "Bearer " + newToken
        processQueue(null, newToken)

        originalRequest.headers["Authorization"] = "Bearer " + newToken
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null);
       
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error)
  }
)

export default api