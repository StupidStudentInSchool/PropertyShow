import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin.vue')
    },
    {
      path: '/disclosure/:communityId?',
      name: 'public-disclosure',
      component: () => import('@/views/PublicDisclosure.vue')
    },
    {
      path: '/',
      name: 'layout',
      component: () => import('@/layout/Layout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: '/ledger',
          name: 'ledger',
          component: () => import('@/views/Ledger.vue')
        },
        {
          path: '/vote',
          name: 'vote',
          component: () => import('@/views/Vote.vue')
        },
        {
          path: '/inquiry',
          name: 'inquiry',
          component: () => import('@/views/Inquiry.vue')
        },
        {
          path: '/community',
          name: 'community',
          component: () => import('@/views/Community.vue')
        },
        {
          path: '/bill',
          name: 'bill',
          component: () => import('@/views/Bill.vue')
        },
        {
          path: '/audit',
          name: 'audit',
          component: () => import('@/views/Audit.vue')
        }
      ]
    }
  ]
})

export default router
