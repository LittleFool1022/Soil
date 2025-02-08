<template>
  <div class="app-container">
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

    <div class="container">
      <div class="form-container">
        <h6 class="text-center mb-3">项目填报</h6>
        <avue-form :option="formOption" v-model="formData" @change="handleFormChange"></avue-form>
        <!-- 显示提示信息 -->
        <div v-if="showReminder" class="reminder">
          {{ reminderText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const formData = ref({});
const showReminder = ref(false);
const reminderText = ref('');
const baseUrl = 'https://cli.avuejs.com/api/area';
const action = 'https://api.avuejs.com/imgupload';

const form = ref({
  province: '110000',
  city: '110100',
  area: '110101',
  imgUrl: []
});

const formOption = ref({
  labelWidth: '100px', // 让表单标签宽度一致
  gutter: 20, // 控制列之间的间距
  column: [
    {
      label: '公示类型',
      prop: 'projectType',
      type: 'select',
      dicData: [
        { label: '默认公示' },
        { label: '验收公示', value: 'B' },
        { label: '检测公示', value: 'C' },
        { label: '方案公示', value: 'D' },
        { label: '其他公示', value: 'E' }
      ],
      placeholder: '请选择项目类型',
      rules: [{ required: true, message: '请选择项目类型', trigger: 'change' }]
    },
    {
      label: '项目名称',
      prop: 'projectName',
      type: 'input',
      span: 24, // 独占一整行
      placeholder: '请输入项目名称',
      rules: [{ required: true, message: '项目名称不为空', trigger: 'blur' }]
    },
    {
      label: '建筑单位',
      prop: 'constructionUnit',
      type: 'input',
      placeholder: '请输入建筑单位',
      rules: [{ required: true, message: '建筑单位不为空', trigger: 'blur' }]
    },
    {
      label: '编制单位',
      prop: 'CompilationUnit',
      type: 'input',
      
      rules: [{ required: true, message: '编制单位不为空，验收报告和水保方案填各自编制单位', trigger: 'blur' }]
    },
    {
      label: '地理位置',
      prop: 'province',
      type: 'select',
      span: 10,
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
      span: 7,
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
      span: 7,
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
    },
    {
      label: "起止时间",
      type: 'datetimerange',
      prop: 'datetimerange',
      span: 24,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      startPlaceholder: '开始时间',
      endPlaceholder: '结束时间',
      rules: [{ required: true, message: '起止时间不为空', trigger: 'blur' }]
    },
    {
      label: '项目说明',
      prop: 'description',
      type: 'textarea',
      span: 24, // 独占一整行
      placeholder: '请输入项目描述',
      rules: [{ required: true, message: '项目描述不为空', trigger: 'blur' }]
    },
    {
      label: '附件上传',
      prop: 'pdfUrl',
      type: 'upload',
      multiple: true,
      fileSize: 20000,
      span: 24,
      propsHttp: {
        url: 'url',
        name: 'name',
        res: 'data'
      },
      action,
      rules: [{ required: true, message: '附件不为空', trigger: 'blur' }]
    }
  ]
});

// 处理表单变化事件
const handleFormChange = (value, form) => {
  switch (value.projectType) {
    case 'B':
      reminderText.value = '注：如验收鉴定书、验收报告、监测总结、监理总结等';
      showReminder.value = true;
      break;
    case 'C':
      reminderText.value = '注：如监测季报、年报、实施方案、三色评价等';
      showReminder.value = true;
      break;
    case 'D':
      reminderText.value = '注：水土保持方案报告表、报告书、使用方案等';
      showReminder.value = true;
      break;
    case 'E':
      reminderText.value = '注：非水保报告使用其他公示，如环评，排水等';
      showReminder.value = true;
      break;
    default:
      showReminder.value = false;
      reminderText.value = '';
  }
};

// 点击其他区域取消提示
const handleOutsideClick = (event) => {
  const formElement = document.querySelector('.form-container');
  if (formElement &&!formElement.contains(event.target)) {
    showReminder.value = false;
    reminderText.value = '';
  }
};

onMounted(() => {
  window.addEventListener('click', handleOutsideClick);
});
</script>

<style scoped>

.app-container {
  position: relative;
  min-height: 100vh;
}

.app-container::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 400px; /* 限制背景高度为上栏 */
  background: url('/public/assets/background.webp') no-repeat center center;
  background-size: cover;
  opacity: 0.4; /* 降低透明度 60% (1 - 0.4 = 0.6) */
  z-index: -1; /* 置于最底层 */
}


.form-container {
  max-width: 800px;
  margin: 300px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.reminder {
  color: red;
  margin-top: 5px;
  /* 确保提示信息清晰可见 */
  font-size: 14px;
}
</style>