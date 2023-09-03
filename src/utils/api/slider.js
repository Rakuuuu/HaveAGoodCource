import request from '@/utils/request'

//获取轮播图
export function getSliders(){
	return request({
		url:'/api/slider/getSliders'
	})
}