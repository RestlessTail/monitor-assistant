//index.js
const app = getApp()
const db = wx.cloud.database()

function timetableToday(that){
	var d = new Date()
	var today = d.getFullYear()
	var month = d.getMonth() + 1
	var day = d.getDate()
	if(month < 10){
		today += ("-0" + month)
	}
	else {
		today += ("-" + month)
	}
	if(day < 10){
		today += ("-0" + day)
	}
	else {
		today += ("-" + day)
	}

	var localTimetable = wx.getStorageSync("timetable")
	var len = localTimetable.length
	var allClass = []
	for(let i = 0; i < len; i++){
		if(localTimetable[i].Date == today){
			allClass.push(localTimetable[i])
		}
	}
	for(let i = 0; i < allClass.length; i++){
		for(let j = i; j < allClass.length; j++){
			if(allClass[i].SessionBegin > allClass[j].SessionBegin){
				let temp = allClass[i]
				allClass[i] = allClass[j]
				allClass[j] = temp
			}
		}
	}
	console.log(allClass)
	that.setData({
		timetable: allClass
	})

}

function refresh(){
	db.collection("timetable").get({
		success: function(res) {
			wx.setStorageSync("timetable", res.data[0].content)
		},
		fail: function(){
			wx.showModal({
				title: "刷新失败",
				content: "刷新失败，请检查网络连接，或稍后重试。"
			})
		}
	})
}

Page({
	data: {
		date: null,
		timetable: []
	},

	onLoad: function() {
		if(wx.getStorageSync("timetable") == ""){
			refresh();
		}
		timetableToday(this)
	},
	refresh: function(){
		refresh();
	},

	jump: function(arg){
		var ID = arg.currentTarget.dataset.subjectid;
		wx.navigateTo({url: "../subjectView/subjectView?id=" + ID})
	},

	weekView: function(){
		wx.navigateTo({url: "../weekView/weekView"})
	}
})
