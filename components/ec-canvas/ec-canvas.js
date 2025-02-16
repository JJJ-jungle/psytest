import * as echarts from './echarts';

class WxCanvas {
  constructor(ctx, canvasId, isNew, canvas) {
    this.ctx = ctx;
    this.canvasId = canvasId;
    this.chart = null;
    this.canvas = canvas;
    this._initProperties();
    this._initCanvas();
    this._initEvent();
  }

  _initProperties() {
    this.width = 0;
    this.height = 0;
    this.style = {};
    this.eventListeners = {};
  }

  _initCanvas() {
    const methods = [
      'arc', 'arcTo', 'beginPath', 'bezierCurveTo', 'clearRect', 'clip', 'closePath',
      'createLinearGradient', 'createPattern', 'createRadialGradient', 'drawImage', 
      'fill', 'fillRect', 'fillText', 'lineTo', 'measureText', 'moveTo', 
      'quadraticCurveTo', 'rect', 'restore', 'rotate', 'save', 'scale', 
      'setFillStyle', 'setFontSize', 'setGlobalAlpha', 'setLineCap', 'setLineDash', 
      'setLineJoin', 'setLineWidth', 'setMiterLimit', 'setShadow', 'setStrokeStyle', 
      'setTextAlign', 'setTextBaseline', 'setTransform', 'stroke', 'strokeRect', 
      'strokeText', 'transform', 'translate'
    ];

    methods.forEach(method => {
      if (typeof this.ctx[method] === 'function') {
        this[method] = (...args) => this.ctx[method](...args);
      }
    });
  }

  getContext(type) {
    return type === '2d' ? this.ctx : null;
  }

  setChart(chart) {
    this.chart = chart;
  }

  addEventListener(type, listener) {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (!this.eventListeners[type]) return;
    const index = this.eventListeners[type].indexOf(listener);
    if (index > -1) {
      this.eventListeners[type].splice(index, 1);
    }
  }

  _initEvent() {
    [
      { wxName: 'touchStart', ecName: 'mousedown' },
      { wxName: 'touchMove', ecName: 'mousemove' },
      { wxName: 'touchEnd', ecName: 'mouseup' }
    ].forEach(item => {
      this[item.wxName] = e => {
        if (this.chart && e.touches.length > 0) {
          const touch = e.touches[0];
          this.chart.getZr().handler.dispatch(item.ecName, {
            zrX: touch.x,
            zrY: touch.y
          });
        }
      };
    });
  }

  attachEvent() {}
  detachEvent() {}
}

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    ec: {
      type: Object
    }
  },

  data: {},

  ready: function () {
    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量');
      return;
    }

    if (!this.data.ec.lazyLoad) {
      this.init();
    }
  },

  methods: {
    init: function (callback) {
      const ctx = wx.createCanvasContext(this.data.canvasId, this);

      // 创建 Canvas 对象
      const canvas = {
        ctx: ctx,
        canvasId: this.data.canvasId,
        width: 0,
        height: 0,
        eventListeners: {},
        style: {},
        chart: null,

        // DOM 方法
        addEventListener: function(type, listener) {
          if (!this.eventListeners[type]) {
            this.eventListeners[type] = [];
          }
          this.eventListeners[type].push(listener);
        },

        removeEventListener: function(type, listener) {
          if (this.eventListeners[type]) {
            const index = this.eventListeners[type].indexOf(listener);
            if (index > -1) {
              this.eventListeners[type].splice(index, 1);
            }
          }
        },

        dispatchEvent: function(event) {
          const listeners = this.eventListeners[event.type] || [];
          listeners.forEach(listener => listener(event));
        },

        // Canvas 方法
        getContext: function(contextType) {
          if (contextType === '2d') {
            return ctx;
          }
        },

        setChart: function(chart) {
          this.chart = chart;
        },

        attachEvent: function() {},
        detachEvent: function() {},

        getBoundingClientRect: function() {
          return {
            top: 0,
            left: 0,
            width: this.width,
            height: this.height
          };
        },

        createImage: function() {
          return {};
        }
      };

      // 确保事件处理可用
      canvas.setAttribute = function() {};
      canvas.focus = function() {};
      canvas.blur = function() {};

      // 设置 Canvas Creator
      echarts.setCanvasCreator(() => canvas);

      // 获取尺寸并初始化图表
      const query = wx.createSelectorQuery().in(this);
      query.select('.ec-canvas')
        .boundingClientRect((res) => {
          if (!res) {
            setTimeout(() => this.init(callback), 50);
            return;
          }

          canvas.width = res.width;
          canvas.height = res.height;

          const chart = echarts.init(canvas, null, {
            width: res.width,
            height: res.height,
            devicePixelRatio: 1
          });

          canvas.setChart(chart);
          this.chart = chart;

          // 调用回调
          if (typeof callback === 'function') {
            callback(chart);
          } else if (typeof this.data.ec.onInit === 'function') {
            this.data.ec.onInit(chart);
          }

          // 绘制
          const oldSetOption = chart.setOption;
          chart.setOption = function() {
            oldSetOption.apply(this, arguments);
            ctx.draw(true);
          };
        }).exec();
    },

    canvasToTempFilePath(opt) {
      if (!opt.canvasId) {
        opt.canvasId = this.data.canvasId;
      }
      
      const ctx = this.chart.getContext();
      ctx.draw(true, () => {
        wx.canvasToTempFilePath(opt, this);
      });
    },

    touchStart(e) {
      if (this.chart && e.touches.length > 0) {
        const touch = e.touches[0];
        const handler = this.chart.getZr().handler;
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y,
          preventDefault: function() {},
          stopPropagation: function() {}
        });
      }
    },

    touchMove(e) {
      if (this.chart && e.touches.length > 0) {
        const touch = e.touches[0];
        const handler = this.chart.getZr().handler;
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y,
          preventDefault: function() {},
          stopPropagation: function() {}
        });
      }
    },

    touchEnd(e) {
      if (this.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {};
        const handler = this.chart.getZr().handler;
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y,
          preventDefault: function() {},
          stopPropagation: function() {}
        });
      }
    }
  }
});