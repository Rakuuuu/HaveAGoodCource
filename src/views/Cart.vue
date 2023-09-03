<template>
	<Header></Header>
	<div class="fixed">
		<div class="bgColor">
			<h1 class="main-shopcart">购物车</h1>
		</div>
		<div class="container">
			<div class="main">
				<div class="nav">
					<span class="left">全部课程</span>
				</div>
				<ul class="head" v-if='cartList.length !== 0'>
					<li class="item check">
						<el-checkbox v-model="checkedAll" @change="changeCheckAll" :disabled='cartList.length === 0'>全选</el-checkbox>
					</li>
					<li class="item classInfo">课程信息</li>
					<li class="item price">单价</li>
					<li class="item count">数量</li>
					<li class="item total">金额</li>
					<li class="item function">操作</li>
				</ul>
				<div v-if="cartList.length > 0">
					<ul 
						class="haveorder" 
						v-for="item in cartList" 
						:key='item.id'
					>
						<li class="order-item">
							<el-checkbox 
								v-model="item.check"
								@change="selectItem($event, item.id)"
							></el-checkbox>
						</li>
						<li class="order-item info" @click="toDetail(item.courseId)">
							<div class="courseimg">
								<img :src="item.courseCover"  alt="">
							</div>
							<div class="course-name">{{item.courseName}}</div>
						</li>

						<li class="order-item">
							￥{{item.discountPrice}}
						</li>
						<li class="order-item num">{{item.counter}}</li>
						<li class="order-item totoalprice">{{item.counter * item.discountPrice}}</li>
						<li class="order-item delete">
							<a href="javascript:;">
								<i class="el-icon-delete"></i>
								<span class="deletd-text" @click="deleteItem(item.id)">删除</span>
							</a>
						</li>
					</ul>
				</div>
				<div class="noOrder" v-else>
					<img src="@/assets/img/empty.png" alt="">
					<div class="order-alert">哎呦！暂无订单</div>
				</div>
				<el-divider class="line"></el-divider>
				<ul class="foot">
					<li class="foot-item delete-items" @click="deleteItems">删除选中</li>
					<li class="foot-item">已选课程<span class="unique">{{select.length}}</span></li>
					<li class="foot-item">合计<span class="unique">￥{{totalPrice.toFixed(2)}}</span></li>
					<li>
						<button class="btn" @click="toConfirmOrder">去结算</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<Footer></Footer>
</template>

<script setup>
	//element
	import { ElMessageBox } from 'element-plus';
	import { ElMessage } from 'element-plus';
	//组件
	import Header from '@/components/common/Header.vue'
	import Footer from '@/components/common/Footer.vue'
	import {
		getShopCarList,
		deleteShopCar,
		deleteShopCars
	} from '@/utils/api/cart';
	import {
		createToken
	} from '@/utils/api/createToken';
	import {
		onBeforeMount
	} from 'vue';
	import {
		useCartStore
	} from '@/store/cart';
	import {
		storeToRefs
	} from 'pinia';
