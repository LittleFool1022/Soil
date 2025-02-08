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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 模拟数据
const data = ref([
  {
    projectName: "项目1",
    startTime: "2024-10-01",
    endTime: "2024-10-10",
    projectTypeMain: "类型A",
    projectTypeSub: "子类型1",
    province: "省份A",
    city: "城市A",
    district: "区县A",
  },
]);

// 搜索表单数据绑定
const formData = ref({
  projectName: "",
  startTime: "",
  endTime: "",
  projectTypeMain: "",
  projectTypeSub: "",
  province: "",
  city: "",
  district: "",
});

// Avue 配置
const option = ref({
  column: [
    {
      label: "项目名称",
      prop: "projectName",
      search: true,
      placeholder: "请输入项目名称",
    },
    {
      label: "公示时间",
      prop: "time",
      type: "datetime",
      search: true,
      searchSpan: 18,
      searchRange: true,
      value: ["startTime", "endTime"],
    },
    {
      label: "项目类型",
      prop: "projectType",
      type: "select",
      search: true,
      dicData: [
        { label: "类型A", value: "A" },
        { label: "类型B", value: "B" },
      ],
      children: [
        {
          label: "项目子类",
          prop: "projectTypeSub",
          type: "select",
          search: true,
          dicData: [
            { label: "子类型1", value: "1" },
            { label: "子类型2", value: "2" },
          ],
        },
      ],
    },
    {
      label: "项目位置",
      prop: "location",
      type: "select",
      search: true,
      dicData: [
        { label: "省份A", value: "A" },
        { label: "省份B", value: "B" },
      ],
      children: [
        {
          label: "市",
          prop: "city",
          type: "select",
          search: true,
          dicData: [
            { label: "城市A", value: "A" },
            { label: "城市B", value: "B" },
          ],
        },
        {
          label: "县/区",
          prop: "district",
          type: "select",
          search: true,
          dicData: [
            { label: "区县A", value: "A" },
            { label: "区县B", value: "B" },
          ],
        },
      ],
    },
  ]
});

// 搜索事件
const onSearch = () => {
  console.log("搜索条件：", formData.value);
  // 在这里可以调用 API 获取数据
};

// 重置事件
const onReset = () => {
  formData.value = {
    projectName: "",
    startTime: "",
    endTime: "",
    projectTypeMain: "",
    projectTypeSub: "",
    province: "",
    city: "",
    district: "",
  };
  console.log("重置表单：", formData.value);
};
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
}

.form-container {
  max-width: 800px;
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