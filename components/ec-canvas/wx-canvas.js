export default class WxCanvas {
  constructor(ctx, canvasId, isNew, canvas) {
    this.ctx = ctx;
    this.canvasId = canvasId;
    this.chart = null;
    this.isNew = isNew;
    this.canvas = canvas;
    this._initProperties();
    this._initCanvas(ctx);
    this._initEvent();
  }

  _initProperties() {
    // 实现 DOM Canvas 的属性
    this.width = 0;
    this.height = 0;
    this.style = {};
    this.getContext = () => this.ctx;
    
    // 模拟 DOM 事件
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
    this.dispatchEvent = () => {};
    
    // 必要的 Canvas 属性
    this.getBoundingClientRect = () => ({
      top: 0,
      left: 0,
      width: this.width,
      height: this.height
    });
  }

  _initCanvas(ctx) {
    const methods = [
      'arc',
      'arcTo',
      'beginPath',
      'bezierCurveTo',
      'clearRect',
      'clip',
      'closePath',
      'createLinearGradient',
      'createPattern',
      'createRadialGradient',
      'drawImage',
      'fill',
      'fillRect',
      'fillText',
      'lineTo',
      'measureText',
      'moveTo',
      'quadraticCurveTo',
      'rect',
      'restore',
      'rotate',
      'save',
      'scale',
      'setFillStyle',
      'setFontSize',
      'setGlobalAlpha',
      'setLineCap',
      'setLineDash',
      'setLineJoin',
      'setLineWidth',
      'setMiterLimit',
      'setShadow',
      'setStrokeStyle',
      'setTextAlign',
      'setTextBaseline',
      'setTransform',
      'stroke',
      'strokeRect',
      'strokeText',
      'transform',
      'translate'
    ];

    methods.forEach(method => {
      this[method] = (...args) => ctx[method](...args);
    });

    // 属性代理
    [
      'fillStyle',
      'strokeStyle',
      'globalAlpha',
      'textAlign',
      'textBaseline',
      'lineWidth',
      'lineCap',
      'lineJoin',
      'miterLimit',
      'font'
    ].forEach(property => {
      Object.defineProperty(this, property, {
        get() {
          return ctx[property];
        },
        set(value) {
          if (typeof ctx[`set${property.charAt(0).toUpperCase()}${property.slice(1)}`] === 'function') {
            ctx[`set${property.charAt(0).toUpperCase()}${property.slice(1)}`](value);
          } else {
            ctx[property] = value;
          }
        }
      });
    });
  }

  _initEvent() {
    this.event = {};
    [
      { wxName: 'touchStart', ecName: 'mousedown' },
      { wxName: 'touchMove', ecName: 'mousemove' },
      { wxName: 'touchEnd', ecName: 'mouseup' },
      { wxName: 'touchEnd', ecName: 'click' }
    ].forEach(name => {
      this.event[name.wxName] = e => {
        const touch = e.touches[0] || e.changedTouches[0];
        const { x, y } = touch;
        this.chart?.getZr().handler.dispatch(name.ecName, {
          zrX: x,
          zrY: y,
          preventDefault: () => {},
          stopPropagation: () => {}
        });
      };
    });
  }
}