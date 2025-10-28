import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/editor'
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('@/views/Editor.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallback.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/share/:id',
    name: 'Share',
    component: () => import('@/views/Share.vue'),
    meta: {
      requiresAuth: false
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 这里可以添加认证逻辑
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      // 未认证用户重定向到首页
      next({
        path: '/',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router