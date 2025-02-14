<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="submit-container">
    <!-- 项目类型 -->
    <el-form-item label="项目类型" prop="projectType">
      <el-select v-model="form.projectType" placeholder="请选择项目类型">
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
    <el-form-item label="起止日期" prop="dateRange">
      <el-date-picker
        v-model="form.dateRange"
        type="daterange"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
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
    <el-form-item label="项目附件" prop="files">
      <el-upload
        name="file"
        :data="{ type: 'project' }"
        multiple
        :limit="5"
        :file-list="form.files"
        :before-upload="beforeUpload"
        :on-remove="handleFileRemove"
        :on-success="handleUploadSuccess"
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
        type="primary" 
        :loading="submitting"
        @click="submitForm"
      >
        提交项目
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { regionData, CodeToText } from 'element-china-area-data'
import request from '@/request' // 替换原本的$http

export default {
  data() {

    return {
      submitting: false,
      uploadUrl: (process.env.VUE_APP_API || 'http://localhost:3000') + '/api/upload',
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
              if (!value || value.length !== 2) return cb(new Error('请选择日期范围'))
              if (new Date(value[0]) > new Date(value[1])) {
                return cb(new Error('结束日期不能早于开始日期'))
              }
              cb()
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
    //完善文件上传处理
    handleUploadSuccess(res, file) {
      this.form.files.push({
        name: res.data.name,
        url: res.data.url
      })
    },

    // 在data的upload配置中增加：
    beforeUpload(file) {
      const isPDF = file.type === 'application/pdf'
      const isLt10M = file.size / 1024 / 1024 < 20

      if (!isPDF) {
        this.$message.error('只能上传PDF文件')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过20MB')
        return false
      }
      return true
    },

    async submitForm() {
      try {
        await this.$refs.form.validate()
        this.submitting = true

        // 处理行政区划数据
        const [province, city, area] = this.form.areaCode

        // 构建符合后端要求的提交数据
        const submitData = {
          projectType: this.form.projectType,
          projectName: this.form.projectName,
          constructionUnit: this.form.constructionUnit,
          compilationUnit: this.form.compilationUnit,
          province,
          city,
          area,
          startDate: this.form.dateRange[0],
          endDate: this.form.dateRange[1],
          description: this.form.description,
          pdfUrls: JSON.stringify(this.form.files.map(f => ({
            name: f.name,
            url: f.url
          })))
        }

        const { data } = await request.post('/api/projects', submitData)
        this.$message.success('提交成功')
        this.$router.push(`/detail/${data.id}`)
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
    },
    handleFileRemove(file) {
      this.$http.delete(`/api/files?url=${encodeURIComponent(file.url)}`)
    }
  }
}
</script>

<style scoped>
.submit-container {
  max-width: 800px;
  margin: 200px auto;
}

/* 使用深度选择器覆盖element样式 */
.submit-container >>> .el-form-item:last-child .el-form-item__content {
  display: flex;
  justify-content: center;
  margin-left: 0 !important; /* 清除element默认的左侧margin */
}

.submit-container >>> .el-form-item:last-child button {
  width: 200px;
  height: 40px;
  font-size: 16px;
  letter-spacing: 2px; /* 可选：增加文字间距 */
  transition: all 0.3s; /* 可选：添加过渡效果 */
}

/* 鼠标悬停效果 */
.submit-container >>> .el-form-item:last-child button:hover {
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
