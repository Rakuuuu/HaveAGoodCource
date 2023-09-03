<template>
	<header>
		<div class='header-main'>
			<div class='header-l'>
				<h1 class='logo'>
					<img src='@/assets/img/logo.png' @click="router.push('/home')"/>
				</h1>
				<ul>
					<li 
						v-for="item in topBar"
						:key = 'item.id'
						:class="router.currentRoute.value.name === item.name?'active':''"
						@click="navigateTo(item.name)"
					>
						{{item.title}}
					</li>
				</ul>
			</div>
			<div class='header-r'>
				<div class='search'>
					<input placeholder="搜索想要的课程"/>
					<el-icon :size="20" color="#999"><Search /></el-icon>
				</div>
				<div class='login-register' v-if='!isLogin'>
					<router-link 
						class="login"
						to='/login'
					>登录</router-link>
					/
					<router-link 
						class="register" 
						to='/login'
					>注册</router-link>
				</div>
				<div class="content-login-success" v-else>
					<div class='shop' @click="router.push('/cart')">
						<el-icon :size="20"><ShoppingCart /></el-icon>
					</div>
					<div class='my-course'>我的课程</div>
					<div class="user" @mouseleave="isShow=false">
						<img
							class="avator"
							@mouseenter='isShow=true'
							:src="userInfo.avatar"
							alt=""
							v-if="userInfo.avatar"
						/>
						<img v-else class="avator" src='../../assets/img/Avat62.png'/>
						<!-- 划过头像显示  -->
						<div class="user-info" v-if='isShow'>
							<div class="user-info-top">
							<div class="u-i-t-top">
							  <img
								class="avator"
								:src="userInfo.avatar"
								alt=""
								v-if="userInfo.avatar"
							  />
							  <img class="avator" v-else />
							  <div class="avator-info">
								<p>{{userInfo.nickName}}</p>
							  </div>
							  <div class="vip" v-if="vipInfo">
								<div class="vipImg">
								  <img :src="vipInfo.vipIcon" :class="endTimeVip < 0 ? 'gray':''">
								</div>
								<div class="vipName">{{vipInfo.vipName}}</div>
								<div class="endTime" v-if="vipInfo.isExpired === 0 ">{{endTimeVip}}天到期</div>
								<div class="endTime" v-else>已过期{{Math.abs(endTimeVip)}}天</div>
							  </div>
							</div>
							<div class="u-i-i-bottom">
								<div>
									<router-link to="/home">
									  <div class="info-item">
										<img src="../../assets/img/course.png"/>
										<p>我的课程</p>
									  </div>
									</router-link>
								</div>
								<div>
									<router-link to="/home">
										<div class="info-item">
											<img src="../../assets/img/order.png" />
											<p>订单中心</p>
										</div>
									</router-link>
								</div>
								<div>
									<router-link to="/home">
										<div class="info-item">
											<img src="../../assets/img/mess.png"/>
											<p>我的消息</p>
										</div>
									</router-link>
								</div>
								<div>
									<router-link to="/home">
										<div class="info-item">
											<img src="../../assets/img/setting.png"/>
											<p>个人设置</p>
										</div>
									</router-link>
								</div>
							</div>
							</div>
							<div class="user-info-bottom">
								<div class="logout" @click="exit">退出登录</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>
</template>

