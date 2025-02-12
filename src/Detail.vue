<template>
  <div class="app-container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <!-- 导航栏同Home.vue -->
    </nav>

    <div class="container detail-container">
      <div v-if="project">
        <h2>{{ project.project_name }}</h2>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目类型">{{ project.project_type }}</el-descriptions-item>
          <el-descriptions-item label="建筑单位">{{ project.construction_unit }}</el-descriptions-item>
          <el-descriptions-item label="编制单位">{{ project.compilation_unit }}</el-descriptions-item>
          <el-descriptions-item label="所在地区">
            {{ project.province }}/{{ project.city }}/{{ project.area }}
          </el-descriptions-item>
          <el-descriptions-item label="起止时间">
            {{ formatDate(project.start_time) }} 至 {{ formatDate(project.end_time) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="description-section">
          <h4>项目说明</h4>
          <p>{{ project.description }}</p>
        </div>

        <div class="pdf-section">
          <h4>相关附件</h4>
          <div v-for="(pdf, index) in parsedPdfUrls" :key="index">
            <a :href="pdf" target="_blank" class="pdf-link">
              <i class="el-icon-document"></i>
              附件{{ index + 1 }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const project = ref(null);
const parsedPdfUrls = ref([]);

onMounted(async () => {
  try {
    const res = await axios.get(`/api/projects/${route.params.id}`);
    project.value = res.data;
    parsedPdfUrls.value = JSON.parse(project.value.pdf_urls);
  } catch (error) {
    console.error('获取详情失败:', error);
  }
});

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};
</script>

<style scoped>
.detail-container {
  max-width: 1200px;
  margin: 100px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.description-section {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.pdf-section {
  margin-top: 30px;
}

.pdf-link {
  display: inline-block;
  margin: 10px 15px 10px 0;
  padding: 8px 15px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  transition: all 0.3s;
}

.pdf-link:hover {
  background: #409eff;
  color: white;
}
</style>