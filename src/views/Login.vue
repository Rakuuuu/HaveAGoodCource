<template>
	<div class='login-main'>
		<div class='login-box'>
			<div class='login-left'>
				<div class="logo-box">
					<img src='@/assets/img/logo02.png'/>
				</div>
				<div class='qr-code-box'>
					<img/>
					<div>扫码登录</div>
				</div>
				<div class='quick'>
					<div class='quick-login-title'>快捷登录</div>
					<div class='quick-login'>
						<div class='quick-login-logo login-qq'></div>
						<div class='quick-login-logo login-wx'></div>
						<div class='quick-login-logo login-wb'></div>
					</div>
				</div>
			</div>
			<div class='login-right'>
				<div class='login-form'>
					<div class='nav-tabs'>
						<div :class="currentIndex===1?'active':''" @click="changeIndex">账号登录</div>
						<div :class="currentIndex===2?'active':''" @click="changeIndex">短信登录</div>
					</div>
					<div
						class='login-form-main'
						v-if='currentIndex===1'
					>
						<el-form 
							ref='ruleFormRef'
							class='login-form-inputs' 
							:model="ruleForm"
							:rules="rules"
						>						
							<el-form-item 
								prop="username"
								class='login-user'
							>
								<el-input 
									:prefix-icon="User" 
									placeholder="请输入您的账号"
									v-model="ruleForm.username"
								/>
							</el-form-item>
							<el-form-item  
								class='login-password'
								prop="userpwd"
							>
								<el-input 
									:prefix-icon="Lock" 
									placeholder="请输入您的密码" 
									v-model="ruleForm.userpwd"
									type="password"
								/>
							</el-form-item>
							
							<el-form-item class="buttons">
								<button class='login-button'  @click.prevent="userBtn(ruleFormRef)">登录</button>
								<a class='forget-password'>忘记密码？</a>
								<div class='login-text'>
									登录即同意
									<a>《小鹿线用户服务协议》</a>
									<a>《小鹿线隐私政策》</a>
								</div>
							</el-form-item>
						</el-form>
						<div class='go-register'>
							<div>返回首页</div>
							<div>还没有账号？<a class='to-register'>去注册</a></div>
						</div>
					</div>
					
					<div class='login-form-main' v-else-if='currentIndex===2'>
						<el-form 
							class='login-form-inputs'
							:rules="rulesPhone"
							:model="ruleFormPhone"
							ref='ruleFormPhoneRef'
						>						
							<el-form-item 
								class='login-user' 
								prop="phone"
							>
								<el-input 
									:prefix-icon="Cellphone" 
									placeholder="请输入您的手机号"
									v-model="ruleFormPhone.phone"
								/>
							</el-form-item>
							<el-form-item 
								class='login-password'  
								prop="vcode"
							>
								<el-input  
									placeholder="请输入验证码"
									:show-password='true'
									v-model="ruleFormPhone.vcode"
								>
									<template #suffix>
										<el-button type="primary" @click="sendCode" :disabled='disable_sending'>{{btnTitle}}</el-button>
									</template>
								</el-input>
							</el-form-item>
							<el-form-item class="buttons">
								<button class='login-button' @click="userBtnPhone(ruleFormPhoneRef)">登录</button>
								<a class='forget-password'>忘记密码？</a>
								<div class='login-text'>
									登录即同意
									<a>《小鹿线用户服务协议》</a>
									<a>《小鹿线隐私政策》</a>
								</div>
							</el-form-item>
						</el-form>
						<div class='go-register'>
							<div>返回首页</div>
							<div>还没有账号？<a class='to-register'>去注册</a></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<Verify
		ref="verify"
		:captcha-type="'blockPuzzle'"
		:img-size="{width:'250px',height:'175px'}"
		@success="onSuccess"
	></Verify>
</template>

