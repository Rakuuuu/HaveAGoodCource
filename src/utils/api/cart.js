import request from '@/utils/request';

//获取购物车商品
export function getShopCarList(){
	return request({
		url:'/api/shopcar/getShopCarList'
	})
}

//删除购物车商品
export function deleteShopCar( params ,token){
	return request({
		url:'/api/shopcar/deleteShopCar',
		params,
		headers:{
			token
		}
	})
}
//删除多个购物车商品
// http://testapi.xuexiluxian.cn/api/shopcar/deleteShopCars
export function deleteShopCars( data ,token){
	return request({
		url:'/api/shopcar/deleteShopCars',
		data,
		method:'post',
		headers:{
			token
		}
	})
}

//加入购物车
// http://testapi.xuexiluxian.cn/api/shopcar/addShopCar
export function addShopCar( data ,token){
	return request({
		url:'/api/shopcar/addShopCar',
		data,
		method:'post',
		headers:{
			token
		}
	})
}