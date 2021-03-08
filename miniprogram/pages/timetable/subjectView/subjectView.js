//index.js
const app = getApp()
const db = wx.cloud.database()


Page({
	data: {
		classInfo: null
	},

	onLoad: function(arg) {
		var ID = arg.id
		var allClass = wx.getStorageSync("timetable")
		var len = allClass.length
		for(let i = 0; i < len; i++){
			if(allClass[i].ID == ID){
				this.setData({
					classInfo: allClass[i]
				})
				break
			}
		}
	},
})
