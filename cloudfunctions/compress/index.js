// 云函数入口文件
const cloud = require('wx-server-sdk')
var JSZip = require('jszip');
var JSZipUtils = require("jszip-utils")

cloud.init()


// 云函数入口函数
exports.main = async (event, context) => {
	var zip = new JSZip();
	var len = event.commitInfo.length;
	for(var i = 0; i < len; i++){
		var fid = event.commitInfo[i].file_id;
		var fname = event.commitInfo[i].file_name;
		var cur = i;

		await cloud.downloadFile({
			fileID: fid
		}).then(res => {
			let data = res.fileContent
			zip.file(fname, data)

			/*if(cur + 1 == len){
				zip.generateAsync({
					type: "nodebuffer",
				}).then(function (content) {
					cloud.uploadFile({
						cloudPath: '导出.zip',
						fileContent: content
					})
				});
			}*/
		})
	}
	zip.generateAsync({
		type: "nodebuffer",
	}).then(function (content) {
		cloud.uploadFile({
			cloudPath: '导出.zip',
			fileContent: content
		})
	});
}