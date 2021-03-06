//index.js
const app = getApp()
const db = wx.cloud.database()
//const JSZip = require("./jszip.min.js")

function getUncommitted(commits){
	var len1 = app.globalData.studentList[0].content.length;
	var len2 = commits.length;
	var result = [];
	var isCommit = false;
	for(var i = 0; i < len1; i++){
		isCommit = false;
		for(var j = 0; j < len2; j++){
			if(app.globalData.studentList[0].content[i].student_id == commits[j].student_id){
				isCommit = true;
				break;
			}
		}
		if(!isCommit){
			result.push(app.globalData.studentList[0].content[i].student_id)
		}
	}
	return result;
}

Page({
	data: {
		header: "",
		deadline: "",
		assignment_id: "",
		commits: [],
		uncommitted: [],
		removeConfirm: false,
		output_file_id: ""
	},

	onLoad: function(arg) {
		var id = arg.assignment;
		var that = this;
		db.collection("assignments").doc(id).get({
			success: function(res){
				that.setData({
					header: res.data.header,
					deadline: res.data.deadline,
					assignment_id: res.data._id,
					commits: res.data.commits,
					uncommitted: getUncommitted(res.data.commits)
				})
				console.log(that.data.uncommitted)
			},
			fail: function(){
				wx.showModal({
					title: "记录读取错误",
					content: "无法读取记录，请尝试退出后重新进入本页面。如果问题继续，请联系管理员。",
				})
			}
		})
		db.collection("config").get({
			success: function(res){
				that.setData({
					output_file_id: res.data[0].output_file_id
				})
			}
		})
	},

	show_hidden_box: function(){
		this.setData({
			removeConfirm: true
		})
	},

	hide: function(){
		this.setData({
			removeConfirm: false
		})
	},

	submit: function(e){

		//获取确认删除的信息
		var confirm = e.detail.value.confirm
		var that = this;

		//如果确认删除
		if(confirm == that.data.header){

			//获取全部文件列表
			var delList = [];
			var len = that.data.commits.length
			for(var i = 0; i < len; i++){
				delList.push(that.data.commits[i].file_id);
			}

			//删除全部文件
			wx.cloud.deleteFile({
				fileList: delList,
				success: res => {

					//这个云函数只能删除空目录，因此需要在清空文件后执行
					wx.cloud.callFunction({
						name: "removeDirectory",
						data: {
							path: "assignmentStorage/" + that.data.assignment_id
						},
						success: function(res){

							//清除数据库中的作业记录
							db.collection("assignments").doc(that.data.assignment_id).remove({
								success: function(res){
									wx.showToast({
										title: '已删除',
										icon: 'success',
										duration: 1500,
										success: function(){
											setTimeout(function () {
												wx.navigateBack({
													delta: 2
												})
											}, 1500) //延迟时间
										}
									})
								}
							})
						}
					})
				},
				fail: err => {
					wx.showModal({
						title: "删除失败",
						content: "无法删除文件，请尝试退出后重新进入本页面。如果问题继续，请联系管理员。",
					})
				}
			})	
		}
	},

	download: function(){
		var that = this;
		console.log(that.data.commits)
		wx.cloud.callFunction({
			name: "compress",
			data: {
				commitInfo: that.data.commits
			},
			success: function(res){
				var arg = [];

				//本来在云函数调用的时候可以返回fileID的，但不知道为什么一直返回null。
				//不过因为是生成在固定位置的，fileID倒也不会变，只好写死了
				arg.push(that.data.output_file_id)
				console.log(arg)
				wx.cloud.getTempFileURL({
					fileList: arg,
					success: res => {
						console.log(res)
						wx.setClipboardData({
							data: res.fileList[0].tempFileURL,
							success (res) {
								wx.showModal({
									title: "请在浏览器中下载文件",
									content: "下载链接已经复制到剪贴板，现在你可以在浏览器中下载文件。",
								})
							},
							fail: console.error
						})
					},
					fail: console.error
				})
			},
			fail: console.error
		})	
	}
})
