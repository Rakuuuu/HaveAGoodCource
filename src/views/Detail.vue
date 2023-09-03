<template>
	<Header></Header>
	<div class="detail-title">
		<div class='detail-title-main'>
			<div class='detail-title-top'>
				<el-breadcrumb :separator-icon="ArrowRight">
					<el-breadcrumb-item @click="router.push({path:'/course'})">课程</el-breadcrumb-item>
					<el-breadcrumb-item>免费课</el-breadcrumb-item>
					<el-breadcrumb-item>{{courseDetail.courseName}}</el-breadcrumb-item>
				</el-breadcrumb>
			</div>
			<div class='detail-title-center'>
				{{courseDetail.courseName}}
			</div>
			<div class='detail-title-bottom'>难度 {{courseTypeFn(courseDetail.courseLevel)}}</div>
		</div>
	</div>
	<div class="detail-content">
		<div class='detail-content-tab'>
			<ul>
				<li :class="isActive===1?'tab-active':''" @click="isActive=1">章节</li>
				<li :class="isActive===2?'tab-active':''" @click="isActive=2">下载资料</li>
			</ul>
		</div>			
		<div class='chaptors' v-if="isActive===1">
			<div class='chaptors-main'>
				<div class="chaptors-content">
					<div class="chaptors-content-text">
						{{description !== ''?description:'暂无课程介绍'}}
					</div>
					<div class="chaptors-content-operation">
						<div class="operation-buy">立即购买</div>
						<div class="operation-add" @click='addToCart()'>加入购物车</div>
					</div>
				</div>
				<div class='chaptors-list'>
					<div 
						class="chaptors-item" 
						v-for="item in bizCourseChapters"
						:key='item.id'
					>
						<div class='chaptors-item-title'>
							<h3>{{item.chapterName}}</h3>
							<div>{{item.description}}</div>
						</div>
						<ul>
							<li 
								class='video-item' 
								v-for="i in item.children"
								:key='i.id'
							>
								<div  class="video-item-left">
									<el-icon color="#388fff"><VideoCameraFilled /></el-icon>
									<h3>视频：</h3>
									<div>{{i.chapterName}}</div>
								</div>
								<div class="video-item-right" @click="goPlay(item, i.id)"><div>开始学习</div></div>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>	
		<div 
			class='downloads' 
			v-else-if="isActive===2"
		>
			<div class="downloads-main">
				<ul>
					<li 
						class='downloads-item' 
						v-for="item in bizCourseAttachments"
						:key="item.id"
					>
						<div class="downloads-item-left">
							<el-icon color="#388fff"><Download /></el-icon>
							<div>{{item.attachmentName}}</div>
						</div>
						<div class="downloads-item-right">
							<button @click="downloadSource(item)">下载资料</button>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<Footer></Footer>
</template>

