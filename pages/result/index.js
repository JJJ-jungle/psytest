// pages/result/index.js
Page({
  data: {
    theta: 0,
    sem: 0,
    thetaDisplay: '0.00',
    semDisplay: '0.00',
    analysisText: '',
    suggestions: []
  },

  onLoad(options) {
    const theta = parseFloat(options.theta);
    const sem = parseFloat(options.sem);

    this.setData({
      theta,
      sem,
      thetaDisplay: theta.toFixed(2),
      semDisplay: sem.toFixed(2)
    });

    this.analyzeResult(theta);
  },

  analyzeResult(theta) {
    let analysisText = '';
    let suggestions = [];

    // 根据能力值范围判断结果
    if (theta < -2) {
      analysisText = '测评结果显示您当前的心理健康状况需要额外关注。';
      suggestions = [
        '建议您寻求专业心理咨询师的帮助',
        '可以尝试进行正念冥想来缓解压力',
        '与信任的亲友分享您的感受和困扰'
      ];
    } else if (theta < -1) {
      analysisText = '测评结果显示您的心理健康状况略低于平均水平。';
      suggestions = [
        '建议您适当增加运动和户外活动',
        '培养健康的作息习惯',
        '学习一些简单的压力管理技巧'
      ];
    } else if (theta < 1) {
      analysisText = '测评结果显示您的心理健康状况处于正常范围。';
      suggestions = [
        '继续保持健康的生活方式',
        '培养积极的兴趣爱好',
        '定期进行自我心理调节'
      ];
    } else {
      analysisText = '测评结果显示您的心理健康状况良好。';
      suggestions = [
        '继续保持积极乐观的生活态度',
        '可以尝试帮助他人提升心理健康',
        '定期进行心理健康自测'
      ];
    }

    this.setData({
      analysisText,
      suggestions
    });
  },

  viewDetail() {
    // 跳转到详细报告页面
    wx.navigateTo({
      url: '/pages/report/index'
    });
  },

  backToHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});