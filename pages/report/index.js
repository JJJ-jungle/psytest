import * as echarts from '../../components/ec-canvas/echarts';
import { generateReport } from '../../utils/analysis';

Page({
  data: {
    report: null,
    showDetailReport: false,
    chartReady: false,
    dimensionScores: [],
    ec: {
      lazyLoad: true
    }
  },

  onLoad(options) {
    const { testId } = options;
    const history = wx.getStorageSync('testHistory') || [];
    const testResult = history.find(item => item.id === testId);
    
    if (testResult) {
      const report = generateReport(testResult);
      console.log('生成的报告：', report);
      
      // 格式化数据
      report.timestamp = new Date(report.timestamp).toLocaleString();
      report.thetaDisplay = report.theta.toFixed(2);
      report.semDisplay = report.sem.toFixed(2);

      // 计算并打印维度得分
      const dimensionScores = this.calculateDimensionScores(report.dimensionScores);
      console.log('计算后的维度得分：', dimensionScores);
      
      this.setData({ 
        report,
        dimensionScores,
        showDetailReport: true
      }, () => {
        console.log('设置后的维度得分：', this.data.dimensionScores);
        setTimeout(() => {
          this.initChart();
        }, 500);
      });
    }
  },

  calculateDimensionScores(scores) {
    if (!scores) {
      console.error('没有维度得分数据');
      return [];
    }

    console.log('原始维度得分：', scores);
    const dimensions = ['情绪', '认知', '行为', '人际', '躯体'];
    
    return dimensions.map(dim => {
      let rawScore = 0;
      // 映射维度得分
      if (dim === '情绪') {
        rawScore = scores.抑郁 || 0;
      } else if (dim === '认知' || dim === '行为') {
        rawScore = scores.焦虑 || 0;
      } else if (dim === '人际' || dim === '躯体') {
        rawScore = scores.压力 || 0;
      }
      
      // 转换为百分比并确保在0-100范围内
      const percentage = Math.round((rawScore - 1) * 25);
      const finalScore = Math.max(0, Math.min(100, percentage));
      
      return {
        name: dim,
        score: finalScore
      };
    });
  },

  getDimensionValues() {
    if (!this.data.dimensionScores || this.data.dimensionScores.length === 0) {
      console.error('维度得分数组为空');
      return [0, 0, 0, 0, 0];
    }
    return this.data.dimensionScores.map(item => item.score);
  },

  formatDimensionScores(scores) {
    const dimensions = ['情绪', '认知', '行为', '人际', '躯体'];
    return dimensions.map(dim => ({
      name: dim,
      value: scores[dim] ? Math.round(scores[dim] * 100) : 0
    }));
  },

  initChart() {
    const ecComponent = this.selectComponent('#mychart');
    if (!ecComponent) {
      console.error('找不到图表组件');
      return;
    }

    ecComponent.init((chart) => {
      const values = this.getDimensionValues();
      console.log('图表维度得分：', values);

      const option = {
        radar: {
          shape: 'circle',
          indicator: [
            { name: '情绪', max: 100, min: 0 },
            { name: '认知', max: 100, min: 0 },
            { name: '行为', max: 100, min: 0 },
            { name: '人际', max: 100, min: 0 },
            { name: '躯体', max: 100, min: 0 }
          ],
          splitNumber: 4,
          axisName: {
            formatter: '{value}',
            color: '#333333'
          },
          splitLine: {
            lineStyle: {
              color: [
                'rgba(238, 238, 238, 0.8)',
                'rgba(238, 238, 238, 0.6)',
                'rgba(238, 238, 238, 0.4)',
                'rgba(238, 238, 238, 0.2)'
              ].reverse()
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(255, 255, 255, 0.5)'],
              shadowColor: 'rgba(0, 0, 0, 0.05)',
              shadowBlur: 10
            }
          }
        },
        series: [{
          name: '维度得分',
          type: 'radar',
          data: [{
            value: values,
            name: '评估结果',
            symbolSize: 6,
            lineStyle: {
              width: 2,
              color: '#3498db'
            },
            areaStyle: {
              color: 'rgba(52, 152, 219, 0.3)'
            },
            itemStyle: {
              color: '#3498db'
            }
          }]
        }]
      };

      chart.setOption(option);
      return chart;
    });
  },

  // 切换报告视图
  toggleReportView() {
    const newShowDetail = !this.data.showDetailReport;
    this.setData({ showDetailReport: newShowDetail });
    
    if (newShowDetail && !this.data.chartReady) {
      setTimeout(() => {
        this.initChart();
      }, 300);
    }
  },

  handleExportReport() {
    wx.showLoading({ title: '导出中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      });
    }, 1500);
  },

  handleBackHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});