<script setup>
	import {Search, ShoppingCart} from '@element-plus/icons-vue';
	import { ElMessageBox,ElMessage } from 'element-plus';
	import { onBeforeMount, ref } from 'vue';
	import { useRouter } from 'vue-router';
	import {getInfo, logout} from '@/utils/api/login';
	import {createToken} from '@/utils/api/createToken';
	import {useUserStore} from '@/store/user';
	
	
	let dialogVisible = ref(false);
	
	let router = useRouter();
	
	//用户是否是登录状态
	let isLogin = ref(false);
	//用户信息
	let userInfo = ref({});
	//用户vip数据
	let vipInfo = ref({});
	//VIP到期时间
	let endTimeVip = ref();
	//显示用户更多数据
	let isShow = ref(false);
	
	let topBar = ref([
		{title:'首 页', name:'home'},
		{title:'课 程', name:'course'},
		{title:'会 员', name:'vip'},
	]);
	
	onBeforeMount(()=>{
		if(useUserStore().token){
			createToken().then(res=>{
				let token = res.data.token;
				// console.log(res);
				getInfo({token: token}).then(res=>{
					//登录的状态，获取到了用户的信息
					if( res.meta.code =='200' ){
						//用户信息
						userInfo.value = res.data.data;
						//pinia存储用户信息
						useUserStore().userInfo = res.data.data;
						//用户vip
						vipInfo.value = res.data.data.vipInfo;
						//计算会员到期时间
						let now = new Date().getTime();
						let endTime = vipInfo.value.endTime-now;
						endTimeVip.value = Math.floor( endTime/1000/60/60/24);
						//判断是否可以获取用户信息
						isLogin.value = true;
					} else {
						useUserStore().cleanToken();
						ElMessage({
							type:'warning',
							message:res.meta.msg
						})
					}
				})
			});
		}
		
	});
	
	const navigateTo = (name) =>{
		router.push({
			name
		})
	};
	
	const exit = () => {
		ElMessageBox.confirm('确定退出登录吗？', '提示', {
		      confirmButtonText: '确定',
		      cancelButtonText: '取消',
		      type: 'warning'
		    }).then(() => {
		    	logout().then(res=>{
					if(res.meta.code==='200'){
						let userStore = useUserStore();
						userStore.cleanToken();
						router.go(0);//刷新页面
						ElMessage.success({
						  message: '退出成功!'
						});
					}
				})
		    }).catch(() => {
		      // ElMessage.info({
		      //   message: '已取消'
		      // });
		    });
	}
</script>

