//index.js
const app = getApp()
const md5 = require("./md5.js")
const db = wx.cloud.database()

//用户是否绑定过
function isUserExists(uid){
	var result = 0;
	console.log(app.globalData.studentList[0].content)
	var len = app.globalData.studentList[0].content.length;
	for(var i = 0; i < len; i++){
		if(app.globalData.studentList[0].content[i].user_id == uid){
			result++;
		}
	}
	return result;
}

function getStudentInfo(uid){
	var len = app.globalData.studentList[0].content.length;
	for(var i = 0; i < len; i++){
		if(app.globalData.studentList[0].content[i].user_id == uid){
			return app.globalData.studentList[0].content[i];
		}
	}
}

Page({
	data: {
		avatarUrl: './user-unlogin.png',
		userInfo: {},
		takeSession: false,
		requestResult: '',
		service_available: [
			{display: "收/交作业", jump_to: "../assignment/index/index"}, 
			{display: "绑定账号", jump_to: "../account/account"}
		],
		logged: false
	},

	jump: function(arg){
		var path=arg.currentTarget.dataset.jump_to;
		wx.navigateTo({url: path})
	},

	onLoad: function() {
		// 获取用户信息
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							this.setData({
								avatarUrl: res.userInfo.avatarUrl,
								userInfo: res.userInfo
							})
						}
					})
				}
			}
		})
		db.collection("studentGroup").get({
			success: function(res){
				app.globalData.studentList = res.data;
				app.globalData.studentGroupID = res.data[0]._id;
			}
		})
	},

	onGetUserInfo: function(e) {
		if (!app.globalData.logged && e.detail.userInfo) {
			this.setData({
				avatarUrl: e.detail.userInfo.avatarUrl,
				userInfo: e.detail.userInfo
			})
			//这个是示例里面的代码，我把logged改成全局变量了
			//但说实话这段代码我没仔细看过，这里为什么修改logged我也不知道
			//但因为本来就有这么一句我就留着了
			app.globalData.logged = true;
		}
	},

	/*getStudentInfo: function(user_id){
		db.collection('students').where({
			user_id: db.command.neq(user_id)
		})
		.get({
			success: function(res) {
				console.log(res.data)
			}
		})
	},*/

	onGetOpenid: function() {
		wx.showToast({
			title: '登录中',
			icon: 'loading',
			duration: 1500,
			success: function(){
				wx.showToast({
					title: '登陆成功',
					icon: 'success',
					duration: 1500
				})
			}
		})
// 调用云函数获取openid
		var that = this
		wx.cloud.callFunction({
			name: 'login',
			data: {},

			//如果成功获取
			success: res => {

				//拿到openid之后进行hash
				var uid = md5(res.result.openid);

				//按用户的openid查询数据库中有无相应记录
				var n = isUserExists(uid);

				//open-id是hash过的，所以要处理hash碰撞……虽然我觉得基本上不可能会有这种情况发生
				if(n > 1){
					wx.showToast({
						title: "内部错误",	
						icon: 'success'
					})
				}

				//如果没有碰撞就读取学生信息
				else if(n == 1){
					var stuInfo = getStudentInfo(uid);
					app.globalData.student_id = stuInfo.student_id;
					app.globalData.student_name = stuInfo.student_name;
					app.globalData.user_access = stuInfo.user_access;
					app.globalData.user_id = uid;
					app.globalData.logged = true;
					app.globalData.binding = true;
					that.setData({
						logged: true
					})
					wx.showToast({
						title: '登录成功',
						icon: 'success'
					})
				}

				//如果没有记录，说明未注册，跳转到关联页面
				else{
					app.globalData.logged = true;
					app.globalData.user_id = uid;
					app.globalData.binding = false;
					that.setData({
						logged: true
					})
					wx.navigateTo({url: "../account/account"})
				}
			}
		})
	},
})
