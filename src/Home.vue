<template>
  <div class="app-container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container">
        <router-link class="navbar-brand" to="/">中国水土保持公示网</router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
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
    <div class="container">
      <div class="form-container">
        <div class="text-center">
          <button class="btn btn-success" @click="goToSubmit" style="width: 300px; margin-top: 20px; margin-bottom: 20px;">我要公示</button>
        </div>
        <!-- 搜索表单 -->
        <avue-crud
          :option="option"
          :data="data"
          :form="formData"
          @search="onSearch"
          @reset="onReset"
        >
          <!-- 自定义搜索按钮 -->
          <template #toolbar>
            <el-button type="success" @click="onSearch">立即搜索</el-button>
            <el-button @click="onReset">重置</el-button>
          </template>
        </avue-crud>
        <div class="search-results">
          <div v-for="item in searchResults" :key="item.id" 
              class="result-item" @click="viewDetail(item.id)">
            <h5>{{ item.project_name }}</h5>
            <p>{{ item.province }}-{{ item.city }}-{{ item.area }}</p>
            <p>开始时间：{{ formatDate(item.start_time) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref , onMounted } from "vue";
import { useRouter } from 'vue-router';
import axios from 'axios';
const baseUrl = 'https://cli.avuejs.com/api/area';

const router = useRouter();
const searchResults = ref([]);

const form = ref({
  province: '110000',
  city: '110100',
  area: '110101',
  imgUrl: []
});

// 模拟数据
const data = ref([
]);

// 搜索表单数据绑定
const formData = ref({
  projectType: "",
  projectName: "",
  startDate: "",
  endDate: "",
  province: "",
  city: "",
  area: "",
});

const onSearch = async () => {
  try {
    const res = await axios.get('/api/projects', {
      params: formData.value
    });
    searchResults.value = res.data;
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

const viewDetail = (id) => {
  router.push(`/detail/${id}`);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

const goToSubmit = () => {
  router.push('/submit');  // 跳转到 Submit.vue 页面
};

// Avue 配置
const option = ref({
  addBtn: false, // 关闭新增按钮
  refreshBtn: false,//关闭刷新按钮
  columnBtn: false,//关闭列显隐按钮
  editBtn: false,//关闭行内编辑按钮
  delBtn: false,//关闭行能删除按钮
  stripe: false,//是否显示表格的斑马条纹
  menu: false, // 关闭操作列

  column: [
    {
      label: "项目名称",
      prop: "projectName",
      search: true,
      searchSpan: 24,
      searchRange: true,
      placeholder: "请输入项目名称",
    },
    {
      label: "公示类型",
      prop: "projectType",
      type: "select",
      search: true,
      searchSpan: 8,
      hide: true, // 仅隐藏在表格中，表单仍然可见
      dicData: [
        { label: '默认公示' },
        { label: '验收公示', value: 'B' },
        { label: '检测公示', value: 'C' },
        { label: '方案公示', value: 'D' },
        { label: '其他公示', value: 'E' }
      ]
    },
    {
      label: "公示时间",
      prop: "daterange",
      type: "daterange",
      search: true,
      searchSpan: 16,
      searchRange: true,
      value: ["startDate", "endDate"],
    },
    {
      label: '项目位置',
      prop: 'province',
      type: 'select',
      search: true,
      searchSpan: 8,
      hide: true, // 仅隐藏在表格中，表单仍然可见
      props: {
        label: 'name',
        value: 'code'
      },
      cascader: ['city'],
      dicUrl: `${baseUrl}/getProvince`,
      placeholder: '请选择省市',
      rules: [
        {
          required: true,
          message: '请选择省市',
          trigger: 'blur'
        }
      ]
    },
    {
      prop: 'city',
      type: 'select',
      search: true,
      searchSpan: 8,
      hide: true, // 仅隐藏在表格中，表单仍然可见
      cascader: ['area'],
      props: {
        label: 'name',
        value: 'code'
      },
      dicUrl: `${baseUrl}/getCity/{{key}}`,
      placeholder: '请选择城市',
      rules: [
        {
          required: true,
          message: '请选择城市',
          trigger: 'blur'
        }
      ]
    },
    {
      prop: 'area',
      type: 'select',
      search: true,
      searchSpan: 8,
      hide: true, // 仅隐藏在表格中，表单仍然可见
      props: {
        label: 'name',
        value: 'code'
      },
      dicUrl: `${baseUrl}/getArea/{{key}}`,
      placeholder: '请选择地区',
      rules: [
        {
          required: true,
          message: '请选择地区',
          trigger: 'blur'
        }
      ]
    }
  ]
});


// 重置事件
const onReset = () => {
  formData.value = {
    projectType: "",
    projectName: "",
    startDate: "",
    endDate: "",
    province: "",
    city: "",
    area: "",
  };
//  console.log("重置表单：", formData.value);
};

// 页面加载时获取所有项目数据
onMounted(async () => {
  try {
    const res = await axios.get('/api/projects');
    searchResults.value = res.data;
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
  margin: 300px auto;
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
</style>