Page({
  data: {
    myInquiries: [],
    allInquiries: []
  },

  onLoad: function () {
    this.loadInquiries()
  },

  // 加载质询列表
  loadInquiries: function () {
    const app = getApp()
    app.request({
      url: '/governance/inquiries',
      data: {
        communityId: app.globalData.communityId
      }
    }).then(data => {
      this.setData({
        myInquiries: data.my || [],
        allInquiries: data.all || []
      })
    }).catch(err => {
      console.error('加载质询失败:', err)
      // 使用模拟数据
      this.setData({
        myInquiries: [
          {
            id: '1',
            title: '关于6月份物业费明细的质询',
            content: '我想了解6月份物业费的具体支出明细，特别是安保服务和设备维保的费用。',
            status: 'REPLIED',
            statusText: '已回复',
            createdAt: '2026-06-03 10:30',
            repliedAt: '2026-06-04 14:20',
            replyContent: '您好，6月份安保服务费用为18万元，设备维保费用为13万元，具体明细已公示在财务公示页面。',
            daysPending: 0
          },
          {
            id: '2',
            title: '关于小区电梯维保的质询',
            content: '请问电梯维保的具体时间安排是怎样的？',
            status: 'PENDING',
            statusText: '待回复',
            createdAt: '2026-06-05 09:00',
            daysPending: 1
          }
        ],
        allInquiries: [
          {
            id: '3',
            title: '关于绿化养护费用的质询',
            content: '绿化养护费用是否包含在物业费中？',
            status: 'REPLIED',
            statusText: '已回复',
            createdAt: '2026-06-02 15:00',
            authorName: '李业主'
          },
          {
            id: '4',
            title: '关于公共区域照明的质询',
            content: '建议增加公共区域的照明设施',
            status: 'CLOSED',
            statusText: '已关闭',
            createdAt: '2026-05-28 11:00',
            authorName: '王业主'
          }
        ]
      })
    })
  },

  // 发起质询
  createInquiry: function () {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    wx.showModal({
      title: '发起质询',
      editable: true,
      placeholderText: '请输入您的质询内容',
      success: (res) => {
        if (res.confirm && res.content) {
          this.submitInquiry(res.content)
        }
      }
    })
  },

  // 提交质询
  submitInquiry: async function (content) {
    const app = getApp()
    
    wx.showLoading({ title: '提交中...' })
    
    try {
      await app.request({
        url: '/governance/inquiries',
        method: 'POST',
        data: {
          communityId: app.globalData.communityId,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          content: content
        }
      })
      
      wx.hideLoading()
      wx.showToast({ title: '提交成功', icon: 'success' })
      this.loadInquiries()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    }
  },

  // 查看质询详情
  viewInquiry: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: `查看质询 ${id}`,
      icon: 'none'
    })
  },

  // 格式化时间
  formatTime: function (time) {
    if (!time) return ''
    return time.substring(5, 16)
  }
})