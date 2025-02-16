const cloud = wx.cloud;

async function checkLogin(userId) {
  return await cloud.callFunction({
    name: 'checkLogin',
    data: { userId }
  }).then(res => res.result);
}

module.exports = { checkLogin };
