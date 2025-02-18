import axios from 'axios'

// 创建axios实例
const service = axios.create({
  // 基础地址（根据环境变量自动切换）
  baseURL: process.env.NODE_ENV === 'development' 
      //? 'http://localhost:3000' 
      ? 'https://zgstbc.com'
      : process.env.VUE_APP_API_BASE_URL || 'https://zgstbc.com',
      //: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000',
      //baseURL: process.env.VUE_APP_API_BASE_URL || 'https://zgstbc.com',
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
// 请求拦截器
service.interceptors.request.use(
  config => {
    //console.log('请求配置:', config);
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
service.interceptors.response.use(
  response => {
    //console.log('正常响应数据:', response);
    // 直接返回完整的响应对象
    return response; 
  },
  error => {
    //console.log('进入错误处理分支，错误信息:', error);
    if (error.response) {
      console.error('响应错误，状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送，但没有收到响应');
    } else {
      console.error('请求设置时发生错误:', error.message);
    }
    // 统一错误处理
    const message = error.response?.data?.message || 
                   error.message ||
                   '网络连接异常';
    console.error('API Error:', message);
    return Promise.reject(message);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    //console.log('正常响应数据:', response);
    // 统一处理响应数据，这里直接返回完整的响应对象
    return response; 
  },
  error => {
    //console.log('进入错误处理分支，错误信息:', error);
    if (error.response) {
      console.error('响应错误，状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送，但没有收到响应');
    } else {
      console.error('请求设置时发生错误:', error.message);
    }
    // 统一错误处理
    const message = error.response?.data?.message || 
                   error.message ||
                   '网络连接异常';
    console.error('API Error:', message);
    return Promise.reject(message);
  }
);


// 项目查询接口
export const getProjects = (params) => {
  return service.get('/api/projects', { params })
    .then(response => {
      //console.log('getProjects 响应数据类型:', typeof response.data, '是否为数组:', Array.isArray(response.data));
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
    //console.log('getProjectById 收到的响应:', response);
    //console.log('响应对象类型:', typeof response);
    //console.log('响应对象属性:', Object.keys(response));

    if (response && response.status === 200) {
      //console.log('getProjectById 响应数据:', response.data);
      return response.data;
    } else {
      throw new Error(`请求失败，状态码: ${response ? response.status : '未知'}`);
    }
  } catch (error) {
    //console.log('getProjectById 捕获到的错误:', error);
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

export default service
