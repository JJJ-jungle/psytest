// IRT三参数模型概率计算
export const calculateProbability = (params, theta) => {
  const { a, b, c } = params;
  const z = a * (theta - b);
  const exp = Math.exp(z);
  return c + ((1 - c) * exp) / (1 + exp);
};

// 计算题目信息量
export const calculateInformation = (params, theta) => {
  const { a, c } = params;
  const p = calculateProbability(params, theta);
  const q = 1 - p;
  return Math.pow(a, 2) * Math.pow(q/p, 2) * p;
};

// 最大信息量选题
export const selectNextQuestion = (questions, theta, answeredIds = []) => {
  const availableQuestions = questions.filter(q => !answeredIds.includes(q.id));
  
  if (availableQuestions.length === 0) {
    return null;
  }

  let maxInfo = -Infinity;
  let selectedQuestion = null;

  availableQuestions.forEach(question => {
    const info = calculateInformation(question.parameters, theta);
    if (info > maxInfo) {
      maxInfo = info;
      selectedQuestion = question;
    }
  });

  return selectedQuestion;
};

// EAP估计能力值
export const estimateTheta = (answers, questions) => {
  const points = 121; // [-6, 6]的积分点数
  const minTheta = -6;
  const maxTheta = 6;
  const step = (maxTheta - minTheta) / (points - 1);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < points; i++) {
    const theta = minTheta + i * step;
    let likelihood = 1;
    let prior = Math.exp(-Math.pow(theta, 2) / 2) / Math.sqrt(2 * Math.PI); // 标准正态先验
    
    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      const p = calculateProbability(question.parameters, theta);
      likelihood *= answer.response === 1 ? p : (1 - p);
    });
    
    const posterior = likelihood * prior;
    numerator += theta * posterior;
    denominator += posterior;
  }
  
  return numerator / denominator;
};

// 计算测量标准误
export const calculateSEM = (answers, questions, theta) => {
  let totalInfo = 0;
  
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    totalInfo += calculateInformation(question.parameters, theta);
  });
  
  return 1 / Math.sqrt(totalInfo);
};

// 检查终止规则
export const checkStopRule = (answers, sem) => {
  const minQuestions = 10;  // 最小题数
  const maxQuestions = 30;  // 最大题数
  const targetSEM = 0.3;    // 目标标准误
  
  return (answers.length >= minQuestions && sem <= targetSEM) || 
         answers.length >= maxQuestions;
};

// 内容平衡约束
export const applyContentBalance = (questions, answeredQuestions, contentRules) => {
  const contentCounts = {};
  
  // 统计已答题目的内容分布
  answeredQuestions.forEach(q => {
    contentCounts[q.content] = (contentCounts[q.content] || 0) + 1;
  });
  
  // 过滤不符合内容平衡规则的题目
  return questions.filter(question => {
    const count = contentCounts[question.content] || 0;
    const rule = contentRules[question.content];
    return count < rule.max;
  });
};

// 曝光率控制
export const checkExposureControl = (question, exposureRecords, maxExposureRate) => {
  const exposureCount = exposureRecords[question.id] || 0;
  const totalTests = Object.values(exposureRecords).reduce((sum, count) => sum + count, 0);
  
  if (totalTests === 0) return true;
  
  const exposureRate = exposureCount / totalTests;
  return exposureRate <= maxExposureRate;
};