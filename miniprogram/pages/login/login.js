Page({
  data: {
    username: '',
    password: '',
    rememberMe: false
  },

  onLoad: function () {
    // 检查是否有保存的用户名
    const savedUsername = wx.getStorageSync('username')
    const savedPassword = wx.getStorageSync('password')
    if (savedUsername) {
      this.setData({
        username: savedUsername,
        password: savedPassword,
        rememberMe: true
      })
    }
  },

  // 用户名输入
  onUsernameInput: function (e) {
    this.setData({
      username: e.detail.value
    })
  },

  // 密码输入
  onPasswordInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 切换记住密码
  toggleRemember: function () {
    this.setData({
      rememberMe: !this.data.rememberMe
    })
  },

  // 忘记密码
  forgotPassword: function () {
    wx.showToast({
      title: '请联系物业重置密码',
      icon: 'none',
      duration: 2000
    })
  },

  // 登录
  handleLogin: async function () {
    const { username, password, rememberMe } = this.data

    // 验证
    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    // 显示加载
    wx.showLoading({ title: '登录中...' })

    try {
      const app = getApp()
      const result = await app.login(username, password)

      // 保存密码
      if (rememberMe) {
        wx.setStorageSync('username', username)
        wx.setStorageSync('password', password)
      } else {
        wx.removeStorageSync('username')
        wx.removeStorageSync('password')
      }

      wx.hideLoading()
      wx.showToast({ title: '登录成功', icon: 'success' })

      // 跳转首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1500)

    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    }
  },

  // 注册
  goToRegister: function () {
    wx.showToast({
      title: '请联系物业注册',
      icon: 'none'
    })
  }
})