<script setup>
	import Header from '@/components/common/Header.vue';
	import Footer from '@/components/common/Footer.vue';
	
	//element+
	import { ArrowRight, VideoCameraFilled, Download } from '@element-plus/icons-vue';
	import { ElMessage } from 'element-plus';
	//api
	import {getDetail , checkAuth, downloadAttachment} from '@/utils/api/course'
	//route
	import { useRoute, useRouter } from 'vue-router';
	let route = useRoute();
	let router = useRouter();
	
	import { onBeforeMount, reactive } from 'vue';
	
	import { addShopCar } from '@/utils/api/cart';
	import {
		createToken
	} from '@/utils/api/createToken';
	
	//mixin 导入很多组件都会复用来判断课程类型的函数
	import courseType from '@/mixins/courseType.js';
	let {courseTypeFn} = courseType();
	
	//pinia
	import {useUserStore} from '@/store/user';
	
	let isActive = ref(1);//1是章节页面，2是下载页面
	
	let courseDetail = reactive({
		courseName:'',
		courseLevel:1,
		courseId: ''
	});
	
	let bizCourseChapters = ref([]);
	let description = ref('');
	
	//课程资料
	let bizCourseAttachments = ref([]);

	
	onBeforeMount(()=>{
		getDetail({courseId: route.params.id}).then(res=>{
			let data = res.data.data;
			// console.log(res);
			courseDetail.courseName = data.courseName;
			courseDetail.courseLevel = data.courseLevel;
			courseDetail.courseId = data.id;
			bizCourseChapters.value = data.bizCourseChapters;
			description.value = data.bizCourseDetail.description;
			bizCourseAttachments.value = data.bizCourseAttachments;
			document.title = `课程详情—${courseDetail.courseName}`;
		})
	});
	
	const downloadSource = (item) =>{
		// console.log(item);
		if( !useUserStore().token ){//判断未登录
			ElMessage({
			  message: '请先登录',
			  type:'warning'
			});
			router.push('/login');
			return ;
		}
		
		checkAuth({
			courseId:item.courseId, 
			chapterId: item.chapterId 
		}).then(res=>{
			if(res.meta.code!=='200'){
				ElMessage({
				  message: res.meta.msg,
				  type:'error'
				});
				return;
			} else {
				if(!res.data.data.hasAuth){//未购买该课程，无权限的操作
					ElMessage({
					  message: '请先购买课程',
					  type:'error'
					});
					return;
				} else {//有权下载，请求接口
					downloadAttachment({
						courseId: item.courseId,
						attachmentId: item.id
					}).then(res=>{
						const blob = new Blob([res]);
						let fileName = item.attachmentName;
						let fileUrl = item.attachmentUrl;
						const extName = fileUrl.substring(
							fileUrl.lastIndexOf('.')
						)//拿到后缀
						fileName = fileName + extName;//完整文件名＋后缀
						const link = document.createElement('a');//创建链接dom
						link.download = fileName;//指定该下载文件的名字
						link.target = '_blank';
						link.style.display = 'none';
						link.href = URL.createObjectURL(blob);
						console.log(URL.createObjectURL(blob));
						document.body.appendChild(link);
						link.click();//模拟打开
						URL.revokeObjectURL(link.href);//释放该对象URL
						document.body.removeChild(link);
					})
				}
			}
		})
	};
	
	//进入课程页
	const goPlay = (item, id) =>{//item.courseId是该item所属course的Id, id是chapter的id
		if( !useUserStore().token ){//判断未登录
			ElMessage({
			  message: '请先登录',
			  type:'warning'
			});
			router.push('/login');
			return ;
		}
		
		checkAuth({
			courseId:item.courseId, 
			chapterId: item.chapterId 
		}).then(res=>{
			if(res.meta.code!=='200'){
				ElMessage({
				  message: res.meta.msg,
				  type:'error'
				});
				return;
			} else {
				if(!res.data.data.hasAuth){//未购买该课程，无权限的操作
					ElMessage({
					  message: '请先购买课程',
					  type:'error'
					});
					return;
				} else {//有权观看
					router.push({
						path: '/course-play/:courseId/:chapterId', 
						params:{courseId: item.courseId, chapterId: id},
						name:'course-play'
					});
				}
			}
		})
	}
	
	const addToCart = () =>{
		// console.log(useUserStore().userInfo);
		if(!useUserStore().token){
			router.push('/login');
			return;
		}
		
		createToken().then(res=>{
			if(res.meta.code!=='200'){
				ElMessage({
				  message: res.meta.msg,
				  type:'error'
				});
				return;
			} else {
				let token = res.data.token;
				console.log('token',token);
				console.log('memberId',useUserStore().userInfo.id);
				console.log('courseId',courseDetail.courseId);
				addShopCar({
					memberId: useUserStore().userInfo.id,
					courseId: courseDetail.courseId
				}, token).then(res=>{
					if(res.meta.code!=='200'){
						ElMessage({
						  message: res.meta.msg==='数据已存在'?'已在购物车中':res.meta.msg,
						  type:'warning'
						});
					} else {
						ElMessage({
						  message: '加入购物车成功',
						  type:'success'
						});
					}
				},err=>{
					ElMessage({
					  message: '发送请求错误',
					  type:'error'
					});
				});
			}
		})
	}
	
</script>

