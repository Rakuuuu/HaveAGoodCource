import request from '@/utils/request';

//创建Token
export function createToken(){
	return request({
		url:'/api/token/createToken',
	})
};