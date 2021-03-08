//index.js
const app = getApp()
const db = wx.cloud.database()

function getFormattedDate(d){
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
	return today;
}

function getWeekTimetable(that){
	var d = new Date()
	d.setDate(d.getDate() - d.getDay())
	
	var localTimetable = wx.getStorageSync("timetable")
	var len = localTimetable.length
	var allClassThisWeek = []
	for(let i = 0; i < 7; i++){
		var allClassToday = []
		var today = getFormattedDate(d)
		for(let i = 0; i < len; i++){
			if(localTimetable[i].Date == today){
				allClassToday.push(localTimetable[i])
			}
		}
		for(let i = 0; i < allClassToday.length; i++){
			for(let j = i; j < allClassToday.length; j++){
				if(allClassToday[i].SessionBegin > allClassToday[j].SessionBegin){
					let temp = allClassToday[i]
					allClassToday[i] = allClassToday[j]
					allClassToday[j] = temp
				}
			}
		}
		allClassThisWeek.push(allClassToday)
		d.setDate(d.getDate() + 1)
	}
	console.log(allClassThisWeek)
	that.setData({
		allClass: allClassThisWeek
	})
}

Page({
	data: {
		allClass: null
	},

	onLoad: function() {
		getWeekTimetable(this)
	},

	dayView: function(){
		wx.navigateBack()
	}
})
