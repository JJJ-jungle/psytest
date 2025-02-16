import { questionBank } from '../data/questions';

// 维度名称映射
const dimensionMap = {
  '抑郁': 'depression',
  '焦虑': 'anxiety',
  '压力': 'stress'
};

// 默认建议
const defaultSuggestions = {
  normal: [
    '保持健康的生活方式',
    '保持良好的作息习惯'
  ],
  mild: [
    '适当增加运动量',
    '注意调节心理状态'
  ],
  moderate: [
    '建议进行专业评估',
    '学习压力管理技巧'
  ],
  severe: [
    '建议寻求专业帮助',
    '保持与亲友的联系'
  ]
};

// 计算维度得分
export const calculateDimensionScores = (answers) => {
  const dimensionScores = {};
  
  if (!answers || !Array.isArray(answers)) {
    console.warn('Invalid answers data');
    return dimensionScores;
  }

  // 初始化维度得分
  questionBank.metadata.dimensions.forEach(dimension => {
    dimensionScores[dimension] = 0;
  });

  // 计算每个维度的得分
  let dimensionCounts = {};
  answers.forEach(answer => {
    if (!answer || !answer.questionId) return;
    
    const question = questionBank.questions.find(q => q.id === answer.questionId);
    if (!question || !question.dimension) return;

    const dimension = question.dimension;
    if (dimensionScores.hasOwnProperty(dimension)) {
      dimensionScores[dimension] += (answer.response * (question.weight || 1));
      dimensionCounts[dimension] = (dimensionCounts[dimension] || 0) + 1;
    }
  });

  // 计算平均分
  Object.keys(dimensionScores).forEach(dimension => {
    if (dimensionCounts[dimension] > 0) {
      dimensionScores[dimension] = dimensionScores[dimension] / dimensionCounts[dimension];
    }
  });

  return dimensionScores;
};

// 生成测评报告
export const generateReport = (testResult) => {
  if (!testResult) {
    console.error('No test result provided');
    return null;
  }

  try {
    const { theta = 0, sem = 1, answers = [], timestamp = new Date().toISOString() } = testResult;
    const dimensionScores = calculateDimensionScores(answers);

    // 计算各维度严重程度
    const severityLevels = {};
    Object.entries(dimensionScores).forEach(([dimension, score]) => {
      const englishDimension = dimensionMap[dimension];
      const cutoffs = questionBank.scoringRules.cutoffs[englishDimension] || {
        normal: [-Infinity, -1],
        mild: [-1, 0],
        moderate: [0, 1],
        severe: [1, Infinity]
      };

      let severity = 'normal';
      for (const [level, [min, max]] of Object.entries(cutoffs)) {
        if (score > min && score <= max) {
          severity = level;
          break;
        }
      }
      severityLevels[dimension] = severity;
    });

    // 生成解释文本
    const interpretations = Object.entries(severityLevels).map(([dimension, severity]) => {
      const englishDimension = dimensionMap[dimension];
      return questionBank.scoringRules.interpretations[englishDimension]?.[severity] || 
             `${dimension}水平在正常范围内`;
    });

    // 生成建议
    const suggestions = Object.entries(severityLevels).flatMap(([dimension, severity]) => {
      try {
        const englishDimension = dimensionMap[dimension];
        const dimensionSuggestions = questionBank.suggestionRules.getBySeverity(englishDimension, severity);
        return dimensionSuggestions && dimensionSuggestions.length > 0 ? 
               dimensionSuggestions : 
               defaultSuggestions[severity] || defaultSuggestions.normal;
      } catch (error) {
        console.warn(`Error getting suggestions for ${dimension}:`, error);
        return defaultSuggestions[severity] || defaultSuggestions.normal;
      }
    });

    // 确保建议不重复
    const uniqueSuggestions = [...new Set(suggestions)];

    // 计算测评质量
    const duration = calculateDuration(answers);
    const reliability = calculateReliability(sem);

    return {
      timestamp,
      theta,
      sem,
      dimensionScores,
      severityLevels,
      interpretations,
      suggestions: uniqueSuggestions,
      duration,
      reliability,
      totalQuestions: answers.length
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      timestamp: new Date().toISOString(),
      theta: 0,
      sem: 1,
      dimensionScores: {},
      severityLevels: {},
      interpretations: ['无法生成详细解释'],
      suggestions: defaultSuggestions.normal,
      duration: 0,
      reliability: 0,
      totalQuestions: 0
    };
  }
};

// 计算测评时长（分钟）
const calculateDuration = (answers) => {
  if (!answers || answers.length < 2) return 0;
  
  const startTime = new Date(answers[0].timestamp);
  const endTime = new Date(answers[answers.length - 1].timestamp);
  return Math.round((endTime - startTime) / 60000); // 转换为分钟
};

// 计算信度
const calculateReliability = (sem) => {
  return Math.max(0, Math.min(1, 1 - Math.pow(sem, 2)));
};

// 导出分析数据
export const exportAnalysisData = (testResult) => {
  const report = generateReport(testResult);
  if (!report) return null;

  return {
    basicInfo: {
      testDate: new Date(report.timestamp).toLocaleDateString(),
      duration: report.duration,
      questionCount: report.totalQuestions
    },
    scores: {
      theta: report.theta,
      sem: report.sem,
      dimensionScores: report.dimensionScores
    },
    analysis: {
      severityLevels: report.severityLevels,
      interpretations: report.interpretations,
      reliability: report.reliability
    },
    suggestions: report.suggestions
  };
};