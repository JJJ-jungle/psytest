// 存储键名常量
const KEYS = {
  USER_INFO: 'userInfo',
  TEST_HISTORY: 'testHistory',
  QUESTION_BANK: 'questionBank',
  EXPOSURE_RECORDS: 'exposureRecords',
  CURRENT_TEST: 'currentTest'
};

// 获取用户信息
export const getUserInfo = () => {
  return wx.getStorageSync(KEYS.USER_INFO) || null;
};

// 保存用户信息
export const saveUserInfo = (userInfo) => {
  wx.setStorageSync(KEYS.USER_INFO, userInfo);
};

// 获取题库
export const getQuestionBank = () => {
  return wx.getStorageSync(KEYS.QUESTION_BANK) || [];
};

// 初始化/更新题库
export const initQuestionBank = (questions) => {
  wx.setStorageSync(KEYS.QUESTION_BANK, questions);
};

// 获取测评历史
export const getTestHistory = () => {
  return wx.getStorageSync(KEYS.TEST_HISTORY) || [];
};

// 保存测评结果
export const saveTestResult = (result) => {
  const history = getTestHistory();
  history.push({
    ...result,
    timestamp: new Date().toISOString()
  });
  wx.setStorageSync(KEYS.TEST_HISTORY, history);
};

// 获取指定日期的测评结果
export const getTestResult = (date) => {
  const history = getTestHistory();
  return history.find(item => item.timestamp === date);
};

// 获取题目曝光记录
export const getExposureRecords = () => {
  return wx.getStorageSync(KEYS.EXPOSURE_RECORDS) || {};
};

// 更新题目曝光记录
export const updateExposureRecord = (questionId) => {
  const records = getExposureRecords();
  records[questionId] = (records[questionId] || 0) + 1;
  wx.setStorageSync(KEYS.EXPOSURE_RECORDS, records);
};

// 保存当前测评进度
export const saveCurrentTest = (testData) => {
  wx.setStorageSync(KEYS.CURRENT_TEST, testData);
};

// 获取当前测评进度
export const getCurrentTest = () => {
  return wx.getStorageSync(KEYS.CURRENT_TEST) || null;
};

// 清除当前测评进度
export const clearCurrentTest = () => {
  wx.removeStorageSync(KEYS.CURRENT_TEST);
};

// 清除所有数据（用于重置）
export const clearAllData = () => {
  Object.values(KEYS).forEach(key => {
    wx.removeStorageSync(key);
  });
};

// 导出测评数据
export const exportTestData = async () => {
  const data = {
    history: getTestHistory(),
    exposureRecords: getExposureRecords(),
    questionBank: getQuestionBank()
  };
  
  return new Promise((resolve, reject) => {
    wx.getSavedFileList({
      success: (res) => {
        res.fileList.forEach((file) => {
          wx.removeSavedFile({
            filePath: file.filePath
          });
        });
        
        const fileName = `test_data_${new Date().getTime()}.json`;
        wx.setStorage({
          key: fileName,
          data: JSON.stringify(data),
          success: () => resolve(fileName),
          fail: reject
        });
      },
      fail: reject
    });
  });
};

// 导入测评数据
export const importTestData = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: filePath,
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          
          // 验证数据格式
          if (!data.history || !data.exposureRecords || !data.questionBank) {
            throw new Error('Invalid data format');
          }
          
          // 更新本地存储
          wx.setStorageSync(KEYS.TEST_HISTORY, data.history);
          wx.setStorageSync(KEYS.EXPOSURE_RECORDS, data.exposureRecords);
          wx.setStorageSync(KEYS.QUESTION_BANK, data.questionBank);
          
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      fail: reject
    });
  });
};