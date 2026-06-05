Page({
  data: {
    currentTab: 'unpaid',
    pendingAmount: 258000,
    unpaidCount: 2,
    paidCount: 6,
    bills: [],
    paymentHistory: []
  },

  onLoad: function () {
    this.loadBills()
  },

  // 加载账单列表
  loadBills: function () {
    const app = getApp()
    app.request({
      url: '/ledger/bills',
      data: {
        communityId: app.globalData.communityId,
        status: this.data.currentTab === 'unpaid' ? 'UNPAID' : this.data.currentTab === 'paid' ? 'PAID' : ''
      }
    }).then(data => {
      this.setData({
        bills: data.bills || [],
        paymentHistory: data.history || []
      })
    }).catch(err => {
      console.error('加载账单失败:', err)
      // 使用模拟数据
      const bills = this.data.currentTab === 'unpaid' ? [
        {
          id: '1',
          type: 'PROPERTY_FEE',
          period: '2026-06',
          houseNumber: '1号楼1单元101室',
          amount: 158000,
          dueDate: '2026-06-30',
          status: 'UNPAID'
        },
        {
          id: '2',
          type: 'PARKING_FEE',
          period: '2026-06',
          houseNumber: '地下车库B1-023',
          amount: 100000,
          dueDate: '2026-06-30',
          status: 'UNPAID'
        }
      ] : [
        {
          id: '3',
          type: 'PROPERTY_FEE',
          period: '2026-05',
          houseNumber: '1号楼1单元101室',
          amount: 158000,
          dueDate: '2026-05-31',
          status: 'PAID'
        },
        {
          id: '4',
          type: 'PROPERTY_FEE',
          period: '2026-04',
          houseNumber: '1号楼1单元101室',
          amount: 158000,
          dueDate: '2026-04-30',
          status: 'PAID'
        }
      ]
      
      this.setData({
        bills: bills,
        paymentHistory: [
          { id: '1', billType: 'PROPERTY_FEE', amount: 158000, paidAt: '2026-05-15' },
          { id: '2', billType: 'PARKING_FEE', amount: 100000, paidAt: '2026-05-10' },
          { id: '3', billType: 'PROPERTY_FEE', amount: 158000, paidAt: '2026-04-12' }
        ]
      })
    })
  },

  // 切换标签
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    this.loadBills()
  },

  // 获取类型图标
  getTypeIcon: function (type) {
    const icons = {
      PROPERTY_FEE: '🏠',
      PARKING_FEE: '🚗',
      WATER: '💧',
      ELECTRIC: '⚡',
      GAS: '🔥',
      OTHER: '📋'
    }
    return icons[type] || '📋'
  },

  // 获取类型名称
  getTypeName: function (type) {
    const names = {
      PROPERTY_FEE: '物业费',
      PARKING_FEE: '停车费',
      WATER: '水费',
      ELECTRIC: '电费',
      GAS: '燃气费',
      OTHER: '其他费用'
    }
    return names[type] || '其他费用'
  },

  // 账单操作
  handleBillAction: function (e) {
    const { id, status } = e.currentTarget.dataset
    if (status === 'UNPAID') {
      this.payBill(id)
    } else {
      this.viewBill(id)
    }
  },

  // 缴费
  payBill: function (billId) {
    wx.showModal({
      title: '确认缴费',
      content: '确定要缴费吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '支付中...' })
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({ title: '支付成功', icon: 'success' })
            this.loadBills()
          }, 1500)
        }
      }
    })
  },

  // 查看详情
  viewBill: function (billId) {
    wx.showToast({
      title: `查看账单 ${billId}`,
      icon: 'none'
    })
  },

  // 全部缴费
  payAll: function () {
    wx.showModal({
      title: '确认全部缴费',
      content: `确定要缴纳全部待缴费用吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '支付中...' })
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({ title: '支付成功', icon: 'success' })
            this.loadBills()
          }, 1500)
        }
      }
    })
  },

  // 格式化金额
  formatAmount: function (cents) {
    if (!cents) return '0.00'
    return (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })
  },

  // 格式化日期
  formatDate: function (date) {
    if (!date) return ''
    return date.substring(5, 10)
  }
})