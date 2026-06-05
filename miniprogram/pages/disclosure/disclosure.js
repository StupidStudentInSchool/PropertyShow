Page({
  data: {
    currentPeriod: '2026-06',
    totalIncome: 1250000,
    totalExpense: 980000,
    totalBalance: 270000,
    balancePercent: 60,
    incomeItems: [],
    expenseItems: []
  },

  onLoad: function () {
    this.loadData()
  },

  // 加载数据
  loadData: function () {
    const app = getApp()
    app.request({
      url: '/ledger/entries',
      data: {
        communityId: app.globalData.communityId,
        period: this.data.currentPeriod
      }
    }).then(data => {
      const incomeItems = data.filter(item => item.type === 'INCOME') || []
      const expenseItems = data.filter(item => item.type === 'EXPENSE') || []
      
      this.setData({
        incomeItems: incomeItems,
        expenseItems: expenseItems,
        totalIncome: incomeItems.reduce((sum, item) => sum + item.amount, 0),
        totalExpense: expenseItems.reduce((sum, item) => sum + item.amount, 0)
      })
      
      this.calculateBalance()
    }).catch(err => {
      console.error('加载数据失败:', err)
      // 使用模拟数据
      this.setData({
        incomeItems: [
          { id: '1', categoryName: '物业费收入', counterparty: '业主缴纳', amount: 850000, occurredAt: '2026-06-15' },
          { id: '2', categoryName: '停车费收入', counterparty: '业主缴纳', amount: 280000, occurredAt: '2026-06-20' },
          { id: '3', categoryName: '广告位收入', counterparty: '某广告公司', amount: 120000, occurredAt: '2026-06-10' }
        ],
        expenseItems: [
          { id: '1', categoryName: '人员工资', counterparty: '物业员工', amount: 420000, occurredAt: '2026-06-01' },
          { id: '2', categoryName: '保洁服务', counterparty: '保洁公司', amount: 150000, occurredAt: '2026-06-10' },
          { id: '3', categoryName: '安保服务', counterparty: '安保公司', amount: 180000, occurredAt: '2026-06-15' },
          { id: '4', categoryName: '设备维保', counterparty: '维保公司', amount: 130000, occurredAt: '2026-06-20' },
          { id: '5', categoryName: '能耗费用', counterparty: '电力公司', amount: 100000, occurredAt: '2026-06-25' }
        ]
      })
      this.calculateBalance()
    })
  },

  // 计算结余
  calculateBalance: function () {
    const total = this.data.totalIncome - this.data.totalExpense
    const max = Math.max(this.data.totalIncome, this.data.totalExpense) || 1
    const percent = (this.data.totalIncome / max) * 100
    
    this.setData({
      totalBalance: total,
      balancePercent: percent
    })
  },

  // 上一月
  prevPeriod: function () {
    const [year, month] = this.data.currentPeriod.split('-').map(Number)
    let newMonth = month - 1
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }
    this.setData({
      currentPeriod: `${newYear}-${String(newMonth).padStart(2, '0')}`
    })
    this.loadData()
  },

  // 下一月
  nextPeriod: function () {
    const [year, month] = this.data.currentPeriod.split('-').map(Number)
    let newMonth = month + 1
    let newYear = year
    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }
    this.setData({
      currentPeriod: `${newYear}-${String(newMonth).padStart(2, '0')}`
    })
    this.loadData()
  },

  // 查看全部明细
  viewAllEntries: function () {
    wx.showToast({
      title: '查看全部明细',
      icon: 'none'
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