Page({
  data: {
    community: {
      name: '阳光花园示范小区',
      address: '北京市朝阳区示范路1号',
      totalHouseholds: 480,
      totalArea: 50000
    },
    monthlySummary: {
      income: 1250000,
      expense: 980000,
      balance: 270000
    },
    announcements: [],
    pendingTasks: []
  },

  onLoad: function () {
    this.loadAnnouncements()
    this.loadPendingTasks()
  },

  // 加载公告
  loadAnnouncements: function () {
    const app = getApp()
    app.request({
      url: '/disclosure/announcements',
      data: {
        communityId: app.globalData.communityId,
        limit: 5
      }
    }).then(data => {
      this.setData({
        announcements: data.list || [
          {
            id: '1',
            title: '2026年6月财务公示已发布',
            publishedAt: '2026-06-05 09:00'
          },
          {
            id: '2',
            title: '小区电梯维保通知',
            publishedAt: '2026-06-04 14:30'
          },
          {
            id: '3',
            title: '端午节放假安排',
            publishedAt: '2026-06-01 10:00'
          }
        ]
      })
    }).catch(err => {
      console.error('加载公告失败:', err)
      // 使用模拟数据
      this.setData({
        announcements: [
          {
            id: '1',
            title: '2026年6月财务公示已发布',
            publishedAt: '2026-06-05 09:00'
          },
          {
            id: '2',
            title: '小区电梯维保通知',
            publishedAt: '2026-06-04 14:30'
          },
          {
            id: '3',
            title: '端午节放假安排',
            publishedAt: '2026-06-01 10:00'
          }
        ]
      })
    })
  },

  // 加载待办事项
  loadPendingTasks: function () {
    this.setData({
      pendingTasks: [
        {
          id: '1',
          type: 'vote',
          title: '小区绿化改造投票',
          description: '截止时间: 2026-06-15',
          status: 'active',
          statusText: '进行中'
        },
        {
          id: '2',
          type: 'inquiry',
          title: '关于物业费调整的质询',
          description: '待物业回复',
          status: 'pending',
          statusText: '待回复'
        }
      ]
    })
  },

  // 跳转页面
  goToPage: function (e) {
    const page = e.currentTarget.dataset.page
    wx.navigateTo({ url: page })
  },

  // 查看公告详情
  viewAnnouncement: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: `查看公告 ${id}`,
      icon: 'none'
    })
  },

  // 查看全部公告
  goToAnnouncement: function () {
    wx.showToast({
      title: '公告列表',
      icon: 'none'
    })
  },

  // 格式化金额
  formatAmount: function (cents) {
    if (!cents) return '0.00'
    return (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
  },

  // 格式化时间
  formatTime: function (time) {
    if (!time) return ''
    return time.replace('T', ' ').substring(0, 16)
  }
})