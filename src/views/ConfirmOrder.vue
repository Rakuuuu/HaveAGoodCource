<template>
    <Header></Header>
    <div class="confirmOrder">
      <div class="bgColor">
          <h1 class="main-shopcart">确认订单</h1>
      </div>
      <div class="main">
            <div class="info">
                <div class="head">商品信息</div>
                <div class="info-main">
                    <div class="courseInfo" v-for="item in courses" :key="item.id">
                        <div class="coursebg">
                            <img :src="item.courseCover" alt="">
                        </div>
                        <div class="courseName">
                           {{item.courseName}}
                        </div>
                        <div class="coursePrice">
                            <span class="nowprice">￥{{item.discountPrice}}</span>
                            <!-- <span class="oldprice">￥item.salePrice</span> -->
                        </div>
                    </div>
                </div>
                <div class="choose">
                    <h3>当前支付方式： <span class="pay">{{payment.description}}</span></h3>
                    <div class="choosebg">
                        <el-check-tag  
							v-for="item in payModes" 
							size='large'
							:key="item.code"
							:checked='item.code === payment.code'
							@change="changePayment(item)"
						>{{item.description}}</el-check-tag >
                    </div>
                </div>
                <ul class="foot">
                    <li class="foot-item">应付<span class="unique">${{totalPrice.toFixed(2)}}</span></li>
                    <li>
                        <button class="btn" @click="toPay">确认订单</button>
                    </li>
                </ul>
            </div>
        </div>
        <!-- 二维码对话框 -->
        <el-dialog v-model='dialogVisible' class="pay-dialog" width="500px">
            <div class="dialogPrice">{{payment.description}}：<span class="prices">{{totalPrice}}元</span></div>
            <div class="codeimg">
                <img :src="payData.payurl" />
            </div>
            <div class="alert">请您及时付款，以便我们对订单进行处理！</div>
            <div class="finish">
                <div class="error">支付遇到问题</div>
                <div class="success">我已支付</div>
            </div>
        </el-dialog>
    </div>
    <Footer></Footer>
</template>

<script setup>
//组件
import Header from '../components/common/Header.vue'
import Footer from '../components/common/Footer.vue'
import { onBeforeMount, reactive } from 'vue';

import { useCartStore } from '@/store/cart';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import {deleteShopCars} from '@/utils/api/cart';
import { createToken } from '@/utils/api/createToken';
import { settlement ,createAlipayOrder, createWechatOrder, queryOrderAlipay, queryOrderWechatpay } from '@/utils/api/order';
import { ElMessage } from 'element-plus';
import router from '../router';
let { select, orderList } = storeToRefs(useCartStore());

//课程信息
let courses = ref([]);
let totalPrice = ref(0);
let payModes = ref([]);

let dialogVisible = ref(false);

let payment = reactive({
	code:'',
	description:'未选择'
});

let payData = ref({
	orderNumber:'',
	payurl:''
});

let timer = ref();

onBeforeMount(()=>{
	console.log(orderList);
	settlement(orderList.value).then(res=>{
		console.log(res);
		if(res.meta.code !== '200'){
			ElMessage.error({
				message:res.meta.msg
			});
		} else {
			totalPrice.value = res.data.totalPrice;
			courses.value = res.data.courses;
			payModes.value = res.data.payModes;
		}
	})
});

const changePayment = (item) =>{
	payment.code = item.code;
	payment.description = item.description;
}

const toPay = () =>{
	if(payment.code === ''){
		ElMessage({
			type:'warning',
			message:'请选择支付方式',
		});
		return;
	}
	
	if(payData.value.orderNumber && payData.value.payurl){//已经创建订单的情况下
		dialogVisible.value = true;
		return;
	}

	if(payment.code === 'alipayment'){
		aliPay();
	} else if(payment.code === 'wxpayment'){
		wechatPay();
	}
}


