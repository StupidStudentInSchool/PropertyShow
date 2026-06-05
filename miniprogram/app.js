App({
  onLaunch: function () {
    console.log('物业透明化小程序启动')
    
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
    }
    
    // 设置默认小区ID
    this.globalData.communityId = '11111111-1111-1111-1111-111111111111'
  },

  onShow: function () {
    console.log('小程序显示')
  },

  onHide: function () {
    console.log('小程序隐藏')
  },

  globalData: {
    token: '',
    userInfo: null,
    communityId: '',
    baseUrl: 'http://localhost:3000/api/v1'
  },

  // 通用请求方法
  request: function (options) {
    const { url, method = 'GET', data = {}, header = {} } = options
    
    return new Promise((resolve, reject) => {
      // 添加 token
      if (this.globalData.token) {
        header['Authorization'] = `Bearer ${this.globalData.token}`
      }
      
      wx.request({
        url: `${this.globalData.baseUrl}${url}`,
        method: method.toUpperCase(),
        data: data,
        header: {
          'Content-Type': 'application/json',
          ...header
        },
        success: function (res) {
          if (res.statusCode === 200) {
            if (res.data.code === 0) {
              resolve(res.data.data)
            } else {
              reject(new Error(res.data.message || '请求失败'))
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
  },

  // 登录
  login: async function (username, password) {
    try {
      const data = await this.request({
        url: '/auth/login',
        method: 'POST',
        data: { username, password }
      })
      
      if (data.token) {
        this.globalData.token = data.token
        this.globalData.userInfo = data.user
        wx.setStorageSync('token', data.token)
        wx.setStorageSync('userInfo', data.user)
      }
      
      return data
    } catch (err) {
      throw err
    }
  },

  // 退出登录
  logout: function () {
    this.globalData.token = ''
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  }
})