<script setup>
	import { User, Lock, Cellphone} from '@element-plus/icons-vue';
	import { onBeforeMount, reactive } from 'vue';
	import {loginByJson, sendCaptcha, loginByMobile} from '@/utils/api/login';
	import {Encrypt} from '@/utils/aes.js';
	import { ElMessage } from 'element-plus';
	
	//验证模块
	import Verify from '@/components/verifition/Verify.vue';
	let verify = ref('');
	
	//pinia
	import {useUserStore} from '@/store/user';
	const userStore = useUserStore();
	
	//路由
	import {useRouter} from 'vue-router';
	let router = useRouter();
	
	//navTabs分页
	let currentIndex = ref(1);//1账密登录，2短信验证码登录
	const changeIndex = () => {
		currentIndex.value = currentIndex.value===1?2:1;
	}
	
	//账号密码登录
	const ruleFormRef = ref('');
	let ruleForm = reactive({
		username:'',
		userpwd:''
	});
	
	
	const ruleFormPhoneRef = ref('');
	let ruleFormPhone = reactive({
		phone:'',
		vcode:''
	});
	
	//验证规则
	let rules = reactive({
	  username: [
	  	{ required: true, message: '请输入用户名', trigger: 'blur' },
	    { min: 3, max: 11, message: '请输入3-11位用户名', trigger: 'blur' },
	  ],
	  userpwd:[
	  	{ required: true, message: '请输入密码', trigger: 'blur' },
	    { min: 3, max: 11, message: '请输入3-11位密码', trigger: 'blur' },
	  ]
	});
	
	let rulesPhone = reactive({
		phone:[
			{ required: true, message: '手机号不得为空', trigger: 'blur' },
			{ pattern: /^1[3456789]\d{9}$/, message: '仅支持中国大陆11位手机号，请检查您的输入',},
		],
		vcode:[
			{ required: true, message: '验证码不得为空', trigger: 'blur' },
			{ min: 6, max: 6, message: '请输入6位验证码', trigger: 'blur' },
		]
	})
	
	//账号密码点击登录
	const userBtn = (formEl) => {
		if (!formEl) return;
	 	formEl.validate((valid, fields) => {
		    if (valid) {
				// console.log('用户名和密码验证成功');
				// console.log(Encrypt(ruleForm.username)+'和'+Encrypt(ruleForm.userpwd));
				loginByJson({
					username:Encrypt(ruleForm.username),   //加密-用户名
					password:Encrypt(ruleForm.userpwd)    //加密-密码
				}).then(res=>{
					// console.log(res);
					if(res.meta.code !== '10006'){
						ElMessage({
						    showClose: true,
						    message: '用户名或密码错误',
						    center: true,
							type:'error',
							duration: 3000
						});
					} else if(res.meta.code === '10006'){
						ElMessage({
							showClose: true,
							message: '登录成功',
							center: true,
							type:'success',
							duration: 3000
						});
						console.log(res);
						userStore.setToken(res.data.accessToken);//设置token
						router.go(-1);//返回上一页
						// console.log('userStore.token:',userStore.token);
					} else {
						ElMessage({
							showClose: true,
							message: res.meta.msg,
							center: true,
							duration: 3000
						});
					}
				})
		    } else {
		      // console.log('error submit!', fields,valid);
		    }
		})
	};
	
	//短信验证码登录
	let disable_sending = ref(true);//初始未验证时发送验证码按钮要设置为disabled
	
	watch(
		() => ruleFormPhone.phone,//watch中访问obj.xxx时采用getter形式
		(phone) => {
			let reg = /^1[3456789]\d{9}$/;
			if(reg.test(phone)){
				disable_sending.value = false;
			}
			else {
				disable_sending.value = true;
			}
		}
	)
	
	//发送验证码按钮事件
	const sendCode = () => {
		verify.value.show();
	}
	//图片验证成功的后续操作
	const onSuccess = () => {
		sendCaptcha({
			mobile:ruleFormPhone.phone
		}).then(res=>{
			if(res.meta.code === '200'){
				ElMessage({
					showClose: true,
					message: '验证码发送成功',
					center: true,
					type:'success',
					duration: 3000
				});
				setBtnText();
			}
		})
	}
	
	//防抖按钮设置
	let btnTitle = ref('发送验证码');
	let btnTimer = null;
	
	const setBtnText = () =>{
		let timer = 60;//过60s重新发送
		clearInterval(btnTimer);
		btnTimer = setInterval(()=>{
			timer--;
			if(timer > 0){
				btnTitle.value = `${timer}s`;
				disable_sending.value = true;
			} else {
				btnTitle.value = '发送验证码';
				disable_sending.value = false;
			}
		}, 1000);
		
	}
	
	//手机验证码点击登录
	const userBtnPhone = (formEl) => {
		if (!formEl) return;
	 	formEl.validate((valid, fields) => {
		    if (valid) {
				// console.log('手机号和验证码验证成功');
				// console.log('Encrypt(ruleFormPhone.phone) :',Encrypt(ruleFormPhone.phone));
				loginByMobile({
					mobile:Encrypt(ruleFormPhone.phone),
					captcha: ruleFormPhone.vcode
				}).then(res => {
					console.log(res);
					if(res.meta.code !== '10006'){
						ElMessage({
							showClose: true,
							message: res.meta.msg,
							center: true,
							type:'error',
							duration: 3000
						});
					} else if(res.meta.code === '10006'){
						ElMessage({
							showClose: true,
							message: '登录成功',
							center: true,
							type:'success',
							duration: 3000
						});
						userStore.setToken(res.data.accessToken);//设置token
						router.go(-1);//返回上一页
						// console.log('userStore.token:',userStore.token);
					} 
				})
		    } else {
		      // console.log('error submit!', fields,valid);
		    }
		})
	};
</script>

