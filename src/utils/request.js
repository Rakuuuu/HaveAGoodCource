import axios from 'axios';
//pinia在header加入token
import {useUserStore} from '@/store/user';

//1. 创建axios对象
const service = axios.create();

//2. 请求拦截器
service.interceptors.request.use(config => {
	const userStore = useUserStore();
	if(userStore.token){
		config.headers['Authorization'] = userStore.token;
	}
	return config;
}, error => {
	Promise.reject(error);
});

//3. 响应拦截器
service.interceptors.response.use(response => {
	//判断code码
	return response.data;
},error => {
	return Promise.reject(error);
});

export default service;