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
                <router-link class="nav-link" to="/">首页</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="form-container">
      <div class="text-center">
        <el-button type="success" @click="goToSubmit" style="width: 300px; margin-top: 10px; margin-bottom: 10px;">我要公示</el-button>
      </div>
      <hr class="divider-line">
      <!-- 搜索表单 -->
      <el-form :model="formData" ref="searchFormRef" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目名称">
              <el-input v-model="formData.projectName" placeholder="请输入项目名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公示类型">
              <el-select v-model="formData.projectType" placeholder="请选择公示类型">
                <el-option label="默认公示" value=""></el-option>
                <el-option label="验收公示" value="B"></el-option>
                <el-option label="检测公示" value="C"></el-option>
                <el-option label="方案公示" value="D"></el-option>
                <el-option label="其他公示" value="E"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公示时间">
              <el-date-picker
                v-model="formData.daterange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleDateRangeChange"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目位置">
              <el-cascader
                v-model="formData.areaCode"
                :options="areaOptions"
                :props="areaProps"
                placeholder="请选择省/市/区"
                :emitPath="true"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" style="text-align: center;">
            <el-button type="success" @click="onSearch">立即搜索</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-col>
        </el-row>
      </el-form>
      <!-- 搜索结果 -->
      <el-table :data="searchResults" style="width: 100%" @row-click="viewDetail">
        <el-table-column prop="project_name" label="项目名称">
          <template #default="scope">
            <span class="project-name-hoverable">{{ scope.row.project_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目位置">
          <template #default="scope">
            {{ getLocationName(scope.row.province, scope.row.city, scope.row.area) }}
          </template>
        </el-table-column>
        <el-table-column label="公示时间">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { getProjects } from './request';
import { regionData, codeToText } from 'element-china-area-data';

const router = useRouter();

const searchResults = ref([]);
const formData = ref({
  projectType: "",
  projectName: "",
  constructionUnit: "",
  compilationUnit: "",
  daterange: [],
  areaCode: []
});
const areaOptions = ref(regionData);
const areaProps = ref({
  value: 'value',
  label: 'label',
  children: 'children',
  emitPath: true,
  checkStrictly: false
});

const searchFormRef = ref(null);

const onSearch = async () => {
  try {
    const [province, city, area] = formData.value.areaCode;
    const params = {
      projectType: formData.value.projectType,
      projectName: formData.value.projectName,
      startDate: formData.value.daterange[0]? new Date(formData.value.daterange[0]).toISOString().split('T')[0] : '',
      endDate: formData.value.daterange[1]? new Date(formData.value.daterange[1]).toISOString().split('T')[0] : '',
      province: province? province.toString() : '',
      city: city? city.toString() : '',
      area: area? area.toString() : ''
    };
    const res = await getProjects(params);
    searchResults.value = res;
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

const viewDetail = (row) => {
    router.push(`/detail/${row.id}`);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

const goToSubmit = () => {
  router.push('/submit');  // 跳转到 Submit.vue 页面
};

const onReset = async () => {
  // 清空搜索表单数据
  formData.value = {
    projectType: "",
    projectName: "",
    daterange: [],
    areaCode: []
  };
  try {
    // 调用 getProjects 函数获取所有项目数据
    const res = await getProjects();
    searchResults.value = res;
  } catch (error) {
    console.error('重置后获取项目数据失败:', error);
  }
};

const handleDateRangeChange = (value) => {
  if (value && value.length === 2) {
    formData.value.startDate = new Date(value[0]).toISOString().split('T')[0];
    formData.value.endDate = new Date(value[1]).toISOString().split('T')[0];
  } else {
    formData.value.startDate = "";
    formData.value.endDate = "";
  }
};

const getLocationName = (provinceCode, cityCode, areaCode) => {
  const provinceName = codeToText[provinceCode] || '';
  const cityName = codeToText[cityCode] || '';
  const areaName = codeToText[areaCode] || '';
  return `${provinceName}-${cityName}-${areaName}`;
};

onMounted(async () => {
  try {
    const res = await getProjects();
    searchResults.value = res;
  } catch (error) {
    console.error('获取项目数据失败:', error);
  }
});
</script>

<style scoped>
.search-results {
  margin-top: 20px;
}

.result-item {
  padding: 15px;
  border: 1px solid #eee;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.result-item:hover {
  background: #f8f9fa;
}

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
  height: 400px; /* 限制背景高度为上栏 */
  background: url("/public/assets/background.webp") no-repeat center center;
  background-size: cover;
  opacity: 0.4; /* 降低透明度 60% (1 - 0.4 = 0.6) */
  z-index: -1; /* 置于最底层 */
}

/* 新增样式 */
.project-name-hoverable {
  cursor: pointer;
}

.project-name-hoverable:hover {
  color: #409eff; /* 鼠标悬停时的字体颜色，可根据需要修改 */
}
</style>