const aliPay = () =>{	
	createAlipayOrder({
		payModes:'alipayment',
		courses: orderList.value
	}).then(res=>{
		console.log(res);
		if(res.meta.code === '200'){
			payData.value.payurl = res.data.payurl;
			payData.value.orderNumber = res.data.orderNumber;
			
			//免费课无需购买
			if(!payData.value.payurl || !payData.value.orderNumber){
				ElMessage({
					type:"success",
					message:'免费课购买成功'
				});
				deleteOrderList();
				return;
			}
			
			// console.log(payData.value);
			dialogVisible.value = true;
			timer.value = setInterval(()=>{
				queryOrderAlipay({orderNumber: payData.value.orderNumber}).then(res=>{
					// console.log(res);
					if(res.meta.code==='200'){
						ElMessage({
							type:"success",
							message:`支付成功`
						});
						clearInterval(timer.value);
						
						deleteOrderList();
					} else {
						console.log(res);
					}
				});
			}, 5000);
		} else {
			ElMessage({
				type:'warning',
				message:res.meta.msg
			});
		}
	}, err=>{
		ElMessage({
			type:'error',
			message:'请求错误'
		});
	});
}

const wechatPay = () =>{	
	createWechatOrder({
		payModes:'wxpayment',
		courses: orderList.value
	}).then(res=>{
		console.log(res);
		if(res.meta.code === '200'){
			payData.value.payurl = res.data.payurl;
			payData.value.orderNumber = res.data.orderNumber;
			
			//免费课无需购买
			if(!payData.value.payurl || !payData.value.orderNumber){
				ElMessage({
					type:"success",
					message:'免费课购买成功'
				});
				deleteOrderList();
				return;
			}
			
			console.log(payData.value);
			dialogVisible.value = true;
			timer.value = setInterval(()=>{
				queryOrderWechatpay({orderNumber: payData.value.orderNumber}).then(res=>{
					// console.log(res);
					if(res.meta.code==='200'){
						ElMessage({
							type:"success",
							message:`支付成功`
						});
						clearInterval(timer.value);
						
						deleteOrderList();
					} else {
						console.log(res);
					}
				});
			}, 5000);
		} else {
			ElMessage({
				type:'warning',
				message:res.meta.msg
			});
		}
	}, err=>{
		ElMessage({
			type:'error',
			message:'请求错误'
		});
	});
}

const deleteOrderList = () =>{
	let ids = [];
	ids = orderList.value.map((v)=>{
		return v.id;
	});
	console.log("ids:",ids);
	
	createToken().then(res=>{
		if(res.meta.code !== '200'){
			ElMessage({
				type:'warning',
				message:res.meta.msg
			});
		} else {
			let token = res.data.token;
			
			deleteShopCars(select.value, token).then(res=>{
				console.log(res);
				if(res.meta.code !== '200'){
					ElMessage({
						type:'warning',
						message:res.meta.msg
					});
				} else {
					setTimeout(()=>{
					router.push('/home');
					router.go(0);				
					}, 3000);
				}
			});
		}
	}, err => {
		ElMessage({
			type:'error',
			message:'请求错误'
		});
	});
	orderList.value=[];//清空本地缓存
}
</script>

