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
            <li class="nav-item">
                <router-link class="nav-link" to="/">返回首页</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="form-container">
      <h4 class="text-success text-center" style="width: 200px; margin-top: 20px; margin-bottom: 20px;margin-right: 20px;">提交成功！</h4>
      <router-link to="/" class="btn btn-success" style="width: 200px; margin-top: 20px; margin-bottom: 20px;margin-right: 20px;">返回首页</router-link>
      <router-link to="/Submit" class="btn btn-success" style="width: 200px; margin-top: 20px; margin-bottom: 20px;margin-right: 20px;">继续申报</router-link>
    </div> 
  </div>
</template>

<script>
export default {
  name: 'Success'
}
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
  display: flex;
  justify-content: center;
}

/* 新增移动端导航栏样式 */
@media (max-width: 768px) {
  .navbar-brand {
    font-size: 16px;
  }
  .navbar-toggler {
    padding: 0.25rem 0.75rem;
  }
  #app-container {
    margin: 80px auto;
  }
}
</style>
