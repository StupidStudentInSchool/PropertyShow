<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

router.beforeEach((to, _from, next) => {
  const isLoggedIn = localStorage.getItem('token')
  if (to.path !== '/login' && !isLoggedIn) {
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