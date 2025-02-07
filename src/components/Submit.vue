<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container">
        <router-link class="navbar-brand" to="/">水土保持公示网</router-link>
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
      <h5 class="text-center mb-4">项目填报</h5>
      <form @submit.prevent="handleSubmit">
        <!-- 公示类型 -->
        <div class="mb-3 d-flex align-items-center">
          <label class="form-label required me-2">公示类型</label>
          <!-- 使用 :class 指令根据 isClicked 状态添加或移除 clicked 类 -->
          <div ref="selectWrapper" class="custom-select" :class="{ clicked: isClicked }">
            <select
              class="form-control"
              v-model="form.publicityType"
              required
              @click="toggleArrow"
            >
              <option value="">公示类型</option>
              <option value="type1">验收公示</option>
              <option value="type2">监测公示</option>
              <option value="type3">方案公示</option>
              <option value="type4">其他公示</option>
            </select>
          </div>
          <!-- 悬停提示区域 -->
          <div
            v-if="showTooltipContent"
            class="tooltip"
            :style="tooltipStyle"
          >
            验收相关报告使用验收公示，如验收鉴定书、验收报告、监测总结、监理总结
          </div>
        </div>
        
        <!-- 项目名称 -->
        <div class="mb-3">
          <label class="form-label required">项目</label>
          <input type="text" class="form-control" v-model="form.projectName" required>
        </div>
        
        <!-- 项目类型 -->
        <div class="mb-3">
          <label class="form-label required">项目类型</label>
          <select class="form-control" v-model="form.projectCategory" required>
            <option value="">请选择项目类型</option>
            <option value="category1">分类1</option>
            <option value="category2">分类2</option>
          </select>
        </div>
        
        <!-- 建设单位 -->
        <div class="mb-3">
          <label class="form-label required">建设单位</label>
          <input type="text" class="form-control" v-model="form.constructionUnit" required>
        </div>
        
        <!-- 监测单位 -->
        <div class="mb-3">
          <label class="form-label required">监测单位</label>
          <input type="text" class="form-control" v-model="form.monitoringUnit" required>
        </div>
        
        <!-- 地理位置 -->
        <div class="mb-3">
          <label class="form-label required">地理位置</label>
          <div class="d-flex gap-2">
            <select class="form-control" v-model="form.location.province" required>
              <option value="">选择省</option>
            </select>
            <select class="form-control" v-model="form.location.city" required>
              <option value="">选择市</option>
            </select>
            <select class="form-control" v-model="form.location.district" required>
              <option value="">选择区</option>
            </select>
          </div>
        </div>
        
        <!-- 开始日期 -->
        <div class="mb-3">
          <label class="form-label required">开始日期</label>
          <input type="date" class="form-control" v-model="form.startDate" required>
        </div>
        
        <!-- 结束日期 -->
        <div class="mb-3">
          <label class="form-label required">结束日期</label>
          <input type="date" class="form-control" v-model="form.endDate" required>
        </div>
        
        <!-- 说明 -->
        <div class="mb-3">
          <label class="form-label">说明</label>
          <textarea class="form-control" v-model="form.description"></textarea>
        </div>
        
        <!-- 上传附件 -->
        <div class="mb-3">
          <label class="form-label required">上传附件</label>
          <input type="file" class="form-control" @change="handleFileChange" multiple>
        </div>
        
        <button type="submit" class="btn btn-primary w-100">确认提交</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Submit',
  data() {
    return {
      form: {
        publicityType: '',
        projectName: '',
        projectCategory: '',
        constructionUnit: '',
        monitoringUnit: '',
        location: { province: '', city: '', district: '' },
        startDate: '',
        endDate: '',
        description: '',
        attachments: []
      },
      showTooltipContent: false, // 控制提示区域显示
      tooltipTimer: null, // 用于延迟隐藏提示区域
      isClicked: false // 记录是否被点击
    };
  },
  mounted() {
    // 在页面挂载完成后，监听点击事件
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    // 在组件销毁前，移除点击事件监听器，避免内存泄漏
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    toggleArrow() {
      this.isClicked = !this.isClicked; // 切换点击状态
    },
    showTooltip(value) {
      if (value === 'type1') {
        this.showTooltipContent = true; // 显示提示区域
        this.tooltipTimer = setTimeout(() => {
          this.showTooltipContent = false; // 3秒后隐藏提示区域
        }, 3000);
      }
    },
    hideTooltip() {
      clearTimeout(this.tooltipTimer); // 清除定时器
      this.showTooltipContent = false; // 隐藏提示区域
    },
    handleFileChange(event) {
      this.form.attachments = [...event.target.files];
    },
    handleSubmit() {
      console.log('表单提交:', this.form);
      alert('提交成功！');
    },
    handleOutsideClick(event) {
      // 判断点击的元素是否在下拉选择框内部
      if (this.$refs.selectWrapper && !this.$refs.selectWrapper.contains(event.target)) {
        this.isClicked = false;
      }
    }
  }
};
</script>

<style scoped> 
.form-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}
.required::after {
  content: "*";
  color: red;
  margin-left: 3px;
}
.custom-select {
  position: relative;
  width: 120px; /* 设置下拉框宽度 */
}
.custom-select select {
  appearance: none; /* 去掉默认样式 */
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 30px 8px 10px; /* 增加右侧空间 */
  width: 100%;
  cursor: pointer;
}
.custom-select::after {
  content: '▼'; /* 下箭头 */
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
}
.custom-select.clicked::after {
  content: '▲'; /* 上箭头 */
}
.tooltip {
  position: fixed; /* 固定定位，确保在最上层 */
  top: 50%; /* 垂直居中 */
  left: 50%; /* 水平居中 */
  transform: translate(-50%, -50%); /* 调整位置 */
  background-color: #000; /* 黑底 */
  color: #fff; /* 白字 */
  padding: 10px 20px; /* 内边距 */
  border-radius: 5px; /* 圆角 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 阴影 */
  z-index: 1000; /* 确保在最上层 */
  text-align: center; /* 文本居中 */
  max-width: 300px; /* 最大宽度 */
  word-wrap: break-word; /* 长文本换行 */
  white-space: normal; /* 允许换行 */
  overflow: hidden; /* 防止内容溢出 */
}
</style>
