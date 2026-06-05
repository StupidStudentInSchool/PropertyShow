<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-card">
        <div class="card-header">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <Building2 :size="32" />
            </div>
          </div>
          <h1 class="login-title">物业透明化系统</h1>
          <p class="login-subtitle">专业的物业管理平台</p>
        </div>
        
        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">
              <User :size="16" />
              用户名
            </label>
            <input 
              v-model="username"
              type="text" 
              class="form-input" 
              placeholder="请输入用户名"
              autocomplete="username"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <Lock :size="16" />
              密码
            </label>
            <input 
              v-model="password"
              type="password" 
              class="form-input" 
              placeholder="请输入密码"
              autocomplete="current-password"
            />
          </div>
          
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <Loader2 v-if="isLoading" :size="18" class="spinner" />
            <span>{{ isLoading ? '登录中...' : '登 录' }}</span>
          </button>
        </form>
        
        <div class="login-footer">
          <p>用户名: admin | 密码: 123456</p>
        </div>
      </div>
      
      <div class="login-bg"></div>
    </div>
    
    <div class="error-toast" v-if="showError">
      <AlertCircle :size="16" />
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Building2, User, Lock, Loader2, AlertCircle } from 'lucide-vue-next'
import { authApi } from '../api'

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    showErrorToast('请输入用户名和密码')
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await authApi.login(username.value, password.value)
    
    if (response.code === 0) {
      window.location.href = '/'
    } else {
      showErrorToast(response.message || '登录失败')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    if (error.response) {
      showErrorToast(error.response.data.message || '登录失败')
    } else {
      showErrorToast('网络连接失败，请稍后重试')
    }
  } finally {
    isLoading.value = false
  }
}

const showErrorToast = (message: string) => {
  errorMessage.value = message
  showError.value = true
  setTimeout(() => {
    showError.value = false
  }, 3000)
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  overflow: hidden;
}

.login-wrapper {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 20px;
}

.login-card {
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  margin-bottom: 20px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.2s ease;
  outline: none;
}

.form-input:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #94a3b8;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.login-footer p {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.login-bg {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(60px);
}

.error-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: rgba(239, 68, 68, 0.95);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
