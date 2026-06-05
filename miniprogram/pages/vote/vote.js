Page({
  data: {
    activeVotes: [],
    endedVotes: []
  },

  onLoad: function () {
    this.loadVotes()
  },

  // 加载投票列表
  loadVotes: function () {
    const app = getApp()
    app.request({
      url: '/governance/votes',
      data: {
        communityId: app.globalData.communityId
      }
    }).then(data => {
      const activeVotes = data.active || []
      const endedVotes = data.ended || []
      this.setData({ activeVotes, endedVotes })
    }).catch(err => {
      console.error('加载投票失败:', err)
      // 使用模拟数据
      this.setData({
        activeVotes: [
          {
            id: '1',
            title: '小区绿化改造项目投票',
            description: '计划对小区公共区域进行绿化改造，预计花费50万元',
            type: 'RENOVATION',
            typeText: '改造项目',
            forCount: 156,
            againstCount: 48,
            abstainCount: 26,
            participationRate: 46,
            forPercent: 68,
            againstPercent: 21,
            endAt: '2026-06-15 23:59:59',
            hasVoted: false
          },
          {
            id: '2',
            title: '物业费调整方案',
            description: '因人工成本上涨，拟将物业费从2.5元/㎡调整至2.8元/㎡',
            type: 'FEE_ADJUSTMENT',
            typeText: '费用调整',
            forCount: 89,
            againstCount: 124,
            abstainCount: 37,
            participationRate: 52,
            forPercent: 38,
            againstPercent: 53,
            endAt: '2026-06-20 23:59:59',
            hasVoted: true
          }
        ],
        endedVotes: [
          {
            id: '3',
            title: '电梯更换方案',
            description: '更换1号楼和2号楼电梯，预计花费120万元',
            type: 'ELEVATOR',
            typeText: '电梯维护',
            participationRate: 78,
            forPercent: 72,
            passed: true
          }
        ]
      })
    })
  },

  // 查看投票详情
  viewVote: function (e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: `查看投票 ${id}`,
      icon: 'none'
    })
  },

  // 投票
  handleVote: function (e) {
    const id = e.currentTarget.dataset.id
    const vote = this.data.activeVotes.find(v => v.id === id)
    
    if (vote && !vote.hasVoted) {
      wx.showActionSheet({
        itemList: ['赞成', '反对', '弃权'],
        success: (res) => {
          const options = ['FOR', 'AGAINST', 'ABSTAIN']
          this.submitVote(id, options[res.tapIndex])
        }
      })
    } else {
      this.viewVote(e)
    }
  },

  // 提交投票
  submitVote: async function (voteId, option) {
    const app = getApp()
    
    wx.showLoading({ title: '提交中...' })
    
    try {
      await app.request({
        url: `/governance/votes/${voteId}/vote`,
        method: 'POST',
        data: { option }
      })
      
      wx.hideLoading()
      wx.showToast({ title: '投票成功', icon: 'success' })
      
      // 更新本地数据
      this.loadVotes()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '投票失败', icon: 'none' })
    }
  },

  // 格式化日期
  formatDate: function (date) {
    if (!date) return ''
    return date.substring(5, 16)
  }
})