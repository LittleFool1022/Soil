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

    <div id="login-container">
      <el-card class="login-card">
        <template #header>
          <h1>用户登录</h1>
        </template>
        <el-form :model="loginForm" ref="loginFormRef" label-width="80px" @submit.prevent="handleLogin">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="loginForm.password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { login } from '../request.js';

export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    async handleLogin() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (valid) {
          try {
            // 调用登录接口
            const response = await login(this.loginForm.username, this.loginForm.password);

            // 登录成功处理
            if (response.data.message === '登录成功') {
              // 存储用户信息和 token
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('user', JSON.stringify({ username: this.loginForm.username }));

              // 触发 storage 事件，通知其他页面更新登录状态
              window.dispatchEvent(new Event('storage'));

              // 获取 redirect 参数
              const redirect = this.$route.query.redirect;

              if (redirect) {
                // 跳转到指定页面
                this.$router.push(redirect);
              } else {
                // 默认跳转到首页
                this.$router.push('/');
              }
            } else {
              // 登录失败提示
              this.$message.error(response.data.error || '登录失败，请检查用户名和密码');
            }
          } catch (error) {
            console.error('登录出错:', error);
            let errorMessage = '登录出错，请稍后重试';
            // 检查是否是 Axios 错误响应
            if (error.response) {
              const { status, data } = error.response;
              if (status === 400) {
                if (data.error === '用户名或密码错误') {
                  errorMessage = '用户名或密码错误，请重新输入';
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
        } else {
          this.$message.error('请填写完整的登录信息');
          return false;
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

#login-container {
  max-width: 800px;
  width: 100%; /* 移动端占满宽度 */
  margin: 300px auto; /* 调整间距 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
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
  #login-container {
    margin: 80px auto;
  }
}
</style>