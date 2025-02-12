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
        <button @click="submitForm">提交项目</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // Import axios

const formData = ref({});
const showReminder = ref(false);
const reminderText = ref('');

const baseUrl = 'https://cli.avuejs.com/api/area';
// 修改附件上传 action 为上传接口
const uploadAction = 'http://localhost:3000/api/upload';
// 项目提交接口
const submitAction  = 'http://localhost:3000/api/projects';

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
        name: 'name',    // 与后端 multer.single('file') 中的字段名对应
        url: 'url',      // 返回数据中 url 字段值
        res: 'data'      // 上传接口返回的数据在 data 中
      },
      action: uploadAction,
      rules: [{ required: true, message: '附件不为空', trigger: 'blur' }]
    }
  ]
});

// 提交表单方法
const submitForm = async () => {
  // 使用 FormData 用于 multipart/form-data 格式提交数据和文件
  const form = new FormData();

  // 处理常规字段
  // 将表单中除附件上传外的字段加入 FormData
  for (const key in formData.value) {
    if (key !== 'pdfUrl' && key !== 'datetimerange') {
      form.append(key, formData.value[key]);
    }
  }
  // 将 datetimerange 数组转换为 start_time 和 end_time 字段
  if (formData.value.datetimerange && formData.value.datetimerange.length === 2) {
    form.append('start_time', formData.value.datetimerange[0]);
    form.append('end_time', formData.value.datetimerange[1]);
  }
  // 将附件上传的文件添加到 FormData 中（字段名为 files，与后端 multer 配置一致）
  if (formData.value.pdfUrl && formData.value.pdfUrl.length > 0) {
      formData.value.pdfUrl.forEach(fileObj => {
          form.append('files', fileObj.raw);
      });
  }

  try {
      const response = await axios.post(submitAction, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.id) {
          alert('项目提交成功！');
          // 假设 avue - form 有重置验证的方法，这里根据实际情况调用
          const uploadedFiles = response.data.files || [];
          formData.value.pdfUrl = formData.value.pdfUrl.concat(uploadedFiles.map(file => ({
              // 根据实际情况调整对象结构
              name: file.name,
              url: file.url
        })));
      }
  } catch (error) {
      if (error.response) {
          const status = error.response.status;
          if (status === 400) {
              alert('请求参数错误，请检查输入！');
          } else if (status === 500) {
              alert('服务器内部错误，请稍后再试！');
          } else {
              alert('提交失败，状态码：' + status);
          }
      } else {
          console.error('提交失败:', error);
          alert('项目提交失败，请检查网络连接！');
      }
  }
};

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

/* 可以根据实际情况调整样式 */
.avue-form .avue-upload-list {
    display: block;
}

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