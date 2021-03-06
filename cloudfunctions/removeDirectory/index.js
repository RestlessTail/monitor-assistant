// 云函数入口文件
const cloud = require('wx-server-sdk')

/*cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()

	return {
		event,
		openid: wxContext.OPENID,
		appid: wxContext.APPID,
		unionid: wxContext.UNIONID,
	}
}
*/
const CloudBase = require("@cloudbase/manager-node")

const { storage } = new CloudBase({
	//secretId: "Your SecretId",
	//secretKey: "Your SecretKey",
	//envId: "", // 云开发环境ID，可在腾讯云云开发控制台获取
});

exports.main = async (event, context) => {
	let path = event.path;
	console.log(event)
	try{
		await storage.deleteDirectory([path])
	}
	catch(e){
		console.log(e)
	}
};