<style>
	.login-main{
		width: 100vw;/*不管缩放多少，将视窗的宽平分为100个单位*/
		height:100vh;/*不管缩放多少，将视窗的高平分为100个单位*/
		background: url('@/assets/img/loginbg.jpg') no-repeat center;
		background-size: cover;/*扩展图片来填满元素（保持像素的长宽比），是图片宽高最短的那个边覆盖元素一边即可；*/
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.login-box{
		width: 950px;
		height: 500px;
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		box-shadow: 0px 0px 5px #777;
	}
	
	.login-left{
		width: 475px;
		height: 500px;
		box-sizing: border-box;
		padding:20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		background: #388fff;
	}
	
	.logo-box{
		width: 100%;
		height:48px;
		display: flex;
		align-content: center;
		justify-content: start;
	}
	
	.logo-box img{
		width: 120px;
		height:48px;
	}
	
	.qr-code-box{
		padding:10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.qr-code-box img{
		box-sizing: border-box;/*无需计算padding后相减*/
		width: 200px;
		height:200px;
		background: #fff;
		padding:10px;
	}
	
	.qr-code-box div{
		font-size: 14px;
		text-align: center;
		color: white;
		line-height: 35px;
		margin-top: 10px;
	}
	
	.quick{
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: space-between;
	}
	
	.quick-login-title{
		text-align: center;
		margin-bottom: 20px;
		font-size: 14px;
		color: #dddddd;
		position: relative;
	}
	
	.quick-login-title:before{
		content: '';
		width: 80px;
		height:1px;
		position: absolute;
		background: #dddddd;
		left:70px;
		top:50%;
		transform: translate(0, -50%);
	}
	
	.quick-login-title:after{
		content: '';
		width: 80px;
		height:1px;
		position: absolute;
		background: #dddddd;
		right:70px;
		top:50%;
		transform: translate(0, -50%);
	}
	
	.quick-login{
		display: flex;
		width: 180px;
		height: 55px;
		padding:10px;
		box-sizing: border-box;
		align-items: center;
		justify-content: space-between;
	}
	
	.quick-login-logo{
		width: 30px;
		height: 30px;
		border-radius: 50%;
		overflow: hidden;
		font-size: 18px;
		text-align: center;
		line-height: 30px;
		background: #e5ffe1;
	}
	
	.login-right{
		width: 475px;
		height: 500px;
		background: url('@/assets/img/ybbg.jpg') no-repeat center;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.login-form{
		padding: 10px 40px;
		width: 350px;
		height: 440px;
		box-sizing: border-box;
		background: #ffffff;
		box-shadow: 0 0 8px #cccccc;
		border-radius: 8px;
	}
	
	.login-form-main{
		height: 360px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
	}
	
	.nav-tabs{
		width: 270px;
		height:50px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.nav-tabs div{
		position: relative;
		width: 108px;
		height:45px;
		font-size: 17px;
		font-weight: bold;
		text-align: center;
		color: #333;
		display: block;
		height: 45px;
		line-height: 45px;
		cursor: pointer;
	}
	
	.nav-tabs .active{
		color: #388eff !important;
	}
	
	.nav-tabs .active:after{
		background: #388eff;
		position: absolute;
		content:'';
		width: 100%;
		left: 0;
		height:4px;
		top:100%;
	}
	
	.login-form-inputs{
		width: 100%;
	}
	
	.login-user{
		width: 100%;
		height: 40px;
		margin-top: 30px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.login-user input {
		font-size: 14px;
		line-height: 14px;
	    width: calc(100% - 30px);
	    height: 35px;
	    outline: none;
	    color: #666666;
	    border: 0;
	}
	
	.login-password{
		width: 100%;
		height: 40px;
		margin-top: 30px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.login-password input {
		font-size: 14px;
		line-height: 14px;
	    width: calc(100% - 30px);
	    height: 35px;
	    outline: none;
	    color: #666666;
	    border: 0;
	}
	
	.login-password .el-input__wrapper{/**/
		padding: 1px 3px 1px 11px !important; 
	}
	
	.buttons{
		width: 100%;
	}
	
	.buttons .forget-password{
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: end;
		color: #888;
		font-size: 14px;
		line-height: 1.5em;
	}
	
	.buttons .login-button{
		width: 100%;
		height: 35px;
		outline: none;
		border: none;
		letter-spacing: 5px;
		border-radius: 18px;
		font-size: 1rem;
		font-weight: bold;
		margin: 15px 0 5px 0;
		color: #fff;
		background-color: #007bff;
		cursor: pointer;
	}
	
	.login-text{
		width: 100%;
		color: #666;
		font-size: 14px;
		margin-top: 10px;
	}
	
	.login-text a{
		color: #222222;
		font-size: 14px;
		line-height: 1.5em;
	}
	
	.go-register{
		display: flex;
		font-size: 14px;
	}
	
	.go-register div{
		position: absolute;
	}
	
	.go-register div:nth-child(1){
		color:#388eff;
	}
	
	.go-register a{
		color:#388eff;
	}
	
	.go-register>div{
		position: relative;
		padding: 0 10px;
	}
	
	.go-register>div:not(:last-child):after{
		content: '';
		height: 100%;
		width: 2px;
		background: #cccccc;
		position: absolute;
		right: 0;
		top:50%;
		transform: translate(0, -50%);
	}
</style>