//index.js
const app = getApp()
const db = wx.cloud.database()

//查找数组中有没有指定的student_id，这是为了得知这个学生之前有没有提交过作业
function searchStudentID(student_id, array){
	var len = array.length;
	for(var i = 0; i < len; i++){
		if(array[i].student_id == student_id){
			return true;
		}
	}
	return false
}

//根据student_id查找file_id
function searchFileID(student_id, array){
	var len = array.length;
	for(var i = 0; i < len; i++){
		if(array[i].student_id == student_id){
			return array[i].file_id;
		}
	}
	return "";
}

//根据student_id修改file_id
function modifyFileID(student_id, array, file_id){
	var len = array.length;
	for(var i = 0; i < len; i++){
		if(array[i].student_id == student_id){
			array[i].file_id = file_id;
			return true;
		}
	}
	return false
}

function modifyFilename(student_id, array, filename){
	var len = array.length;
	for(var i = 0; i < len; i++){
		if(array[i].student_id == student_id){
			array[i].file_name = filename;
			return true;
		}
	}
	return false
}

Page({
	data: {
		header: null,
		deadline: null,
		commit: false,
		assignment_id: null,
		student_name: null,
		student_id: null,
		user_access: 0,
		commits: []
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
					student_name: app.globalData.student_name,
					student_id: app.globalData.student_id,
					user_access: app.globalData.user_access
				})

				//我猜setData这个函数设置变量应该是没有先后顺序的，所以在调用searchStudentID时一直返回false
				//（因为调用的时候that.data.student_id和res.data.commits还没有被赋值）
				//把commit的设置单独拎出来写一句就正常了
				that.setData({
					commit: searchStudentID(that.data.student_id, res.data.commits)
				})
			},
			fail: function(){
				wx.showModal({
					title: "记录读取错误",
					content: "无法读取记录，请尝试退出后重新进入本页面。如果问题继续，请联系管理员。",
				})
			}
		})
	},

	upload: function(){
		var that = this;

		//选择本地文件
		wx.chooseMessageFile({
			conut: 1,
			success: function(res){

				//获取文件的临时路径
				var tempPath = res.tempFiles[0].path;

				//获取扩展名
				var extension = tempPath.split('.').pop();

				//上传文件
				wx.cloud.uploadFile({

					//拼接服务器上储存的文件名
					cloudPath: "assignmentStorage/" + that.data.assignment_id + "/"
						+ that.data.student_id + that.data.student_name + "." + extension,
					filePath: tempPath,

					//上传成功后，更新已提交的学生名单
					success: res => {

						//如果之前已经提交过
						if(searchStudentID(that.data.student_id, that.data.commits)){

							//先删除原有文件
							wx.cloud.deleteFile({
								fileList: [searchFileID(that.data.student_id, that.data.commits)],
								fail: function(res){
									wx.showModal({
										title: "文件删除错误",
										content: "无法删除原有文件，请联系管理员。",
									})
								}
							})

							//修改提交记录中的文件ID
							modifyFileID(that.data.student_id, that.data.commits, res.fileID)
							//modifyFileID(that.data.student_id, that.data.commits, that.data.student_id + that.data.student_name + "." + extension)

						}

						//如果之前没提交过
						else{

							//把提交记录追加写入
							that.data.commits.push({
								student_id: that.data.student_id,
								file_id: res.fileID,
								file_name: that.data.student_id + that.data.student_name + "." + extension
							})
						}

						//更新服务器上的提交名单
						db.collection("assignments").where({
							_id: that.data.assignment_id
						}).update({
							data:{
								commits: that.data.commits
							},
							success: function(res){
								wx.showToast({
									title: '上传成功',
									icon: 'success'
								})
								that.setData({
									commit: searchStudentID(that.data.student_id, that.data.commits)
								})
							},
							fail: function(res){
								wx.showModal({
									title: "数据库错误",
									content: "您的文件已上传，但在更新数据库状态时发生错误。请重试，如果问题继续，请联系管理员。",
								})
							}
						})
					},
					fail: function(res){
						wx.showModal({
							title: "上传失败",
							content: "上传失败，请检查您的网络连接并重试。如果问题继续，请联系管理员。",
						})
					}
				})
			},
			fail: function(res){
				wx.showModal({
					title: "上传失败",
					content: "上传失败，请重试。如果问题继续，请联系管理员。",
				})
			}
		})
	},

	assignment_management: function(){
		wx.navigateTo({
			url: "./assignmentManagement/assignmentManagement?assignment=" + this.data.assignment_id
		})
	}

})
