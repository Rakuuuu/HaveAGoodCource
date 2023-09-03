<template>
	<div class="main">
		<div class='top'>
			<el-icon class="goBack" @click='router.go(-1)' title="返回">
				<ArrowLeftBold />
			</el-icon>
			<div class="name">{{`${courseInfo.courseName}：${courseInfo.currentChapterName}`}}</div>
		</div>
		<div class='play'>
			<div class='play-left'>
				<vue3VideoPlay
				    v-bind="options"
					@timeupdate="testFunc"
					@loadstart="onLoadstart"
					@loadeddata.prevent
					v-if="videoShow"
				/>
			</div>
			<div class='play-right'>
				<el-tabs tab-position="right">
					<el-tab-pane>
						<template #label>
							<div class="tabpanel-title">
								<div class="icon">
									<el-icon><Reading /></el-icon>
								</div>
								<p class="text">课程</p>
							</div>
						</template>
						<div class="course-container">
							<div class="courseName" title="courseInfo.courseName">
								{{courseInfo.courseName}}
							</div>
							<div class="courseDesc">{{courseInfo.courseDesc}}</div>
							<div class="courseImg">
								<img :src="courseInfo.courseCover" alt="" />
							</div>
							<div class="teacherRecommend" v-if="bizCourseTeacher.teacherName">
								讲师介绍
							</div>
							<div class="teacher" v-if="bizCourseTeacher.teacherAvatar">
								<div class="teacherAvt">
									<img :src="bizCourseTeacher.teacherAvatar" alt="" />
								</div>
								<div class="teacherInfo">
									<div class="teacherName">{{bizCourseTeacher.teacherName}}</div>
									<div class="teacherTag">{{bizCourseTeacher.tags}}</div>
								</div>
							</div>
							<div class="teacherReacher" v-if="bizCourseTeacher.research">
								{{bizCourseTeacher.research}}
							</div>
						</div>
					</el-tab-pane>
					<el-tab-pane>
						<template #label>
							<div class="tabpanel-title">
								<div class="icon">
									<el-icon><Memo /></el-icon>
								</div>
								<p class="text">章节</p>
							</div>
						</template>
						<div class="chapter-container">
							<dl class="list" v-for='item in chapterInfo' :key="item.id">
								<dt :title="item.chapterName">{{item.chapterName}}</dt>
								<dd 
									class="chapter-videos"
									v-for="i in item.children"
									:key='i.id'
									:class="i.chapterName === courseInfo.currentChapterName ? 'current' : ''"
									@click="test"
								>
									<div class="video-itemIcon"  ref="renderMap(child)">
										<el-icon><VideoPlay /></el-icon>
									</div>
									<div class="item-name"  :title="i.chapterName">
										{{i.chapterName}}
									</div>
								</dd>
							</dl>
						</div>
					</el-tab-pane>
					<el-tab-pane class="note">
						<template #label>
							<div class="tabpanel-title">
								<div class="icon">
									<el-icon><EditPen /></el-icon>
								</div>
								<p class="text" >笔记</p>
							</div>
						</template>
						<el-empty description="无笔记" v-if="bizCourseAttachments.length === 0"/>
						<div class="chapter-container" v-else>
							<dl class="list">
								<dt title="课程笔记" @click="debounce(test, 1000)">课程笔记</dt>
								<dd 
									class="chapter-videos"
									v-for="item in bizCourseAttachments"
									:key='item.id'
									@click="downloadSource(item)"
								>
									<div class="video-itemIcon"  ref="renderMap(child)">
										<el-icon><Document /></el-icon>
									</div>
									<div class="item-name"  :title="item.attachmentName">
										{{item.attachmentName}}
									</div>
								</dd>
							</dl>
						</div>
					</el-tab-pane>
				</el-tabs>
			</div>
		</div>
	</div>
