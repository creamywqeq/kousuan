<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-slider" :style="sliderStyle"></div>
        <router-link to="/" class="nav-item" @click="currentIndex = 0">练习</router-link>
        <router-link to="/history" class="nav-item" @click="currentIndex = 1">历史记录</router-link>
        <router-link to="/wrong-problems" class="nav-item" @click="currentIndex = 2">错题集</router-link>
      </div>
    </nav>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentIndex: 0
    }
  },
  computed: {
    sliderStyle() {
      return {
        transform: `translateX(${this.currentIndex * 100}%)`
      }
    }
  },
  watch: {
    '$route'(to) {
      const routes = ['/', '/history', '/wrong-problems'];
      this.currentIndex = routes.indexOf(to.path);
    }
  },
  mounted() {
    const routes = ['/', '/history', '/wrong-problems'];
    this.currentIndex = routes.indexOf(this.$route.path);
  }
}
</script>

<style lang="scss">
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: #f0f2f5;
}

.main-nav {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 15px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .nav-container {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    position: relative;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 8px;
    padding: 5px;

    .nav-slider {
      position: absolute;
      width: calc(100% / 3);
      height: 100%;
      background: #4CAF50;
      border-radius: 6px;
      transition: transform 0.3s ease;
      z-index: -1;
      top: 0;
      left: 0;
    }

    .nav-item {
      flex: 1;
      color: #333;
      text-decoration: none;
      padding: 10px 20px;
      text-align: center;
      border-radius: 6px;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;

      &.router-link-active {
        color: white;
      }

      &:hover {
        transform: translateY(-1px);
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 