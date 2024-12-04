import Vue from 'vue'
import VueRouter from 'vue-router'
import Practice from '../views/Practice.vue'
import History from '../views/History.vue'
import WrongProblems from '../views/WrongProblems.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Practice',
    component: Practice
  },
  {
    path: '/history',
    name: 'History',
    component: History
  },
  {
    path: '/wrong-problems',
    name: 'WrongProblems',
    component: WrongProblems
  }
]

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
}) 