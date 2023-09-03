import request from '@/utils/request'

//查询最新课程
export function mostNew( data ){
	return request({
		url:'/api/course/mostNew',
		method:'post',
		data
	})
}

//获取一级分类
export function getFirstCategorys(){
	return request({
		url:'/api/course/category/getFirstCategorys'
	})
}

//获取二级分类
export function getSecondCategorys( params ){
	return request({
		url:'/api/course/category/getSecondCategorys',
		params
	})
}

//查询课程
export function courseSearch( data ){
	return request({
		url:'/api/course/search',
		method:'post',
		data
	})
}

//查询课程详情
export function getDetail( params ){
	return request({
		url:'/api/course/getDetail',
		params
	})
}

//查询是否有下载权限
export function checkAuth( params ){
	return request({
		url:'/api/course/checkAuth',
		params
	})
}

//下载资料
export function downloadAttachment( params ){
	return request({
		url:'/api/course/downloadAttachment',
		params,
		responseType:'blob'
	})
}

//课程播放
export function player( params ){
	return request({
		url:'/api/player/play',
		params
	})
}

//记录播放历史
// http://testapi.xuexiluxian.cn/api/course/history/recordHistory
export function recordHistory( data ){
	return request({
		url:'/api/course/history/recordHistory',
		data,
		method:'post'
	})
}

//获取最后一次记录
// http://testapi.xuexiluxian.cn/api/course/history/getLastHistoryByChapterId
export function getLastHistoryByChapterId( params ){
	return request({
		url:'/api/course/history/getLastHistoryByChapterId',
		params
	})
}