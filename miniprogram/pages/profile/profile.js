Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    community: {
      name: '阳光花园示范小区',
      address: '北京市朝阳区示范路1号',
      contactPhone: '010-12345678'
    },
    pendingBills: 2,
    pendingInquiries: 1
  },

  onLoad: function () {
    this.checkLoginStatus()
  },

  onShow: function () {
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const app = getApp()
    if (app.globalData.token) {
      this.setData({
        isLoggedIn: true,
        userInfo: app.globalData.userInfo || {
          name: '张业主',
          roleName: '业主'
        }
      })
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {}
      })
    }
  },

  // 跳转登录
  goToLogin: function () {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  // 退出登录
  handleLogout: function () {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.logout()
          this.setData({
            isLoggedIn: false,
            userInfo: {}
          })
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      }
    })
  },

  // 跳转页面
  goToPage: function (e) {
    const page = e.currentTarget.dataset.page
    if (this.data.isLoggedIn) {
      wx.navigateTo({ url: page })
    } else {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        wx.navigateTo({ url: '/pages/login/login' })
      }, 1500)
    }
  },

  // 查看小区详情
  goToCommunity: function () {
    wx.showToast({ title: '小区详情', icon: 'none' })
  },

  // 我的投票
  goToMyVotes: function () {
    if (this.data.isLoggedIn) {
      wx.showToast({ title: '我的投票', icon: 'none' })
    } else {
      wx.showToast({ title: '请先登录', icon: 'none' })
    }
  },

  // 设置
  goToSettings: function () {
    wx.showToast({ title: '设置', icon: 'none' })
  },

  // 拨打电话
  makeCall: function () {
    const phone = this.data.community.contactPhone || '010-12345678'
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({ title: '拨打电话失败', icon: 'none' })
      }
    })
  },

  // 意见反馈
  goToFeedback: function () {
    wx.showToast({ title: '意见反馈', icon: 'none' })
  }
})