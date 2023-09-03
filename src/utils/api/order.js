import request from '@/utils/request';

// http://testapi.xuexiluxian.cn/api/order/settlement
export function settlement( data ){
	return request({
		url:'/api/order/settlement',
		data,
		method:'post',
		// headers:{
		// 	token
		// }
	})
}

// http://testapi.xuexiluxian.cn/api/pay/alipay/createOrder
export function createAlipayOrder( data ){
	return request({
		url:'/api/pay/alipay/createOrder',
		data,
		method:'post'
	})
}

// http://testapi.xuexiluxian.cn/api/pay/alipay/queryOrder
export function queryOrderAlipay( params ){
	return request({
		url:'/api/pay/alipay/queryOrder',
		params
	})
}

//http://testapi.xuexiluxian.cn/api/pay/wxpay/createOrder
export function createWechatOrder( data ){
	return request({
		url:'/api/pay/wxpay/createOrder',
		data,
		method:'post'
	})
}

// http://testapi.xuexiluxian.cn/api/pay/wxpay/queryOrder
export function queryOrderWechatpay( params ){
	return request({
		url:'/api/pay/wxpay/queryOrder',
		params
	})
}