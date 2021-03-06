//index.js
const app = getApp()
const db = wx.cloud.database()

//用户是否绑定过
function isUserExists(uid){
	var len = app.globalData.studentList[0].content.length;
	for(var i = 0; i < len; i++){
		if(app.globalData.studentList[0].content[i].user_id == uid){
			return true
		}
	}
	return false;
}

function getStudentInfo(id, name){
	var len = app.globalData.studentList[0].content.length;
	for(var i = 0; i < len; i++){
		if(app.globalData.studentList[0].content[i].student_id == id){
			if(app.globalData.studentList[0].content[i].student_name == name){
				return app.globalData.studentList[0].content[i];
			}
			else{
				return {};
			}
		}
	}
	return {};
}

function modifyStudentInfo(id, uid){
	var len = app.globalData.studentList[0].content.length;
	for(var i = 0; i < len; i++){
		if(app.globalData.studentList[0].content[i].student_id == id){
			app.globalData.studentList[0].content[i].user_id = uid;
		}
	}
}

function isNullObj(obj){
	if(Object.keys(obj).length == 0){
		return true;
	}
	else{
		return false;
	}
}

Page({
	data: {
		assignment_available: [],//需要在onload里面载入作业
		binding: false,//这个账号有没有绑定过
		logged: false,//为了便于调用，在这里也保留一份logged的副本
		student_name: "",
		student_id: ""
	},

	onLoad: function() {
		this.setData({
			logged: app.globalData.logged,
			binding: app.globalData.binding,
			student_name: app.globalData.student_name,
			student_id: app.globalData.student_id
		})
	},

	bindAccount: function(e){
		//先从表单里读取数据
		var name = e.detail.value.form_name;
		var id = e.detail.value.form_id;
		var uid = app.globalData.user_id;
		var that = this;

		//一个微信账号只能绑定一人，因此先检查有没有绑定过
		//如果绑定过了，就不能重复绑定了
		if(isUserExists(uid)){
			wx.showModal({
				title: "绑定失败",
				content: "此账号已经绑定了一个微信账号，请勿重复绑定。",
			})
		}
		//如果没有绑定过，就根据表单中获取的数据，去数据库里找有没有这么一个人
		else{
			var stuInfo = getStudentInfo(id, name);
			console.log(stuInfo)

			//找到了
			if(!isNullObj(stuInfo)){

				//先检查这个人有没有绑定过
				var currentBinding = stuInfo.user_id

				//如果还没有绑定过，就绑上去
				if(currentBinding == ""){
					modifyStudentInfo(id, uid);

					//更新服务器数据
					db.collection("studentGroup").doc(app.globalData.studentGroupID).update({
						data: {
							content: app.globalData.studentList[0].content
						},
						success: function(res){
							wx.showToast({
								title: '绑定成功',
								icon: 'success'
							})
							that.setData({
								binding: true,
								student_name: stuInfo.student_name,
								student_id: stuInfo.student_id
							})
							app.globalData.binding = true;
							app.globalData.student_name = stuInfo.student_name;
							app.globalData.student_id = stuInfo.student_id;
							app.globalData.user_id = stuInfo.user_id;
							app.globalData.user_access = stuInfo.user_access;
						}
					})
				}

				//如果这个人已经有绑定了，就不能再绑定新的了
				else{
					wx.showModal({
						title: "绑定失败",
						content: "此账号已经绑定了一个微信账号，请确认信息填写是否有误，或与管理员联系。",
					})
				}
			}

			//没找到，可能是信息填错了
			else{
				wx.showModal({
					title: "绑定失败",
					content: "根据您提供的信息找不到相应的班级成员，请确认信息填写是否有误，或与管理员联系。",
				})
			}
		}
	},

	unlink: function(){
		var that = this
		wx.showModal({
			title: "请确认",
			content: "确定要解除绑定吗？",
			success: function (res) {
				if (res.confirm) {
					modifyStudentInfo(that.data.student_id, "");
					db.collection("studentGroup").doc(app.globalData.studentGroupID).update({
						data: {
							content: app.globalData.studentList[0].content
						},
						success: function(res){
							wx.showToast({
								title: '解除成功',
								icon: 'success'
							})
							that.setData({
								binding: false
							})
							app.globalData.binding = false
						}
					})
				}
			}
		})
	}
})
