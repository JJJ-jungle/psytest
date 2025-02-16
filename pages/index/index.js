Page({
  data: {
    hasUserInfo: false,
    userInfo: null
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        hasUserInfo: true,
        userInfo: userInfo
      })
    }
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        wx.setStorageSync('userInfo', res.userInfo)
        this.setData({
          hasUserInfo: true,
          userInfo: res.userInfo
        })
      }
    })
  },

  startTest() {
    wx.navigateTo({
      url: '/pages/test/index'
    })
  },

  viewHistory() {
    wx.navigateTo({
      url: '/pages/history/index'
    })
  }
})