<style scoped>
	header{
		width: 100%;
		height: 80px;
		box-shadow: 0px 2px 4px rgba(0,0,0,0.1600);
		
		/*z-index与relative配合可以让后出来的div被覆盖, 
		只要比其他的元素多一个数,就会压制其它的元素*/
		position: relative;
		z-index: 99; 
	}
	
	.header-main{
		display: flex;
		justify-content: space-between;/* 调整主轴(x)，两端对齐主轴的起点与终点，项目之间的间隔都相等。 */
		align-items: center;/* 调整交叉轴(y)的对齐为居中 */
		width: 1000px;
		height: 80px;
		margin: 0 auto;
	}
	
	.logo{
		width:127px;
		height:50px;
		margin-right: 51px;
		display: flex;
		align-items: center;
	}
	
	.logo img{
		width:127px;
		height:50px;
		cursor: pointer;
	}
	
	.header-l{
		display: flex;
		justify-content: space-between;
	}
	
	.header-l ul{
		display: flex;
		align-items: center;
	}
	
	
	.header-l ul li{
/* 		选择所有li调整line-height使active的下标下移,
		若不选择所有li只选.active调整line-height,
		则会导致.active的布局错位 */
		line-height: 50px;
		font-weight: 500;
		color:#808080;
		cursor: pointer;
	}
	
	.header-l ul li + li{ /* "+"选择器：选择所有紧跟在 <li> 元素之后的第一个 <li> 元素，即令除了第一个的<li>都有margin-left属性，不然ul>li中的文字的水平空间不够 */
		margin-left: 40px;
		font-size: 16px;
	}
	
	.active{
		position: relative;
		color: #3585ff !important;
	}
	
	.active:after{/* :after选择器:在每个.active元素之后插入内容 */
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 140%;
		margin-left: -20%;
		height: 3px;
		background-color: #3585ff;
	}
	
	.header-r{
		display: flex;
		align-self: center;
	}
	
	.header-r .search{
		display: flex;
		align-self: center;/*对于flex布局的单个item的交叉轴居中*/
		align-items: center;
		padding: 0 10px;
		width: 300px;
		height:43px;
		background: #f0f2f4;
		border-radius: 5px;
	}
	
	.header-r .search input{
		height:43px;
		border:none;
		background: transparent;
		width: 270px;
		outline: none;
	}
	
	.header-r .shop{
		display: flex;
		align-items: center;
		margin-left: 42px;
		cursor: pointer;
		transition: all linear 0.2s; 
		border-radius: 50%;
	}
	
	.header-r .shop:hover{
		color: #ffffff;
		background: #3585ff;
	}
	
	.header-r .shop:active{
		background: #2867c4;
		box-shadow: 0px 0px 10px rgba(0,0,0,0.1600);
	}
	
	>>>.shop .el-icon{
		padding:10px;
		margin-right: 2px;
		margin-left: -2pxs;
	}
	
	
	.header-r .login-register{
		display: flex;
		align-items: center;
		margin-left: 39px;
		width: 80px;
		font-size: 16px;
		font-family: 'MicrosoftYahei';
		line-height: 19px;
		color: #808080;
	}
	
	.login{
		cursor: pointer;
		text-decoration: none;
		color: #808080;
	}
	
	.login:hover{
		color: #3585ff;
	}
	
	.register{
		cursor: pointer;
		text-decoration: none;
		color: #808080;
	}
	
	.register:hover{
		color: #3585ff;
	}
	
	.content-login-success {
		height: 80px;
		color: #808080;
		text-align: center;
		width: 250px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 16px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #707070;
	}
	
	.my-course{
		cursor: pointer;
		transition: all 0.2s linear;
	}
	
	.my-course:hover{
		color: #3585ff;
	}
	
	.user{
		position: relative;
		height: 100%;
		display: flex;
		align-items: center;
	}
	
	.avator {
		height: 40px;
		width: 40px;
		cursor: pointer;
		border-radius: 50%;
	}
	.user-info {
		width: 200px;
		height: 194px;
		overflow: hidden;
		background-color: #fff;
		border: 1px solid rgba(248, 250, 252, 1);
		box-shadow: 0px 5px 15px 3px #888888;
		position: absolute;
		top: 100%;
		right:0;
		z-index: 999;
		display: block;
		border-radius: 10px;
		animation: userInfoAppear linear 0.25s;
	}
	
	@keyframes userInfoAppear{
		0%{
			opacity: 0;
		}
		50%{
			opacity: 0.5;
		}
		100%{
			opacity: 1;
		}
	}
	
	.user-info-top {
		display: flex;
		width: 100%;
		height: 160px;
		border-bottom: 1px solid rgba(248, 250, 252, 1);
		flex-direction: column;
	}
	.u-i-t-top {
		display: flex;
		height: 80px;
		width: 100%;
		align-items: center;
	}
	.u-i-t-top img {
		width: 40px;
		height: 40px;
		margin: 0 10px;
		cursor: pointer;
	}
	.avator-info {
		width: 120px;
		height: 60px;
		font-size: 14px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #333333;
		display: flex;
		flex-direction: column;
		/*align-items: center;*/
	}
	/*有会员了之后高度微调*/
	.avator-info p {
		height: 40px;
		line-height: 40px;
		cursor: pointer;
	}
	.u-i-i-bottom {
		display: flex;
		height: 100px;
		width: 200px;
		margin-top: 10px;
		flex-wrap: wrap;
		justify-content: space-around;
	}
	.u-i-i-bottom a{
		text-decoration: none;
	}
	.info-item {
		width: 90px;
		height: 30px;
		display: flex;
		justify-content: space-around;
		align-items: center;
		font-size: 12px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #333333;
		border-radius: 3px;
		cursor: pointer;
		background-color: rgba(0, 0, 0, 0.1) !important;
	}
	.info-item img {
		width: 14px;
		height: 16px;
	}
	.user-info-bottom {
		position: relative;
		width: 100%;
		height: 30px;
	}
	.logout {
		line-height: 30px;
		position: absolute;
		top: 0;
		right: 10px;
		font-size: 12px;
		font-family: Microsoft YaHei;
		font-weight: 400;
		color: #93999f;
		cursor: pointer;
	}
	/*vip开始*/
	.vip{
	  display: flex;
	  flex-direction: row;
	  /*flex-wrap: wrap;*/
	  width: 100%;
	  height: 30px;
	  margin-left: -105px;
	  margin-top: 18px;
	  font-size: 12px;
	  line-height:30px;
	}
	.vipImg{
	  width: 15px;
	  height: 15px;
	  margin-right: 12px;
	}
	.vipImg img{
	  width: 100% !important;
	  height: 100% !important;
	}
	.vipName{
	  color: #93999F;
	}
	.endTime{
	  padding-left: 2px;
	  color:#FF0000 ;
	  position: absolute;
	  top: 45px;
	  left: 73px;
	  font-size: 12px;
	}
</style>