</template>
<script setup>
	import { ArrowLeftBold, Document, VideoPlay, Memo, Reading, EditPen } from "@element-plus/icons-vue";
	import { onBeforeMount, reactive } from "vue";
	import {useRoute ,useRouter} from 'vue-router';
	import {player} from '@/utils/api/course';	
	import {useUserStore} from '@/store/user';//pinia
	import {getDetail , checkAuth, downloadAttachment, recordHistory, getLastHistoryByChapterId} from '@/utils/api/course';
	import "vue3-video-play/dist/style.css";//视频css
	import vue3VideoPlay from "vue3-video-play";//视频组件
	import { ElMessage } from "element-plus";
	import _ from 'lodash';
	
	let route = useRoute();
	let router = useRouter();
	let {courseId, chapterId} = route.params;
	
	let courseInfo = reactive({
		courseName:'',
		courseCover:'',
		courseDesc:'',
		currentChapterName:''
	});
	let bizCourseTeacher = reactive({
		teacherName:'',
		tags:'',
		teacherAvatar:'',
		research:''
	});
	let chapterInfo = ref({});
	let bizCourseAttachments = ref([]);
	
	//播放器选项
	const options = reactive({
	  width: "800px", //播放器高度
	  height: "450px", //播放器高度
	  color: "#409eff", //主题色
	  title: "示例视频", //视频名称
	  src: "../src/assets/video/testVideo.mp4", //视频源
	  muted: false, //静音
	  webFullScreen: false,
	  speedRate: ["0.5","0.75", "1.0", "1.25", "1.5", "2.0"], //播放倍速
	  autoPlay: false, //自动播放
	  loop: false, //循环播放
	  mirror: false, //镜像画面
	  ligthOff: false, //关灯模式
	  volume: 0.3, //默认音量大小
	  control: true, //是否显示控制
	  controlBtns: [
	    "audioTrack",
	    "quality",
	    "speedRate",
	    "volume",
	    "setting",
	    "pip",
	    "pageFullScreen",
	    "fullScreen",
	  ], //显示所有按钮,
	});
	
	let videoShow = ref(false);//内容加载完毕再显示视频
	
	onBeforeMount(()=>{
		player({
			courseId: courseId,
			chapterId: chapterId
		}).then(res=>{
			console.log(res);
			if(res.meta.code === '200'){
				courseInfo.courseName = res.data.courseInfo.courseName;
				courseInfo.courseCover = res.data.courseInfo.courseCover;
				courseInfo.courseDesc = res.data.courseInfo.bizCourseDetail.description;
				courseInfo.currentChapterName = res.data.chapterInfo.chapterName;
				bizCourseTeacher.teacherName = res.data.courseInfo.bizCourseTeacher.teacherName;
				bizCourseTeacher.teacherAvatar = res.data.courseInfo.bizCourseTeacher.teacherAvatar;
				bizCourseTeacher.tags = res.data.courseInfo.bizCourseTeacher.tags;
				bizCourseTeacher.research = res.data.courseInfo.bizCourseTeacher.research;
				bizCourseAttachments.value = res.data.courseInfo.bizCourseAttachments;
				chapterInfo.value = res.data.courseInfo.bizCourseChapters;
				document.title = `课程学习—${courseInfo.courseName}`;
				videoShow.value = true;
			} else {
				ElMessage({
					type:'warning',
					message:res.meta.msg
				})
			}
		}, err=>{
			ElMessage({
				type:'error',
				message:'错误'
			});
			router.go(-1);
		})
	});
	
	const testFunc = _.throttle((ev)=>{//节流函数
		console.log('throttle');
		onTimeupdate(ev);
	},5000,{
     leading: true,
     trailing: false
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
					  message: res.meta.msg,
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
	
	//向服务器更新播放时间
	const onTimeupdate = ( ev )=>{
		recordHistory({
			chapterId,
			courseId,
			memberId: useUserStore().userInfo.id,
			lastTime: ev.target.currentTime
		}).then(res =>{
			console.log(res);
		});
		
	}
	
	//向服务器获取播放时间
	const onLoadstart = ( ev )=>{
		getLastHistoryByChapterId({
			memberId:useUserStore().userInfo.id,
			courseId,
			chapterId
		}).then(res=>{
			if(res.meta.code === '200'){
				ev.target.currentTime = res.data.data.lastTime;
			} else {
				ElMessage({
					type:'warning',
					message:'读取进度异常'
				})
			}
			// console.log('获取播放时间',res);
		});
	}
	
	
	
</script>
<style scoped>
	>>>.el-tabs{
		height:450px !important;
	}
	
	>>>.el-tabs__item {
		padding: unset !important;
		width: 80px !important;
		height: 100px !important;
	}

	>>>.el-tabs__nav-wrap::after {
		background: unset !important;
	}

	>>>.el-tabs__active-bar.is-right {
		width: 0 !important;
	}

	>>>.el-tabs__item.is-active .tabpanel-title {
		background: #25282a !important;
	}

	>>>.el-tabs__item.is-active .tabpanel-title .icon,
	.el-tabs__item.is-active .tabpanel-title .text {
		color: #ffffff;
	}

	>>>.el-tabs__nav.is-right {
		padding: 20px 0;
		background: #1c1f21 !important;
	}

	>>>.el-tabs--right,
	>>>.el-tabs__content,
	>>>.el-tab-pane {
		height: 100%;
	}

	>>>.vjs-custom-skin>.video-js .vjs-big-play-button {
		background-color: rgba(0, 0, 0, 0.45);
		position: absolute;
		bottom: 60px;
		left: 20px;
		font-size: 3.5em;
		line-height: 2em !important;
		margin-left: unset;
		top: unset;
	}

	.main {
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
	}

	.top {
		padding: 0 20px;
		height: 80px;
		line-height: 80px;
		font-size: 20px;
		font-family: Microsoft YaHei;
		font-weight: bold;
		color: #25282A;
		opacity: 1;
		display: flex;
		align-items: center;
		position: relative;
		flex-shrink: 0;
	}

	.top .goBack {
		font-weight: bold;
		color: #545C63;
		cursor: pointer;
	}

	.top .name {
		/* padding: 0 10px; */
		align-self: center;
		position: absolute;
		top:50%;
		left:50%;
		transform: translate(-50%,-50%);
	}

	.top .collect {
		cursor: pointer;
		font-size: 16px;
		color: #A8A9AB;
	}

	.play {
		flex: 1;
		display: flex;
		background: #25282A;
		padding: 20px;
		height: 100%;
		width: 100%;
		/* overflow: scroll; */
		justify-content: center;
	}

	/* 视频播放开始 */
	.play-left {
		width: 800px;
		height:100%;
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.video-js .vjs-icon-placeholder {
/* 		width: 100%;
		height: 100%; */
		display: block;
	}

	/* 视频播放结束 */
	/* 播放列表开始 */
	.play-right {
		color: #ffffff;
		width: 400px;
		height: 100%;
		/* padding:calc((100% - 540px) / 2) 0; */
		display: flex;
		align-items: center;
		flex-shrink: 0;
		/* overflow: scroll;*/
	}

	.play-right .chapter-videos {
		display: flex !important;
		align-items: center;
		width: 400px;
		flex-shrink: 0;
	}
	
	.play-right .current{
		background: rgba(255, 255, 255, .3);
		cursor: initial;
		color: #fff;
		pointer-events: none;
		border-radius: 5px;
		overflow: hidden;
		box-sizing: border-box;
	}
	
	.play-right .current:hover{
		color:#fff;
	}

	.tabpanel-title {
		padding: 17px 0 18px 0;
		width: 100%;
		text-align: center;
	}

	.tabpanel-title .icon {
		height: 40px;
		font-size: 30px;
		line-height: 40px;
		color: #A4A5A6;
	}

	.tabpanel-title .text {
		height: 25px;
		line-height: 25px;
		color: #A4A5A6;
	}

	.chapter-container {
		height: 100%;
		overflow-y: scroll;
		padding: 0 10px;
	}

	.chapter-container .list {
		width: 100%;
		margin-bottom: 20px;
	}

	.list dt {
		font-size: 16px;
		font-weight: bold;
		line-height: 30px;
		color: #ffffff;
		opacity: 1;
		padding-bottom: 10px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
	}

	.list dd {
		width: 100%;
		height: 30px;
		line-height: 30px;
		padding: 2px 5px;
		margin: 0 0 5px 0;
		color: #a8a9ab;
		cursor: pointer;
	}

	.list dd:hover {
		color: #ffffff;
	}

	.list dd .video-itemIcon {
		height: 30px;
		margin-right: 10px;
		font-size: 18px;
		float: left;
		display: flex;
		align-items: center;
	}

	.list dd .item-name {
		float: left;
		width: calc(100% - 35px);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 14px;
	}

	/* 播放列表结束 */
	.video-player {
		height: 100%;
	}

	.loading {
		color: #ffffff;
		font-size: 20px;
		margin: 200px auto;
		width: 100px;
		text-align: center;
	}

	.loading img {
		width: 100%;
	}

	.finished {
		margin-top: 250px
	}

	.over {
		color: #ffffff;
		font-size: 20px;
		top: 0;
		width: 100%;
		height: 100%;
		text-align: center;
		position: absolute;
		background: rgba(0, 0, 0, .8);
	}

	.over .nextCourse {
		font-size: 24px;
		padding: 10px 0;
		border: none;
	}

	.over .resetLearn {
		background: rgba(200, 200, 200, .3) !important;
	}

	.goCourse {
		background: rgba(200, 200, 200, .3) !important;
	}

	.over .over-btn {
		width: 120px;
		height: 30px;
		margin: 20px;
		line-height: 30px;
		border-radius: 8px;
		border: 0px;
		outline: none;
		color: #FFFFFF;
		background: #3585FF;
	}

	.over .over-btn:hover {
		border: 1px solid #FFF;
		cursor: pointer;
	}
	
	::-webkit-scrollbar {
		width: 10px;
		height: 0px;
		/* background-color: rgba(240, 240, 240, 1); */
	}

	/*定义滚动条轨道 内阴影+圆角*/
	::-webkit-scrollbar-track {
		box-shadow: inset 0 0 0px rgba(240, 240, 240, .5);
		border-radius: 10px;
		background-color: rgba(240, 240, 240, .5);
	}

	/*定义滑块 内阴影+圆角*/
	::-webkit-scrollbar-thumb {
		border-radius: 10px;
		box-shadow: inset 0 0 0px rgba(240, 240, 240, .5);
		background-color: rgba(240, 240, 240, .5);
	}

	/* 课程开始 */
	.course-container {
		height: 100%;
		overflow-y: scroll;
		padding: 0 10px;
		color: #a8a9ab;
	}

	.course-container .courseName {
		font-size: 16px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: pointer;
		font-weight: bold;
	}

	.course-container .courseDesc {
		line-height: 25px;
		font-size: 13px;
		margin: 20px 0;
		letter-spacing: 1px;
		text-align: justify;
	}

	.course-container .courseImg {
		width: 100%;
		height: 150px;
		border-radius: 8px;
	}

	.course-container .courseImg img {
		width: 100%;
		height: 100%;
		border-radius: 8px;

	}

	.course-container .teacher {
		display: flex;
		text-align: center;
		justify-content: flex-start
	}

	.course-container .teacher .teacherAvt {
		margin: 10px 0;
		width: 60px;
		height: 60px;
		border-radius: 50%;
	}

	.course-container .teacher .teacherAvt img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.course-container .teacherRecommend {
		margin: 15px 0;
		font-size: 16px;
		font-weight: bold;
	}

	.course-container .teacher .teacherInfo {
		display: flex;
		flex-direction: column;
		margin: 15px 10px;
		text-align: left;
	}

	.course-container .teacher .teacherName {
		font-weight: bold;
		font-size: 16px;
	}

	.course-container .teacherTag {
		text-align: left;
		font-size: 13px;
		margin-top: 15px;
	}

	.course-container .teacherReacher {
		width: 100%;
		font-size: 13px;
		letter-spacing: 1px;
		line-height: 25px;
		text-align: justify;
	}
	.note .chapter-container{
		/* display: flex; */
	}
	/* 课程结束 */

</style>
