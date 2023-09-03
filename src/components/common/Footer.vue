<template>
	<footer>
		<div class="footer-main">
			<div class="foot-left">
					<img class="logo02" src="@/assets/img/logo02.png"/>
					<img class='factory' src="../../assets/img/foot-factory.png"/>
				</div>
				<div class="foot-center">
					<ul>
						<li> 关于我们 </li>
						<li> | </li>
						<li> 关于我们 </li>
						<li> | </li>
						<li> 关于我们 </li>
						<li> | </li>
						<li> 关于我们 </li>
					</ul>
					<div>
						Copyright © 2018~2038 小鹿线 www.xuexiluxian.cn 24小时服务热线：010-86483040
					</div>
				</div>
				<div class='foot-right'>
					<ul>
						<li>
							<img src="@/assets/img/guanfangwx.jpg"/>
							<span>官方微信</span>
						</li>
						<li>
							<img src="@/assets/img/laoshiwx.png"/>
							<span>指导老师微信</span>
						</li>
					</ul>
					
				</div>
			
		</div>
	</footer>
</template>

<script>
</script>

<style scoped>
	footer{
		display: flex;
		align-items: center;
		justify-content: center;
		height:187px;
		background: #3483ff;
	}
	
	.footer-main{
		width: 1000px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.foot-left{
		display: flex;
		align-items: center;
	}
	
	.logo02{
		width: 127px;
		height:50px;
		margin-right: 20px;
	}
	
	.factory{
		width: 130px;
		height: 110px;
	}
	
	.foot-center{
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		
		color: #fff;
		font-size: 12px;
	}
	
	.foot-center ul{
		display: flex;
	}
	
	.foot-center ul li{
		padding: 0 5px 10px 5px;
	}
	
	.foot-right ul{
		display: flex;
		color:#fff;
		font-size: 12px;
	}
	
	.foot-right ul li{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.foot-right ul li+li{/* 排除第一个二维码使用padding-left */
		padding-left: 20px;
	}
	
	.foot-right ul li img{
		width: 60px;
		height: 60px;
	}
	
	.foot-right ul li span{
		padding-top: 10px;
	}
</style>