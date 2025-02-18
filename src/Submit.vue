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

    <div class="form-container">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="submit-container">
        <!-- 项目类型 -->
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="form.projectType" placeholder="请选择项目类型" @change="handleProjectTypeChange">
            <el-option
              v-for="item in projectTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 项目基本信息 -->
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目全称" />
        </el-form-item>

        <el-form-item label="建设单位" prop="constructionUnit">
          <el-input v-model="form.constructionUnit" placeholder="请输入建设单位全称" />
        </el-form-item>

        <el-form-item label="编制单位" prop="compilationUnit">
          <el-input v-model="form.compilationUnit" placeholder="请输入编制单位全称" />
        </el-form-item>

        <!-- 行政区划级联选择 -->
        <el-form-item label="项目所在地" prop="areaCode">
          <el-cascader
            v-if="areaOptions.length > 0"
            v-model="form.areaCode"
            :options="areaOptions"
            :props="areaProps"
            placeholder="请选择省/市/区"
            :emitPath="true"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 日期范围 -->
        <el-form-item label="起止日期">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <!-- 项目描述 -->
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="10"
            placeholder="请输入项目详细描述"
          />
        </el-form-item>

        <!-- 文件上传 -->
        <el-form-item label="项目附件" prop="file">
          <el-upload
            name="file"
            :data="{ type: 'project' }"
            multiple
            :limit="5"
            :file-list="form.files"
            :before-upload="beforeUpload"
            :on-remove="handleFileRemove"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :action="uploadUrl"
            :headers="headers"
            :auto-upload="true"
            :with-credentials="true"
          >
            <el-button size="small" type="success">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                仅支持PDF文件，单个文件不超过20MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 修改按钮代码 -->
        <el-form-item>
          <el-button 
            type="success" 
            :loading="submitting"
            @click="submitForm"
          >
            确认提交
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { regionData, CodeToText } from 'element-china-area-data'
import { submitProject, deleteFile } from './request' // 导入封装好的接口

