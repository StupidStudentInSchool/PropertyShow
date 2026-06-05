<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

router.beforeEach((to, _from, next) => {
  const isLoggedIn = localStorage.getItem('token')
  const publicPages = ['/login', '/disclosure']

  // 检查是否是公开页面（公开公示页面或登录页面）
  const isPublicPage = publicPages.some(page => to.path.startsWith(page))

  if (!isPublicPage && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})
</script>

<template>
  <router-view />
</template>