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
            <li class="nav-item"><a class="nav-link" href="#home">首页</a></li>
            <li class="nav-item"><a class="nav-link" href="#news">公示公告</a></li>
            <li class="nav-item"><a class="nav-link" href="#laws">政策法规</a></li>
            <li class="nav-item"><a class="nav-link" href="#contact">联系我们</a></li>
          </ul>
        </div>
      </div>
    </nav>
    
    <!-- 轮播图 -->
    <div id="carousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        <div class="carousel-item active">
          <img src="assets/images/banner1.jpg" class="d-block w-100" alt="水土保持宣传图">
        </div>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="container mt-4">
      <section id="announcement" class="mt-5">
        <h2 class="text-success">公示申请</h2>
        <router-link to="/submit" class="btn btn-success">我要公示</router-link>
      </section>
      
      <section id="news" class="mb-5">
        <h2 class="text-success">最新公示公告</h2>
        <!-- 用于动态加载 Supabase 公告 -->
        <div id="supabase-announcement-list" class="row">
          <div v-if="loading" class="text-center">加载中...</div>
          <div v-else-if="error" class="text-danger">加载公告失败</div>
          <div v-else>
            <div v-for="(group, project) in announcementGroups" :key="project" class="col-md-4 mb-3">
              <div class="card h-100">
                <div class="card-header bg-success text-white">
                  {{ project }}
                </div>
                <ul class="list-group list-group-flush">
                  <li v-for="item in group" :key="item.id" class="list-group-item">
                    <p class="mb-1">{{ item.date || '' }}</p>
                    <router-link :to="`/detail/${item.id}`" class="btn btn-primary btn-sm">查看详情</router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <!-- 保留原有静态公告展示 -->
        <div class="list-group mt-4">
          <router-link to="/detail/1" class="list-group-item">
            <h5 class="mb-1">2024年XX项目水土保持方案公示</h5>
          </router-link>
          <router-link to="/detail/2" class="list-group-item">
            <h5 class="mb-1">2023年度水土保持验收结果公告</h5>
          </router-link>
          <!-- 更多公告 -->
        </div>
      </section>
      
      <section id="laws" class="mt-5">
        <h2 class="text-success">政策法规</h2>
        <div class="row">
          <div class="col-md-5">
            <div class="card">
              <h5 class="card-title">
                《中华人民共和国水土保持法》
                <a href="assets/docs/water_soil_law.pdf" class="btn btn-success">下载PDF</a>
              </h5>
            </div>
          </div>
        </div>
      </section>
      
      <section id="contact" class="mt-5 mb-5">
        <h2 class="text-success">联系我们</h2>
        <p>电话：+86-17710211481</p>
        <p>邮箱：kuilei1022@gmail.com</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      announcementGroups: {},
      loading: false,
      error: null
    }
  },
  mounted() {
    this.fetchAllAnnouncements();
  },
  methods: {
    async fetchAllAnnouncements() {
      this.loading = true;
      const url = `https://zsmwcrgsaamslzuvscug.supabase.co/rest/v1/soil_list?select=*&order=date.desc`;
      try {
        const response = await fetch(url, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzbXdjcmdzYWFtc2x6dXZzY3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc0MDU5OSwiZXhwIjoyMDU0MzE2NTk5fQ.IxNArEl8cJg4HMNZeHYMirzfXaQeDuvLuYLjX5b4GQA',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzbXdjcmdzYWFtc2x6dXZzY3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc0MDU5OSwiZXhwIjoyMDU0MzE2NTk5fQ.IxNArEl8cJg4HMNZeHYMirzfXaQeDuvLuYLjX5b4GQA'
          }
        });
        if (!response.ok) {
          throw new Error('网络响应错误: ' + response.statusText);
        }
        const data = await response.json();
        // 按项目名称分组
        const groups = {};
        data.forEach(item => {
          const key = item.project_name || '未命名项目';
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(item);
        });
        this.announcementGroups = groups;
      } catch (error) {
        console.error('获取公告失败:', error);
        this.error = error;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
/* 根据需要添加或覆盖局部样式 */
</style>
