export const questionBank = {
  // 题库元数据
  metadata: {
    version: '1.0.0',
    lastUpdate: '2025-02-11',
    totalQuestions: 50,
    categories: ['情绪', '认知', '行为', '人际', '躯体'],
    dimensions: ['抑郁', '焦虑', '压力']
  },

  // 内容平衡规则
  contentRules: {
    '情绪': { min: 3, max: 8 },
    '认知': { min: 3, max: 8 },
    '行为': { min: 3, max: 8 },
    '人际': { min: 3, max: 8 },
    '躯体': { min: 3, max: 8 }
  },

  // 题目数据
  questions: [
    {
      id: 'Q001',
      question: '最近我感到心情低落或沮丧',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.82, b: -0.5, c: 0.02 },
      category: '情绪',
      dimension: '抑郁',
      weight: 1.0
    },
    {
      id: 'Q002',
      question: '我经常感到紧张不安',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.75, b: -0.4, c: 0.02 },
      category: '情绪',
      dimension: '焦虑',
      weight: 1.0
    },
    {
      id: 'Q003',
      question: '我很难保持专注',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.68, b: -0.3, c: 0.02 },
      category: '认知',
      dimension: '压力',
      weight: 1.0
    },
    {
      id: 'Q004',
      question: '我对以前喜欢的事物失去了兴趣',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.90, b: -0.2, c: 0.02 },
      category: '情绪',
      dimension: '抑郁',
      weight: 1.0
    },
    {
      id: 'Q005',
      question: '我经常感到疲惫或没有精力',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.65, b: -0.4, c: 0.02 },
      category: '躯体',
      dimension: '抑郁',
      weight: 1.0
    },
    {
      id: 'Q006',
      question: '我很难入睡或保持睡眠',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.72, b: -0.3, c: 0.02 },
      category: '躯体',
      dimension: '焦虑',
      weight: 1.0
    },
    {
      id: 'Q007',
      question: '我经常感到坐立不安',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.78, b: -0.4, c: 0.02 },
      category: '行为',
      dimension: '焦虑',
      weight: 1.0
    },
    {
      id: 'Q008',
      question: '我很难与他人交流',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.85, b: -0.5, c: 0.02 },
      category: '人际',
      dimension: '抑郁',
      weight: 1.0
    },
    {
      id: 'Q009',
      question: '我经常感到压力很大',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.70, b: -0.3, c: 0.02 },
      category: '情绪',
      dimension: '压力',
      weight: 1.0
    },
    {
      id: 'Q010',
      question: '我对未来感到悲观',
      options: ['完全不符合', '比较不符合', '一般', '比较符合', '完全符合'],
      parameters: { a: 1.88, b: -0.4, c: 0.02 },
      category: '认知',
      dimension: '抑郁',
      weight: 1.0
    },
    // ... 更多题目
  ],

  // 评分规则
  scoringRules: {
    // 量表总分转换
    rawToTheta: (rawScore) => {
      // T分转换
      return (rawScore - 50) / 10;
    },
    
    // 分维度切分点
    cutoffs: {
      depression: {
        normal: [-Infinity, -1],
        mild: [-1, 0],
        moderate: [0, 1],
        severe: [1, Infinity]
      },
      anxiety: {
        normal: [-Infinity, -1],
        mild: [-1, 0],
        moderate: [0, 1],
        severe: [1, Infinity]
      },
      stress: {
        normal: [-Infinity, -1],
        mild: [-1, 0],
        moderate: [0, 1],
        severe: [1, Infinity]
      }
    },

    // 维度解释文本
    interpretations: {
      depression: {
        normal: '抑郁水平在正常范围内',
        mild: '存在轻度抑郁症状',
        moderate: '存在中度抑郁症状',
        severe: '存在重度抑郁症状'
      },
      anxiety: {
        normal: '焦虑水平在正常范围内',
        mild: '存在轻度焦虑症状',
        moderate: '存在中度焦虑症状',
        severe: '存在重度焦虑症状'
      },
      stress: {
        normal: '压力水平在正常范围内',
        mild: '存在轻度压力症状',
        moderate: '存在中度压力症状',
        severe: '存在重度压力症状'
      }
    }
  },

  // 建议规则
  suggestionRules: {
    getBySeverity: (dimension, severity) => {
      const suggestions = {
        depression: {
          normal: [
            '保持积极的生活方式',
            '培养兴趣爱好',
            '保持规律作息'
          ],
          mild: [
            '增加运动量',
            '与家人朋友多交流',
            '学习放松技巧'
          ],
          moderate: [
            '建议寻求心理咨询',
            '规律作息很重要',
            '可以尝试正念练习'
          ],
          severe: [
            '强烈建议寻求专业帮助',
            '告知亲友获取支持',
            '保持规律作息和适量运动'
          ]
        },
        anxiety: {
          normal: [
            '保持平和心态',
            '规律作息',
            '适量运动'
          ],
          mild: [
            '学习呼吸放松法',
            '保持规律生活',
            '适当运动'
          ],
          moderate: [
            '建议咨询专业人士',
            '学习焦虑管理技巧',
            '保持社交活动'
          ],
          severe: [
            '及时寻求专业帮助',
            '遵医嘱用药',
            '保持与家人沟通'
          ]
        },
        stress: {
          normal: [
            '保持生活规律',
            '劳逸结合',
            '培养兴趣爱好'
          ],
          mild: [
            '学习时间管理',
            '适当运动放松',
            '保持充足睡眠'
          ],
          moderate: [
            '寻求专业指导',
            '学习压力管理',
            '适当调整工作节奏'
          ],
          severe: [
            '及时就医咨询',
            '调整生活方式',
            '寻求社会支持'
          ]
        }
      };
  
      try {
        if (!suggestions[dimension] || !suggestions[dimension][severity]) {
          const defaultSuggestions = {
            normal: ['保持健康的生活方式', '继续保持积极乐观的心态'],
            mild: ['适当调整生活习惯', '注意劳逸结合'],
            moderate: ['建议进行专业评估', '保持规律的生活节奏'],
            severe: ['建议寻求专业帮助', '保持与亲友的沟通']
          };
          return defaultSuggestions[severity] || defaultSuggestions.normal;
        }
        return suggestions[dimension][severity];
      } catch (error) {
        console.warn('Error getting suggestions:', error);
        return ['建议进行进一步评估'];
      }
    }
  }
};

// 导出题库初始化函数
export const initializeQuestionBank = () => {
  const storage = wx.getStorageSync('questionBank');
  if (!storage) {
    wx.setStorageSync('questionBank', questionBank);
  }
  return questionBank;
};