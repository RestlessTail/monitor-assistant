//app.js
App({
	onLaunch: function () {
		if (!wx.cloud) {
		console.error('请使用 2.2.3 或以上的基础库以使用云能力')
		} else {
		wx.cloud.init({
					// env 参数说明：
					//	 env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
					//	 此处请填入环境 ID, 环境 ID 可打开云控制台查看
					//	 如不填则使用默认环境（第一个创建的环境）
					// env: 'my-env-id',
					traceUser: true,
			})
		}
	},


	globalData: {
		student_id: "",
		student_name: "",
		//用户权限
		//0为普通用户，没有特殊权限
		//1为管理员，可以布置作业
		user_access: 0,
		user_id:"",
		logged: false,
		binding: false,
		//全部学生的信息列表
		studentList: [],
		studentGroupID: ""
	}
})
