//index.js
const app = getApp()
const db = wx.cloud.database()

Page({
	data: {
		assignment_available: [],//需要在onload里面载入作业
		user_access: 0,
		deadline: "点击设置"
	},
	
	onLoad: function() {
	},

	setDeadline: function(e){
		this.setData({
			deadline: e.detail.value
		})
	},

	submit: function(e){
		var a_header = e.detail.value.header
		var a_deadline = e.detail.value.ddl

		//检查是否没有输入日期直接提交（检查日期格式是否符合要求）
		var res = a_deadline.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);

		//如果没有输入日期
		if(res == null){
			wx.showModal({
				title: "日期格式错误",
				content: "请检查是否输入了正确的日期。",
			})
		}
		//如果日期格式正确
		else{
			db.collection("assignments").add({
				data: {
					header: a_header,
					deadline: a_deadline,
					commits: []
				},
				success: function(res) {
					wx.showToast({
						title: "成功",
						icon: 'success'
					})
					wx.navigateBack()
				}
			})
		}
	}
})