import { useRoute, useRouter } from 'vue-router';

	let {
		cartList,
		select,
		checkedAll,
		orderList,
		totalPrice
	} = storeToRefs(useCartStore());
	
	let router = useRouter();

	onBeforeMount(() => {
		select.value = [];
		cartList.value = [];
		getShopCarList().then(res => {
			// console.log(res.data.list);
			useCartStore().addCart(res.data.list);
			// console.log('cartList', cartList.value);
		});
	});
	
	const toDetail = (id) =>{
		router.push({
			path:`/course/detail/:id`,
			name:'detail',//带param传参一定要加上
			params:{
				id: id
			}
		})
	}
	
	const changeCheckAll = (value) =>{
		if(!value)
			useCartStore().unSelectAll();
		else
			useCartStore().selectAll();
	}
	
	const selectItem = (value, id) =>{
		if(!value)
			useCartStore().unSelectOne(id);
		else
			useCartStore().selectOne(id);
	};
	
	const deleteItem = (id) =>{
		ElMessageBox.confirm('确定删除该课程吗？', '删除', {
		      confirmButtonText: '确定',
		      cancelButtonText: '取消',
		      type: 'warning'
		    }).then(() => {
		      createToken().then(res=>{
		        let token = res.data.token;
		        deleteShopCar({
		          id
		        },token).then(res=>{
					// console.log(res);
					if(res.meta.code === '200'){
						ElMessage.success({
						    message: '删除成功!'
						  });
						  getShopCarList().then(res => {
						  	// console.log(res.data.list);
						  	useCartStore().addCart(res.data.list);
						  	// console.log('cartList', cartList.value);
						  });
					} else {
						ElMessage.error({
						    message: res.meta.msg
						  });
					}
					}).catch((err)=> {
					  ElMessage.warning({
					    message: err
					  });
				})
		      })
		      
		    }).catch(()=>{
				
			});
	}
	
	const deleteItems = () =>{
		
		let toDeletes = cartList.value.filter((v)=>{
								  return v.check;
		});
		
		let toDeletesId = toDeletes.map((v)=>{
								  return v.id;
		});
		if(toDeletes.length === 0){
			ElMessage({
				type:'warning',
				message:'未选中任何课程'
			});
			return;
		}
		
		ElMessageBox.confirm('确定删除选中课程吗？', '删除', {
		      confirmButtonText: '确定',
		      cancelButtonText: '取消',
		      type: 'warning'
		    }).then(() => {
		      createToken().then(res=>{
				  if(res.meta.code !== '200'){
					  ElMessage({
					    message: res.meta.msg,
					    type:'error'
					  });
				  } else {
					  let token = res.data.token;

					  
					  console.log(toDeletesId);
					  deleteShopCars(toDeletesId,token).then(res=>{
					  	console.log(res);
						if(res.meta.code === '200'){
							ElMessage.success({
							    message: '删除成功!'
							});
							
							//初始化购物车列表
							select.value = [];
							cartList.value = [];
							checkedAll.value = false;
							
							getShopCarList().then(res => {
								// console.log(res.data.list);
								useCartStore().addCart(res.data.list);
								// console.log('cartList', cartList.value);
							});
							
						} else {
							ElMessage({
							    message: res.meta.msg,
								type:'warning'
							});
						}
					  	},err => {
					  	  ElMessage.error({
					  	    message: '请求失败'
					  	  });
					  });
				  }

		      })
		    }).catch(()=>{
			});
	}
	
	const toConfirmOrder = () =>{
		console.log(select.value);
		if(select.value.length === 0){
			ElMessage({
				type: 'warning',
				message:'请选择至少一门课程'
			});
			return;
		};
		orderList.value = [];//清空缓存
		
		orderList.value = cartList.value.filter((v)=>{
			return v.check;
		});//筛选已选中的
		
		orderList.value = orderList.value.map((v)=>{
			return{
				number:v.counter,
				id:v.courseId
			}
		});
		router.push('/confirm-order');
		// console.log(orderList.value);
	}
	
	
	
