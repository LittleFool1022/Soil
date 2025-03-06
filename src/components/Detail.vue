<template>
  <div class="app-container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container-fluid"> <!-- 使用 container-fluid 适配移动端 -->
        <router-link class="navbar-brand" to="/">中国水土保持公示网</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item me-3">
              <router-link class="nav-link" to="/">返回首页</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 新增登录状态悬浮容器 -->
    <div class="login-status-container">
      <ul class="navbar-nav d-flex align-items-center">
        <li class="nav-item me-3">
          <el-dropdown v-if="isLoggedIn" trigger="hover">
            <span class="el-dropdown-link d-flex justify-content-center align-items-center">
              {{ user?.username || '' }}
               <el-icon><User /></el-icon> <!-- 添加用户图标 -->
            </span>
            <template #dropdown>
              <el-dropdown-menu class="login-dropdown-menu">
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <a v-else class="login-status-link d-flex justify-content-center align-items-center" @click="handleLoginClick">
            未登录 
            <el-icon><User /></el-icon> <!-- 未登录也添加图标 -->
          </a>
        </li>
      </ul>
    </div>

    <div class="form-container">
      <el-form :model="project" label-width="120px" style="border: none;">
        <el-form-item label="项目名称:">
          <span>{{ project.project_name }}</span>
        </el-form-item>
        <el-form-item label="公示类型:">
          <span>{{ getProjectTypeLabel(project.project_type) }}</span>
        </el-form-item>
        <el-form-item label="公示时间:">
          <span>{{ formatDate(project.create_time) }}</span>
        </el-form-item>
        <el-form-item label="建设单位:">
          <span>{{ project.construction_unit }}</span>
        </el-form-item>
        <el-form-item label="编制单位:">
          <span>{{ project.compilation_unit }}</span>
        </el-form-item>
        <el-form-item label="项目位置:">
          <span>{{ getLocationName(project.province, project.city, project.area) }}</span>
        </el-form-item>
        <el-form-item label="项目描述:">
          <span>{{ project.description }}</span>
        </el-form-item>
        <el-form-item label="附件下载:">
          <template v-for="(file, index) in project.pdfUrls" :key="index">
            <el-link :href="file.url" download @click.prevent="downloadFile(file.url)" style="margin-right: 20px;">{{ file.name }}</el-link>
            <br />
          </template>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getProjectById } from '../request';
import { codeToText } from 'element-china-area-data';

const router = useRouter();
const route = useRoute();
const project = ref({});
// 定义用户信息和登录状态的响应式变量
const user = ref(null);
const isLoggedIn = ref(false);

// 使用 watchEffect 监听 localStorage 变化
watchEffect(() => {
  let userData = null;
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      userData = JSON.parse(userJson);
    }
  } catch (error) {
    console.error('解析用户信息时出错:', error);
  }
  user.value = userData;
  isLoggedIn.value = !!localStorage.getItem('token');
  //console.log('登录状态：', isLoggedIn.value, '用户：', user.value);
});

const getProjectTypeLabel = (type) => {
  const types = {
    '': '默认公示',
    'B': '验收公示',
    'C': '检测公示',
    'D': '方案公示',
    'E': '其他公示'
  };
  return types[type] || '未知类型';
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

const getLocationName = (provinceCode, cityCode, areaCode) => {
  const provinceName = codeToText[provinceCode] || '';
  const cityName = codeToText[cityCode] || '';
  const areaName = codeToText[areaCode] || '';
  return `${provinceName}-${cityName}-${areaName}`;
};

const downloadFile = (url) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = url.split('/').pop();
  link.click();
};

const handleLoginClick = () => {
  if (!isLoggedIn.value) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    });
  }
};

const logout = () => {
  // 清除 localStorage 中的用户信息和 token
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // 更新登录状态
  isLoggedIn.value = false;
  user.value = null;
  // 跳转到登录界面
  //router.push('/login');
};

onMounted(async () => {
  const projectId = route.params.id;
  try {
    const res = await getProjectById(projectId); 
    project.value = res;
  } catch (error) {
    console.error('获取项目详情失败:', error);
  }
});
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
}

.form-container {
  max-width: 1200px;
  margin: 200px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.app-container::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 400px;
  background: url("/public/assets/background.webp") no-repeat center center;
  background-size: cover;
  opacity: 0.4;
  z-index: -1;
}

/* 统一登录状态容器样式 */
.login-status-container {
  position: fixed;
  top: 100px;
  right: 40px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  padding: 10px;
  z-index: 9999;
  opacity: 0.8;
  transition: opacity 0.3s;
  width: 200px; /* 调整宽度适配图标 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-status-container:hover {
  opacity: 1;
}

/* 已登录状态样式 */
.el-dropdown-link {
  color: white;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  gap: 8px;
  width: 100%;
  height: 100%;
  transition: color 0.3s;
  cursor: pointer;
}

.el-dropdown-link:hover {
  color: #409eff;
}

/* 未登录状态样式 */
.login-status-link {
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  gap: 8px;
  width: 100%;
  height: 100%;
  transition: color 0.3s;
  cursor: pointer;
}

.login-status-link:hover {
  color: #409eff;
}

/* 下拉菜单样式 */
.login-dropdown-menu {
  text-align: center;
}

/* 图标样式调整 */
.el-icon {
  font-size: 20px;
  color: #fff;
}

@media (max-width: 768px) {
  .navbar-brand {
    font-size: 16px;
  }
  
  .navbar-toggler {
    padding: 0.25rem 0.75rem;
  }

  .form-container {
    margin: 100px auto 20px;
    padding: 10px;
  }

  .el-form-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .el-form-item__label {
    width: 100px;
    font-size: 14px;
    flex-shrink: 0;
    padding-top: 4px;
  }

  .el-form-item__content {
    flex: 1;
    padding: 0;
    font-size: 14px;
    line-height: 1.6;
  }

  .login-status-container {
    top: 20px;
    right: 20px;
    width: auto;
    padding: 8px 12px;
  }

  .el-dropdown-link,
  .login-status-link {
    font-size: 14px;
    gap: 6px;
  }

  .el-icon {
    font-size: 18px;
  }

  .app-container::before {
    height: 200px;
  }

  .el-link {
    display: block;
    white-space: normal;
  }
}
</style>