Page({
  data: {
    history: []
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  loadHistory() {
    const history = wx.getStorageSync('testHistory') || [];
    
    // 处理显示格式
    const formattedHistory = history.map(item => {
      const date = new Date(item.date);
      return {
        ...item,
        dateDisplay: this.formatDate(date),
        timeDisplay: this.formatTime(date),
        thetaDisplay: item.theta.toFixed(2),
        semDisplay: item.sem.toFixed(2)
      };
    });

    this.setData({
      history: formattedHistory.reverse() // 最新的记录显示在前面
    });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  viewDetail(e) {
    const index = e.currentTarget.dataset.index;
    const record = this.data.history[index];
    
    wx.navigateTo({
      url: `/pages/report/index?date=${record.date}`
    });
  }
});