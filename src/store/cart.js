import { defineStore } from 'pinia';
export const useCartStore = defineStore({
  id: 'cart',
  state: () => {
    return {
		cartList:[],
		select:[],//已选择的商品
		checkedAll: false,
		orderList:[]
    }
  },
  getters:{
	  isCheckedAll(){
		  return this.cartList.length === this.select.length && this.cartList.length !== 0 && this.select.length !== 0;
	  },
	  totalPrice(){
		  return this.cartList.reduce((front,current,index,arr)=>{
			  return front + arr[index].discountPrice * arr[index].counter * (arr[index].check?1:0);
		  }, 0)
	  }
  },
  actions:{
	  addCart(list){
		  list.forEach(v=>{
			  v['check'] = false;
		  });
		  
		  this.cartList = list;
	  },
	  selectAll(){
		  this.select = this.cartList.map(v=>{
			  v['check'] = true;
			  return v.id;
		  });
		  // console.log('selected',this.select,this.cartList);
		  this.checkedAll = this.isCheckedAll;
		  // console.log(this.checkedAll);
	  },
	  unSelectAll(){
		  this.cartList.forEach(v=>{
			  v['check'] = false;
		  });
		  this.select = [];
		  // console.log('unselected',this.select,this.cartList);
		  this.checkedAll = this.isCheckedAll;
		  // console.log(this.checkedAll);
	  },
	  selectOne(id){
		  this.select.push(id);
		  this.cartList.forEach((v)=>{
			  if(v.id===id)
				v.check= true;
		  });
		  // console.log('selected-one',this.select,this.cartList);
		  this.checkedAll = this.isCheckedAll;
		  // console.log(this.checkedAll);
	  },
	  unSelectOne(id){
		  this.select = this.select.filter((v)=>{
			  return v!==id;
		  });
		  this.cartList.forEach((v)=>{
			  if(v.id===id)
				v.check= false;
		  });
		  // console.log('unselected-one',this.select,this.cartList);
		  this.checkedAll = this.isCheckedAll;
		  // console.log(this.checkedAll);
	  }
  },
  // 开启数据缓存
  persist: {
  	//开启持久化
    enabled: true,
  	// 选择存储方式和内容
    strategies: [{
      key: 'xiaoluxian_orderList_buff',
      storage: sessionStorage,
      paths: ['orderList']//state 中的字段名，按组打包储存
    }]
  }
});