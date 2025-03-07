<template>
  <div class="app-container">
    <nav class="navbar navbar-expand-lg navbar-dark bg-success">
      <div class="container-fluid"> <!-- 使用 container-fluid 适配移动端 -->
        <router-link class="navbar-brand" to="/">中国水土保持公示网</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item me-3">
              <router-link class="nav-link" to="/">返回首页</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div id="register-container">
      <el-card class="register-card">
        <template #header>
          <h1>用户注册</h1>
        </template>
        <el-form :model="registerForm" ref="registerFormRef" label-width="100px" @submit.prevent="handleRegister">
          <el-form-item label="用户名" prop="username" :rules="registerFormRules.username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" :rules="registerFormRules.password">
            <el-input type="password" v-model="registerForm.password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword" :rules="registerFormRules.confirmPassword">
            <el-input type="password" v-model="registerForm.confirmPassword" placeholder="请确认密码"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="captcha" :rules="registerFormRules.captcha">
            <div style="display: flex; align-items: center;">
              <el-input v-model="registerForm.captcha" placeholder="请输入验证码" style="flex: 1;"></el-input>
              <img :src="captchaDataUrl" @click="refreshCaptcha" alt="验证码" style="margin-left: 10px; cursor: pointer;">
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit">注册</el-button>
            <el-button @click="$router.push('/login')">返回登录</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
const { generateCaptcha } = require('./captchaUtils');
import { register, login } from '../request.js';

export default {
  data() {
    const { captchaText, captchaDataUrl } = generateCaptcha();
    return {
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        captcha: ''
      },
      registerFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '用户名只能包含英文和数字，不能包含特殊字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, message: '密码需超过6位，包含英文和数字，不包含特殊字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' },
          { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, message: '确认密码需超过6位，包含英文和数字，不包含特殊字符', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { validator: this.validateCaptcha, trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '验证码只能包含英文和数字，不能包含特殊字符', trigger: 'blur' }
        ]
      },
      captchaText,
      captchaDataUrl
    };
  },
  methods: {
    refreshCaptcha() {
      const { captchaText, captchaDataUrl } = generateCaptcha();
      this.captchaText = captchaText;
      this.captchaDataUrl = captchaDataUrl;
    },
    validateConfirmPassword(rule, value, callback) {
      if (value!== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    },
    validateCaptcha(rule, value, callback) {
      if (value.toLowerCase()!== this.captchaText.toLowerCase()) {
        callback(new Error('验证码输入错误'));
      } else {
        callback();
      }
    },
    // Register.vue（修改后的 handleRegister 方法）
    async handleRegister() {
      this.$refs.registerFormRef.validate(async (valid) => {
        this.refreshCaptcha();
        if (valid) {
          try {
            const response = await register(this.registerForm.username, this.registerForm.password);
            if (response.data.message === '注册成功') {
              // 自动登录逻辑
              const loginResponse = await login(this.registerForm.username, this.registerForm.password);
              if (loginResponse.data.message === '登录成功') {
                localStorage.setItem('token', loginResponse.data.token);
                localStorage.setItem('user', JSON.stringify({ username: this.registerForm.username }));
                this.$router.push('/');
              } else {
                this.$message.error('自动登录失败，请手动登录');
                this.$router.push('/login');
              }
            }
          } catch (error) {
            console.error('注册出错:', error);
            let errorMessage = '注册出错，请稍后重试';
            // 检查是否是 Axios 错误响应
            if (error.response) {
              const { status, data } = error.response;
              if (status === 400) {
                if (data.error === '用户名已存在') {
                  errorMessage = '用户名已存在，请修改用户名';
                } else if (data.error === '用户名和密码不能为空') {
                  errorMessage = '用户名和密码不能为空，请重新输入';
                } else {
                  errorMessage = data.error;
                }
              } else {
                errorMessage = `请求失败，状态码: ${status}`;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.$message.error(errorMessage);
          }
        }
      });
    }
  }
};
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
  background: url("/public/assets/background.webp") no-repeat center center;
  background-size: cover;
  opacity: 0.4; /* 降低透明度 60% (1 - 0.4 = 0.6) */
  z-index: -1; /* 置于最底层 */
}

#register-container {
  max-width: 800px;
  width: 100%; /* 移动端占满宽度 */
  margin: 300px auto; /* 调整间距 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-card {
  width: 90%; /* 移动端适配宽度 */
  max-width: 420px;
}

/* 新增移动端导航栏样式 */
@media (max-width: 768px) {
  .navbar-brand {
    font-size: 16px;
  }
  .navbar-toggler {
    padding: 0.25rem 0.75rem;
  }
  #register-container {
    margin: 80px auto;
  }
}
</style>