<style scoped>
.finish{
  width: 170px;

  line-height: 30px;
  margin: 0 auto;
  display: flex;
}
.success{
  margin-left: 20px;
  width: 70px;
  font-size:12px ;
  background: rgba(54, 137, 255, 0.22);
  color: #3692ff;
  cursor: pointer;
  border-radius: 8px;
}
.error{
  width: 100px;
  font-size:12px ;
  background: linear-gradient(90deg, #fc7979 0%, #da4848 100%);
  color: #ffffff;
  cursor: pointer;
  border-radius: 8px;

}
>>>.el-dialog {
    text-align: center !important;
    border-radius: 10px!important;
}
.dialogPrice{
    padding-bottom: 20px;
    color: #93999F;
}
.prices{
    color: #F01414;
}
.alert{
    padding: 20px 0;
    font-size: 14px;
    color: #93999F;

}
.confirmOrder{
    width: 100%;
    padding-bottom:60px;
}
.bgColor{
  width: 100%;
  height: 200px;
  background-color: red;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}
.main-shopcart{
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
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.main{
    width: 1200px;
    margin: -100px auto 0 auto;
  /*background-color: red;*/
}
.main h1{
    color: #FFFFFF;
    padding: 30px 0 30px 47px;

}
.info{
    width: 1200px;
    padding: 5px 0px 20px 0px;
    background: #F3F5F7;
    border-radius: 10px;
	box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
}
.info-main{
    margin: 10px 20px;
    background: #FFFFFF;
    border-radius: 10px;
}
.head{
    padding: 20px;
    font-size: 18px;
    color: #333333;
}
/* 课程信息 */
.courseInfo{
    display: flex;
	justify-content: space-around;
    width: 100%;
    height: 160px;
    margin: 0 auto;
	padding: 30px 0;
	border-radius: 10px;
}

.courseInfo:hover{
	background: #d9d9d9;
	z-index: 1;
}

.coursebg{
    width: 280px;
    height: 160px;
}
.coursebg img{
    width: 100%;
    height: 100%;
	border-radius: 10px;
}
.courseName{
    margin:0 20px;
    width: 400px;
    height: 160px;
    font-size: 16px;
    color: #07111B;
    line-height:160px ;
    word-break:keep-all;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
}
.coursePrice{
    margin-left: 100px;
    height: 160px;
    text-align: right;
    line-height: 160px;
}
.coursePrice .nowprice{
    font-size: 18px;
    font-weight: 600;
    color: #1C1F21;
}
.coursePrice .oldprice{
    padding-left: 10px;
    font-size: 14px;
    text-decoration: line-through;
    color: #93999F;

}
/* 支付开始 */
.choose{
    width: 1200px;
    margin: 0 auto;
}


.choose h3{
    color: #222;
    font-size: 16px;
    font-weight: 400;
    padding: 15px 30px;
}
.choosebg{
    display: flex;
    margin: 20px;
	align-items: center;
	align-self: center;
}

::v-deep.el-check-tag{
	margin: 0 10px  !important;
}

.choosebg span{
  margin-top: 60px;
  margin-right:40px;  
}
.payment{
    width: 130px;
    height: 50px;
    border-radius: 10px;
    cursor: pointer;
    margin-right: 10px;
    line-height: 50px;
    display: flex;
    padding: 0 10px;
    align-items: center;
}
.payment i{
    font-size: 35px;
    margin-right: 10px;
}
.payment span{
    line-height: 50px;
    color: #222222;
    font-weight: bold;
}

.payStyle{
  background: url("/image/checkedVip.png") no-repeat;
  background-size: 220px 111px;
  background-position: -67px -59px;
  border: #ff470a solid 1px !important;
}
.alipayment{
  border: #bfbfbf solid 1px;
  color: #01a8eb;
}
.wxpayment{
  border: #bfbfbf solid 1px;
  color: #01af37;
}

/* 支付结束 */
/* 结算 */
.foot{
    display: flex;
    justify-content: flex-end;
    width: 100%;
    height: 50px;
    line-height: 50px;
    color: #333333;
    margin-bottom: 10px;
}
.foot-item{
    width: 200px;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    font-weight: 400;
    color: #333333;
}
.foot-item:first-child{
    margin-top: 3px;
}
.old{
    margin-left: 10px;
}
.unique{
    margin-left: 5px;
    font-size: 24px;
    color: #F01414;
}
.btn{
    margin-right: 20px;
    width: 150px;
    height: 50px;
    border: none;
    color: #FFFFFF;
    font-size: 20px;
    border-radius: 5px;
    background: #F01414;
    cursor: pointer;
    /* box-shadow: 0px 3px 10px 2px #ff727f 0.5; */
}
.pay{
    font-size: 18px;
    padding-left: 10px;
    color:#F01414 ;
}
.codeimg{
    margin:0 auto;
    border: #d2d2d2 solid 1px;
    width: 150px;
    height: 150px;
}
.codeimg img{
    width: 100%;
    height: 100%;
}
</style>