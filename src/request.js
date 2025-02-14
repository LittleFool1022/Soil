import axios from 'axios'

// 创建axios实例
const service = axios.create({
  // 基础地址（根据环境变量自动切换）
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000',
  
  // 超时时间
  timeout: 15000,
  
  // 默认请求头
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 自动携带token
    if (localStorage.token) {
      config.headers.Authorization = `Bearer ${localStorage.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 统一处理响应数据
    return response.data
  },
  error => {
    // 统一错误处理
    const message = error.response?.data?.message || 
                   error.message ||
                   '网络连接异常'
    console.error('API Error:', message)
    return Promise.reject(message)
  }
)

export default service
