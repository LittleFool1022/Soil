<template>
  <div>
    <!-- 导航栏 -->
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
    
    <div class="container mt-4">
      <h2 class="text-success">公告详情</h2>
      <div class="card mt-3">
        <div class="card-body">
          <h5 class="card-title">{{ detail.title || '公告详情' }}</h5>
          <p class="card-text">{{ detail.date || '日期未定' }}</p>
          <p class="card-text">
            {{ detail.content || '这里是公告的详细内容。' }}
          </p>
          <a :href="detail.pdfUrl || 'assets/images/announcement.pdf'" class="btn btn-success" target="_blank">下载PDF</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Detail',
  props: ['id'],
  data() {
    return {
      detail: {}
    }
  },
  mounted() {
    // 根据路由参数 id，简单使用静态数据示例
    if (this.id === '1') {
      this.detail = {
        title: '2024年XX项目水土保持方案公示',
        date: '2024年3月10日',
        content: '这里是公告的详细内容。',
        pdfUrl: 'assets/images/announcement.pdf'
      }
    } else if (this.id === '2') {
      this.detail = {
        title: '2023年度水土保持验收结果公告',
        date: '2023年12月31日',
        content: '这里是公告的详细内容。',
        pdfUrl: 'assets/images/announcement.pdf'
      }
    } else {
      this.detail = {
        title: '公告详情',
        date: '',
        content: '未找到公告详情。',
        pdfUrl: '#'
      }
    }
  }
}
</script>

<style scoped>
/* 如有需要可添加详情页样式 */
</style>