export default {
  data() {
    return {
      submitting: false,
      //uploadUrl: (process.env.VUE_APP_API || 'http://localhost:3000') + '/api/uploads',
      uploadUrl: (process.env.VUE_APP_API || 'https://zgstbc.com') + '/api/uploads',
      headers: { Authorization: `Bearer ${localStorage.token}` },
      
      // 项目类型选项（示例数据，请根据实际需求调整）
      projectTypes: [
        { value: 'B', label: '验收公示' },
        { value: 'C', label: '立项公示' },
        { value: 'D', label: '审批公示' },
        { value: 'E', label: '其他公示' }
      ],
      
      // 行政区划配置
      areaOptions: regionData,
      areaProps: {
        value: 'value',
        label: 'label',
        children: 'children',
        emitPath: true,       // 确保返回完整路径
        checkStrictly: false   // 允许不完整选择（调试用）
      },
      
      // 表单数据
      form: {
        projectType: '',
        projectName: '',
        constructionUnit: '',
        compilationUnit: '',
        areaCode: [], // 存储省市区代码数组 [省code, 市code, 区code]
        dateRange: [],
        description: '',
        files: []
      },
      
      // 验证规则
      rules: {
        projectType: [
          { required: true, message: '请选择项目类型', trigger: 'change' }
        ],
        projectName: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
          { max: 255, message: '长度不超过255字符', trigger: 'blur' }
        ],
        constructionUnit: [
          { required: true, message: '请输入建设单位', trigger: 'blur' }
        ],
        compilationUnit: [
          { required: true, message: '请输入编制单位', trigger: 'blur' }
        ],
        areaCode: [
          { 
            type: 'array', 
            required: true,
            validator: (rule, value, callback) => {
              if (!value || value.length !== 3) {
                callback(new Error('请选择完整的省/市/区'))
              } else if (value.some(item => !item)) {
                callback(new Error('存在无效的行政区划选择'))
              } else {
                callback()
              }
            },
            trigger: 'change' 
          }
        ],
        dateRange: [
          { 
            type: 'array', 
            required: true, 
            validator: (rule, value, cb) => {
              if (!value || value.length !== 2) return cb(new Error('请选择日期范围'));
              const start = value[0] instanceof Date? value[0].getTime() : new Date(value[0]).getTime();
              const end = value[1] instanceof Date? value[1].getTime() : new Date(value[1]).getTime();
              if (isNaN(start) || isNaN(end)) {
                return cb(new Error('请输入有效的日期'));
              }
              if (start > end) {
                return cb(new Error('结束日期不能早于开始日期'));
              }
              cb();
            }
          }
        ],
        description: [
          { required: true, message: '请输入项目描述', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {

    handleProjectTypeChange(value) {
      if (value === 'B') {
        this.$message({
          message: '验收相关报告如验收鉴定书、验收报告、监测总结、监理总结等',
          type: 'info'
        });
      } else if (value === 'C') {
        this.$message({
          message: '监测相关报告如监测季报、年报、实施方案、三色评价等',
          type: 'info'
        });
      } else if (value === 'D') {
        this.$message({
          message: '水土保持方案报告表、水土保持方案报告书使用方案公示等',
          type: 'info'
        });
      } else if (value === 'E') {
        this.$message({
          message: '非水保报告使用其他公示，如环评，排水等',
          type: 'info'
        });
      }
    },

    // 完善文件上传处理
    handleUploadError(error) {
      let message = '文件上传失败';
      if (error.message.includes('Network Error')) {
        message = '网络连接异常，请检查服务器状态';
      } else if (error.status === 413) {
        message = '文件大小超过20MB限制';
      }
      this.$message.error(message);
    },

    handleUploadSuccess(response, file, fileList) {
      const index = fileList.findIndex(f => f.uid === file.uid);
      if (index!== -1) {
        fileList[index].url = response.data.url;
        this.form.files = [...fileList]; // 确保 Vue 能检测到数组的变化
      }
      this.$message.success('文件上传成功');
    },

    // 在data的upload配置中增加：
    beforeUpload(file) {
      const isPDF = file.type === 'application/pdf'
      const isLt20M = file.size / 1024 / 1024 < 20

      if (!isPDF) {
        this.$message.error('只能上传PDF文件')
        return false
      }
      if (!isLt20M) {
        this.$message.error('文件大小不能超过20MB')
        return false
      }
      return true
    },

    handleFileRemove(file) {
      if (!file.url) {
        this.$message.error('文件 URL 无效，无法删除');
        return;
      }
      deleteFile(file.url)
        .then(() => {
          this.$message.success('文件删除成功');
          // 从文件列表中移除已删除的文件
          if (Array.isArray(this.form.files)) {
            this.form.files = this.form.files.filter(f => f.url!== file.url);
          } else {
            console.error('this.form.files 不是一个数组');
          }
        })
        .catch(error => {
          console.log('删除文件请求出错:', error);
          this.$message.error('文件删除失败：' + (error || '未知错误'));
        });
    },

    async submitForm() {
      try {
        await this.$refs.form.validate()
        this.submitting = true

        // 处理行政区划数据
        const [province, city, area] = this.form.areaCode

        // 日期格式化函数
        const formatDate = (date) => {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        // 构建符合后端要求的提交数据
        const submitData = {
          projectType: this.form.projectType,
          projectName: this.form.projectName,
          constructionUnit: this.form.constructionUnit,
          compilationUnit: this.form.compilationUnit,
          province: province.toString(), // 确保转换为字符串
          city: city.toString(),
          area: area.toString(),
          startDate: formatDate(this.form.dateRange[0]),
          endDate: formatDate(this.form.dateRange[1]),
          description: this.form.description,
          pdfUrls: JSON.stringify(this.form.files.filter(f => f.url).map(f => ({
            name: f.name,
            url: f.url
          })))
        }

        const result = await submitProject(submitData)
        this.$message.success('提交成功')
        this.$router.push(`/Success`)
      } catch (error) {
        // 增强错误处理
        let message = '提交失败'
        if (error.response) {
          message = error.response.data.error || message
        } else if (error.request) {
          message = '网络连接异常，请检查网络后重试'
        }
        this.$message.error(message)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.submit-container {
  max-width: 800px;
  margin: 20px auto;
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
  background: url('/public/assets/background.webp') no-repeat center center;
  background-size: cover;
  opacity: 0.4; /* 降低透明度 60% (1 - 0.4 = 0.6) */
  z-index: -1; /* 置于最底层 */
}

/* 使用深度选择器覆盖element样式 */
:deep(.submit-container .el-form-item:last-child .el-form-item__content) {
  display: flex;
  justify-content: center;
  margin-left: 0 !important; /* 清除element默认的左侧margin */
}

:deep(.submit-container .el-form-item:last-child button) {
  width: 200px;
  height: 40px;
  font-size: 16px;
  letter-spacing: 2px; /* 可选：增加文字间距 */
  transition: all 0.3s; /* 可选：添加过渡效果 */
}

/* 鼠标悬停效果 */
:deep(.submit-container .el-form-item:last-child button:hover) {
  transform: scale(1.05);
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.3);
}

/* 确保级联选择器文本可见 */
.el-cascader__label {
  color: #606266 !important;
}

/* 优化移动端显示 */
@media (max-width: 768px) {
  .submit-container {
    padding: 0 15px;
  }
  .el-form-item__label {
    white-space: normal;
  }
}
</style>