</script>
<style scoped>
	.fixed {
		width: 100%;
		height: 100%;
		background: #FFFFFF;
	}

	.bgColor {
		width: 100%;
		height: 200px;
		background-color: red;
		background: linear-gradient(-45deg, #ee7752, #e73c7e, #5555ff, #23d5ab);
		background-size: 400% 400%;
		animation: gradient 15s ease infinite;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}

		25% {
			background-position: 50% 50%;
		}

		50% {
			background-position: 100% 50%;
		}

		75% {
			background-position: 50% 50%;
		}

		100% {
			background-position: 0% 50%;
		}
	}

	.container {
		width: 1200px;
		margin: -100px auto 50px auto;
		background: #f7f9fd;
		border-radius: 12px;
		box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
	}

	.main {
		padding: 20px;
		border-radius: 5px;
	}

	.main-shop {
		position: relative;
		display: flex;
		align-content: center;
	}

	.main-shop i {
		font-size: 35px;
		padding: 20px 10px 0 0;
		color: #FF4400;
		font-weight: bold;
	}

	.main-shopcart {
		width: 1200px;
		margin: 0 auto;
		height: 42px;
		font-size: 24px;
		font-family: Microsoft YaHei;
		font-weight: bold;
		line-height: 35px;
		color: #FFFFFF;
		padding: 30px 0;
		opacity: 1;
	}

	.nav {
		display: flex;
		justify-content: space-between;
		border-bottom: 2px solid #E6E6E6;

	}

	.nav .left {
		width: 80px;
		height: 26px;
		font-size: 18px;
		font-family: Microsoft YaHei;
		font-weight: bold;
		line-height: 0px;
		color: #FF4400;
		opacity: 1;
		border-bottom: 2px solid #FF4400;
	}

	.nav .right {
		width: 108px;
		height: 24px;
		font-size: 14px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		line-height: 0px;
		color: #333333;
		opacity: 0.5;
	}

	/* 头部开始 */
	.head {
		display: flex;
		padding: 0 10px;
		margin: 20px 0;
		width: 100%;
		height: 35px;
		line-height: 35px;
		background: #FCFCFC;
		opacity: 1;
		border-radius: 0px;
		box-sizing: border-box;
		border-radius: 5px;
		box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
	}

	.head .item+.item {
		width: 150px;
		font-size: 14px;
		color: #333333;
		text-align: center;
	}

	.check .all {
		margin-right: 10px;
	}

	.check .text {
		width: 1487px;
		height: 40px;
	}

	.classInfo {
		width: 450px !important;
		color: #333333;
	}

	/* 头部结束 */

	/* 订单开始 */
	.haveorder {
		display: flex;
		width: 100%;
		box-sizing: border-box;
		height: 200px;
		background: #FCFCFC;
		margin-bottom: 20px;
		padding: 0 10px;
		border-radius: 5px;
		box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
		transition: background 0.2s linear;
	}

	.haveorder .order-item {
		height: 200px;
		line-height: 200px;
	}
	
	.haveorder:hover{
		background: #ecf1f3 !important;
		animation: cardHover linear 0.2s;
	}
	
	.haveorder:active{
		background: #d7d7d7 !important;
	}
	
	@keyframes cardHover{
		0%{
			
		}
		50%{
			background: #ecf1f3 !important;
		}
		100%{
			background: #e1e6e7 !important;
		}
	}

	.order-item:first-child {
		width: 30px;
	}

	.order-item {
		width: 150px;
		font-size: 16px;
		color: #333333;
	}

	.order-item:nth-child(3) {
		text-align: center;
	}

	.totoalprice {
		color: #E2231A;
		text-align: center;
	}

	.num {
		width: 150px;
		text-align: center;
	}

	.info {
		display: flex;
		width: 470px !important;
		height: 200px;
		line-height: 200px;
	}

	.courseimg {
		margin: 40px 20px 40px 40px;
		width: 200px;
		height: 120px;
	}

	.courseimg img {
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.info .course-name {
		width: 300px;
		word-break: keep-all;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.info .course-name:hover{
		cursor: pointer;
		color: #5555ff;
	}

	.delete {
		cursor: pointer;
		text-align: center;
		text-decoration: none;
	}

	.deletd-text {
		text-align: center;
	}

	/* 订单结束 */

	/* 暂无订单开始 */
	.noOrder {
		width: 100%;
		height: 100%;
		text-align: center;
		margin: 200px 0;
	}

	.order-alert {
		height: 31px;
		font-size: 20px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		line-height: 0px;
		color: #B5B9BC;
		opacity: 1;
		margin: 20px 120px;

	}

	/* 暂无订单结束 */
	.foot {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		width: 100%;
		height: 40px;
		line-height: 40px;
		color: #333333;
		margin-bottom: 10px;
	}

	.foot-item {
		/* width: 120px; */
		display: flex;
		align-items: center;
		height: 40px;
		line-height: 40px;
		font-size: 14px;
		font-weight: 400;
		color: #333333;
		margin-left: 20px;
	}
	
	.delete-items{
		cursor: pointer;
		color: #9ea2a4;
	}
	
	.delete-items:hover{
		color:#5555ff;
	}

	.unique {
		margin-left: 5px;
		font-size: 24px;
		color: #FF4400;
	}

	.btn {
		width: 120px;
		height: 40px;
		margin-left: 20px;
		border: none;
		color: #FFFFFF;
		font-size: 22px;
		border-radius: 5px;
		background: #FF4400;
		cursor: pointer;
		/* box-shadow: 0px 3px 5px 2px #ff727f; */
	}
</style>
