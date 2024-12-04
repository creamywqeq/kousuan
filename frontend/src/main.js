import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// 配置 axios
axios.defaults.baseURL = 'http://localhost:8083'
axios.defaults.withCredentials = true
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 添加请求拦截器
axios.interceptors.request.use(config => {
  console.log('Sending request:', config.method, config.url, config.data);
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(response => {
  console.log('Received response:', response.status, response.data);
  return response;
}, error => {
  console.error('Response error:', error);
  if (error.response) {
    console.error('Error response:', error.response.data);
  }
  return Promise.reject(error);
});

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app') 