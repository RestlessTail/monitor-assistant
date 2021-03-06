//index.js
const app = getApp()
const db = wx.cloud.database()

Page({
	data: {
		assignment_available: [],//需要在onload里面载入作业
		user_access: 0,
		binding: false,
		logged: false
	},

	jump: function(arg){
		var path=arg.currentTarget.dataset.jump_to;
		wx.navigateTo({
			url: path
		})
	},

	onLoad: function() {
		console.log("onLoad")
		var that = this
		that.setData({
			binding: app.globalData.binding,
			logged: app.globalData.logged,
			user_access: app.globalData.user_access
		})
		db.collection("assignments").get({
			success: function(res) {
				that.setData({
					assignment_available: res.data
				})
			}
		})
	},

	new_assignment: function(){
		wx.navigateTo({
			url: "../newAssignment/newAssignment"
		})
	},

	assignmentDetails: function(e){
		var arg = e.currentTarget.dataset.item._id
		wx.navigateTo({
			url: "../detail/detail?assignment=" + arg
		})
	},

	refresh: function(){
		var that = this;
		db.collection("assignments").get({
			success: function(res) {
				that.setData({
					assignment_available: res.data
				})
				console.log(res.data)
			}
		})
	}
})
