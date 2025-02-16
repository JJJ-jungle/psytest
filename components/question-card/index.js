Component({
  properties: {
    question: {
      type: Object,
      value: null
    },
    selectedOption: {
      type: Number,
      value: -1
    }
  },

  data: {
    animationData: {}
  },

  methods: {
    handleOptionSelect(e) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent('select', { index });
    },

    // 切换题目时的动画效果
    startSwitchAnimation() {
      const animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease'
      });

      animation.opacity(0).scale(0.9).step();
      this.setData({
        animationData: animation.export()
      });

      setTimeout(() => {
        animation.opacity(1).scale(1).step();
        this.setData({
          animationData: animation.export()
        });
      }, 200);
    }
  }
});