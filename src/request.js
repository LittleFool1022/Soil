import axios from 'axios'

// 创建axios实例
const service = axios.create({
  // 基础地址（根据环境变量自动切换）
  baseURL: process.env.NODE_ENV === 'development' 
      ? 'https://www.zgstbc.com' 
      : 'https://www.zgstbc.com',
      //? 'http://localhost:3000' 
      //? 'https://zgstbc.netlify.app'
      //: 'http://localhost:8081',
  // 超时时间
  timeout: 15000,
  retry: 2, // 重试次数
  retryDelay: 1000, // 重试间隔
  
  // 默认请求头
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 自动携带 token
    if (localStorage.token) {
      config.headers.Authorization = `Bearer ${localStorage.token}`;
    }
    config.retryCount = 0; // 初始化重试次数
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
// request.js（修改后的响应拦截器）
service.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      console.error('响应错误，状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送，但没有收到响应');
    } else {
      console.error('请求设置时发生错误:', error.message);
    }
    // 直接返回原始错误对象，不包装为字符串
    return Promise.reject(error);
  }
);

// 项目查询接口
export const getProjects = (params) => {
  return service.get('/api/projects', { params })
    .then(response => {
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('getProjects 响应数据不是数组:', response.data);
        return [];
      }
    })
    .catch(error => {
      console.error('getProjects 请求出错:', error);
      return [];
    });
};

// 根据 ID 获取项目详情
export const getProjectById = async (id) => {
  try {
    const response = await service.get(`/api/projects/${id}`);
    if (response && response.status === 200) {
      return response.data;
    } else {
      throw new Error(`请求失败，状态码: ${response ? response.status : '未知'}`);
    }
  } catch (error) {
    if (error.response) {
      console.error('响应错误，状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送，但没有收到响应');
    } else {
      console.error('请求设置时发生错误:', error.message);
    }
    // 重新抛出错误，以便调用处可以捕获
    throw error;
  }
};

// 项目提交接口
export const submitProject = (data) => {
    return service.post('/api/projects', data);
};

// 文件上传接口
export const uploadFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return service.post('/api/uploads', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// 文件删除接口
export const deleteFile = (fileUrl) => {
    return service.delete('/api/uploads/files', {
        params: { url: fileUrl }
    });
};

// 登录接口
export const login = (username, password) => {
    return service.post('/api/login', { username, password });
};

// 注册接口
export const register = (username, password) => {
    return service.post('/api/register', { username, password });
};

export default service