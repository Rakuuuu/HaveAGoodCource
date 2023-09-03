import { defineStore } from 'pinia';
export const useUserStore = defineStore({
  id: 'user',
  state: () => {
    return {
      token: '',
	  userInfo:{}
    }
  },
  actions:{
  	setToken( token ){
  		this.token = token;
  	},
	cleanToken(){
		this.token = '';
		this.userInfo = {};
	}
  },
  // 开启数据缓存
  persist: {
	//开启持久化
    enabled: true,
	// 选择存储方式和内容
    strategies: [{
      key: 'xiaoluxian_user',
      storage: localStorage,
      paths: ['token','userInfo']//state 中的字段名，按组打包储存
    }]
  }
})