<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container">
        <router-link class="navbar-brand" to="/">中国水土保持公示网</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link class="nav-link" to="/">返回首页</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

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
        <el-form-item label="项目附件:">
          <template v-for="(file, index) in project.pdfUrls" :key="index">
            <el-link :href="file.url" download @click.prevent="downloadFile(file.url)">{{ file.name }}</el-link>
            <br />
          </template>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getProjectById  } from './request'; // 假设存在一个根据 ID 获取项目详情的接口
import { codeToText } from 'element-china-area-data';

const route = useRoute();
const project = ref({});

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

onMounted(async () => {
  const projectId = route.params.id;
  try {
    //console.log('开始请求项目详情，项目 ID:', projectId);
    const res = await getProjectById(projectId); 
    //console.log('获取到的项目详情:', res);
    project.value = res;
    //console.log('项目数据赋值完成，当前项目数据:', project.value);
  } catch (error) {
    console.error('捕获到的错误:', error);
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
</style>