<style scoped>
	.detail-title{
		width: 100%;
		height:183px;
		background: url('@/assets/img/courseInfobg1920.png') no-repeat;
		background-size: 100% 100%;
	}
	
	.detail-title-main{
		width: 1000px;
		height:calc(100% - 50px);/*calc属性的运算符两边留有空格才生效*/
		margin: 0 auto;
		padding:25px 0;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}
	
	::v-deep.el-breadcrumb__item:nth-child(n) .el-breadcrumb__inner, 
	::v-deep.el-breadcrumb__item:nth-child(n) .el-breadcrumb__inner a, 
	::v-deep.el-breadcrumb__item:nth-child(n) .el-breadcrumb__inner a:hover, 
	::v-deep.el-breadcrumb__item:nth-child(n) .el-breadcrumb__inner:hover,
	::v-deep.el-breadcrumb__item,
	::v-deep.el-breadcrumb__item .el-breadcrumb__separator
	{
		color:#fff;
		font-weight: 500;
	}
	
	::v-deep.el-breadcrumb__item .el-breadcrumb__inner{
		cursor: pointer;
	}
	
	.detail-title-center{
		font-size: 27px;
		font-weight: bolder;
		color: #ffffff;
		margin-top: 27px;
	}
	
	.detail-title-bottom{
		margin-top: 22px;
		font-size: 12px;
		font-weight: 400;
		color: #ffffff;
	}
	
	.detail-content{
		width: 100%;
	}
	
	.detail-content-tab{
		position: relative;
		width: 100%;
		margin: 0 auto;
		height: 57px;
		background: #ffffff;
		box-shadow: 0px 2px 4px rgba(0,0,0,0.16);
	}
	
	.detail-content-tab ul{
		width: 1000px;
		height: 100%;
		margin: 0 auto;
		display: flex;
		align-items: center;
		color:#333333;
		font-size: 16px;
		font-weight: bold;
	}
	
	.detail-content-tab ul li{
		cursor: pointer;
	}
	
	.detail-content-tab ul li+li{
		margin-left: 67px;
	}
	
	.detail-content-tab ul .tab-active{
		color: #388fff;
		position: relative;
	}
	
	.detail-content-tab ul .tab-active:after{
		content: '';
		background: #388fff;
		width: 50%;
		margin-left: calc((100% - 50%) / 2);
		height:3px;
		border-radius: 1.5px;
		position: absolute;
		bottom: -15px;
		left: 0;
	}
	
	
	.chaptors{
		width: 100%;
		background: #f8fafc;
		
		padding: 30px 0;
	}
	
	.chaptors-main{
		
			width: 1000px;
			margin: 0 auto;
	}
	
	.chaptors-content{
		box-sizing: border-box;
		padding: 20px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
		background: #ffffff;
		box-shadow: 0px 2px 4px rgba(0,0,0,0.09);
		border-radius: 5px;
	}
	
	.chaptors-content-text{
		color: #474747;
		line-height: 35px;
		font-size: 14px;
		margin-bottom: 20px;
	}
	
	.chaptors-content-operation{
		display: flex;
		align-items: center;
		justify-content: right;
	}
	
	.operation-buy{
		width: 99px;
		height: 30px;
		color: #ffffff;
		margin-right: 15px;
		background: #f11f1d;
		border-radius: 15px;
		text-align: center;
		line-height: 30px;
		font-size: 12px;
		cursor: pointer;
		transition: all linear 0.2s;
	}
	
	.operation-buy:hover{
		background: #ca1717;
		box-shadow: 0 2px 4px rgba(0,0,0,0.09);
	}
	
	.operation-buy:active{
		background: #b21414;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
	}
	
	.operation-add{
		width: 99px;
		height: 30px;
		color: #f11d1d;
		background: #fde7e7;
		border-radius: 15px;
		text-align: center;
		line-height: 30px;
		font-size: 12px;
		cursor: pointer;
		transition: all linear 0.2s;
	}
	
	.operation-add:hover{
		background: #dfcccc;
		color: #c81717;
	}	
	
	.operation-add:active{
		background: #c3b3b3;
		color: #a91313;
	}
	
	.chaptors-list{
		margin: 30px 0 0 0;
	}
	
	.chaptors-item{
		box-sizing: border-box;
		width: 100%;
		background: #ffffff;
		box-shadow: 0 2px 4px rgba(0,0,0,0.09);
		border-radius: 5px;
		padding:20px;
	}
	
	.chaptors-item+.chaptors-item{
		margin-top: 15px;
	}
	
	.chaptors-item-title h3{
		padding: 5px 0;
		font-size: 20px;
		font-weight: bold;
		color:#333333;
	}
	
	.chaptors-item-title div{
		font-size: 14px;
		color:#5c5c5c;
		margin: 10px 0;
	}
	
	.video-item{
		display: flex;
		height: 40px;
		line-height: 30px;
		padding: 5px 0 5px 10px;
		margin: 0 0 10px 0;
		border-radius: 8px;
		justify-content: space-between;
		transition: background linear 0.2s;
	}
	
	.video-item:hover{
		background: #e0e0e0;
	}
	
	.video-item-left{
		display: flex;
		align-items: center;
	}
	
	.video-item-left h3{
		margin-left: 10px;
		color: #333333;
		font-size: 14px;
		font-weight: bold;
	}
	
	.video-item-left div{
		font-size: 16px;
		font-weight: 400;
		color: #333333;
	}
	
	.video-item-right{
		display:flex;
		align-items: center;
		justify-content: center;
	}
	
	.video-item-right div{
		margin: 0 5px 0 0;
		width: 80px;
		height: 30px;
		line-height: 30px;
		border: 0px;
		outline: none;
		color: #fff;
		background: #388fff;
		border-radius: 12px;
		cursor: pointer;
		font-size: 14px;
		text-align: center;
		transition: background linear 0.2s;
	}
	
	.video-item-right div:hover{
		background: #0063c7;
	}
	
	.video-item-right div:active{
		background: #004f9e;
	}
	
	.downloads{
		width: 100%;
	}
	
	.downloads-main{
		width: 1000px;
		margin: 0 auto;
	}
	
	.downloads-main ul{
		margin: 0 auto;
		padding: 30px 0;
		border: none;
	}
	
	.downloads-item{
		display: flex;
		margin: 20px auto;
		align-items: center;
		justify-content: space-between;
		padding: 5px 10px;
		background: #ffffff;
		border-radius: 8px;
		box-shadow: 0px 3px 6px rgb(0 0 0 / 9%);
	}
	
	.downloads-item-left{
		display: flex;
		align-items: center;
		margin-left: 2px;
		font-size: 14px;
	}
	
	::v-deep.downloads-item-left .el-icon{
		padding-right: 10px;
	}

	
	.downloads-item-right button{
		width: 100px;
		border: none;
		border-radius: 8px;
		margin: 5px 0;
		font-size: 14px;
		text-align: center;
		color: #fff;
		background-color: #007bff;
		font-weight: 400;
		line-height: 2em;
		cursor: pointer;
	}
	
	.downloads-item-right button:hover{
		background-color: #0063c7;
	}
</style>