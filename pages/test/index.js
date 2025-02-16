import { questionBank } from '../../data/questions';
import { selectNextQuestion, calculateSEM, checkStopRule } from '../../utils/question';

Page({
  data: {
    currentQuestion: null,
    selectedOption: -1,
    previousAnswers: [], // 存储之前的答案，用于返回功能
    answeredQuestions: [], // 存储已回答的题目ID和对应答案
    theta: 0,
    sem: 1
  },

  onLoad() {
    // 初始化第一道题
    const firstQuestion = questionBank.questions[0];
    this.setData({ 
      currentQuestion: firstQuestion,
      selectedOption: -1,
      previousAnswers: [],
      answeredQuestions: []
    });
  },

  handleOptionSelect(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ selectedOption: index });
  },

  handleConfirmAnswer() {
    const { currentQuestion, selectedOption, previousAnswers, answeredQuestions, theta } = this.data;
    if (!currentQuestion || selectedOption === -1) return;

    // 记录答案
    const answer = {
      questionId: currentQuestion.id,
      response: selectedOption,
      timestamp: new Date().toISOString()
    };

    // 更新答案历史
    const newAnsweredQuestions = [...answeredQuestions, {
      question: currentQuestion,
      answer: answer
    }];

    const newPreviousAnswers = [...previousAnswers, answer];

     // 计算新的能力值估计和标准误
     const newTheta = this.updateThetaEstimate(newPreviousAnswers);
     const newSem = calculateSEM(newPreviousAnswers, questionBank.questions, newTheta);
 
    // 检查是否满足终止条件
    if (checkStopRule(newPreviousAnswers, newSem)) {
      this.finishTest(newPreviousAnswers, newTheta, newSem);
      return;
    }

    // 选择下一题
    const nextQuestion = selectNextQuestion(
      questionBank.questions,
      newTheta,
      newPreviousAnswers.map(a => a.questionId)
    );

    // 更新状态
    this.setData({
      currentQuestion: nextQuestion,
      selectedOption: -1,
      previousAnswers: newPreviousAnswers,
      answeredQuestions: newAnsweredQuestions,
      theta: newTheta,
      sem: newSem
    });
  },

  handlePrevQuestion() {
    const { answeredQuestions } = this.data;
    if (answeredQuestions.length === 0) return;

    // 移除最后一个答案
    const newAnsweredQuestions = answeredQuestions.slice(0, -1);
    const lastQuestionAnswer = newAnsweredQuestions[newAnsweredQuestions.length - 1];

    if (!lastQuestionAnswer) {
      // 如果没有上一题，返回第一题
      const firstQuestion = questionBank.questions[0];
      this.setData({
        currentQuestion: firstQuestion,
        selectedOption: -1,
        previousAnswers: [],
        answeredQuestions: []
      });
      return;
    }

    // 更新状态
    this.setData({
      currentQuestion: lastQuestionAnswer.question,
      selectedOption: lastQuestionAnswer.answer.response,
      previousAnswers: newAnsweredQuestions.map(qa => qa.answer),
      answeredQuestions: newAnsweredQuestions,
      theta: this.updateThetaEstimate(newAnsweredQuestions.map(qa => qa.answer)),
      sem: calculateSEM(newAnsweredQuestions.map(qa => qa.answer), questionBank.questions, this.data.theta)
    });
  },

  updateThetaEstimate(answers) {
    // 使用 EAP 方法更新能力值估计
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
        const question = questionBank.questions.find(q => q.id === answer.questionId);
        if (question) {
          const p = this.calculateProbability(question.parameters, theta);
          likelihood *= answer.response === 1 ? p : (1 - p);
        }
      });
      
      const posterior = likelihood * prior;
      numerator += theta * posterior;
      denominator += posterior;
    }
    
    return numerator / denominator;
  },

  calculateProbability(params, theta) {
    const { a, b, c } = params;
    const z = a * (theta - b);
    const exp = Math.exp(z);
    return c + ((1 - c) * exp) / (1 + exp);
  },

  handleQuitTest() {
    wx.showModal({
      title: '确认退出',
      content: '测试进度将不会保存，确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  finishTest(answers, theta, sem) {
    const result = {
      id: new Date().getTime().toString(),
      timestamp: new Date().toISOString(),
      answers,
      theta,
      sem,
      duration: this.calculateDuration(answers)
    };

    let history = wx.getStorageSync('testHistory') || [];
    history.push(result);
    wx.setStorageSync('testHistory', history);

    wx.redirectTo({
      url: `/pages/report/index?testId=${result.id}`
    });
  },

  calculateDuration(answers) {
    if (answers.length < 2) return 0;
    const start = new Date(answers[0].timestamp);
    const end = new Date(answers[answers.length - 1].timestamp);
    return Math.round((end - start) / 60000); // 转换为分钟
  },

  updateThetaEstimate(answers) {
    // 使用 EAP 方法更新能力值估计
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
        const question = questionBank.questions.find(q => q.id === answer.questionId);
        const p = this.calculateProbability(question.parameters, theta);
        likelihood *= answer.response === 1 ? p : (1 - p);
      });
      
      const posterior = likelihood * prior;
      numerator += theta * posterior;
      denominator += posterior;
    }
    
    return numerator / denominator;
  },

  calculateProbability(params, theta) {
    const { a, b, c } = params;
    const z = a * (theta - b);
    const exp = Math.exp(z);
    return c + ((1 - c) * exp) / (1 + exp);
  },

  onUnload() {
    // 页面卸载时的清理工作
    this.setData({
      currentQuestion: null,
      selectedOption: -1,
      previousAnswers: [],
      theta: 0,
      sem: 1
    });
  }
});