<template>
	<div class='nav-swiper'>
		<div class='nav-swiper-main'>
			<div class='swiper-top'>
				<ul  @mouseleave="mouseOut()"> <!-- 防止鼠标移出列表hover页面就消失 -->
					<li 
						v-for='item in firstList'
						:key='item.id'
						@mouseenter="mouseHover(item.id)"
						:class="{'active':currentHoverId === item.id}"
					>
						<span>{{item.categoryName}}</span>
						<el-icon><ArrowRight /></el-icon>
					</li>

					<div 
						class='active-right' 
						v-if="isShow"
					>
						<div class="active-right-top">
							<h3 class="active-title">基础知识</h3>
							<div>
								<div>知识点：</div>
								<ul>
									<li
										v-for="item in secondList"
										:key='item.id'
									>{{item.categoryName}}</li>
								</ul>
							</div>
						</div>
						<div class="active-right-bottom">
							<ul>
								<li
									v-for='item in secondListCourses'
									:key = 'item.id'
									@click="toDetail(item.id)"
								>
									<img :src='item.courseCover'/>
									<div>
										<div class="active-course-title">{{item.courseName}}</div>
										<div class="active-course-level">{{courseTypeFn(item.courseLevel)}} · {{item.purchaseCounter}}人报名</div>
										<div class="active-course-price" v-if="item.isMember===0">免费学习</div>
										<div class="active-course-price vip" v-else>会员专享</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</ul>
				<div>
				  <el-carousel 
					:interval="3000" 
					arrow="always"
					v-if="sliderList.length > 0"
					>
					<el-carousel-item 
						v-for="item in sliderList" 
						:key="item.id"
					>
						<img :src="item.imageUrl"/>
					</el-carousel-item>
				  </el-carousel>
				</div>
			</div>
			<ul class='swiper-bottom'>
				<li>
					<h3>
						<img src="@/assets/img/chuji.png"/>
					</h3>
					<div>
						<h4>初级课程</h4>
						<span>入门快，岗位多</span>
					</div>
				</li>
				<li>
					<h3>
						<img src="@/assets/img/zhongji.png"/>
					</h3>
					<div>
						<h4>中级课程</h4>
						<span>进阶与实战</span>
					</div>
				</li>
				<li>
					<h3>
						<img src="@/assets/img/gaoji.png"/>
					</h3>
					<div>
						<h4>高级课程</h4>
						<span>轻松掌握核心技能</span>
					</div>
				</li>
				<li>
					<h3>
						<img src="@/assets/img/xiangmu.png"/>
					</h3>
					<div>
						<h4>项目实战</h4>
						<span>手把手实践</span>
					</div>
				</li>
				<li>
					<h3>
						<img src="@/assets/img/suanfa.png"/>
					</h3>
					<div>
						<h4>前端算法</h4>
						<span>笑傲前端技能</span>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { onBeforeMount } from 'vue';

//element+
import {ArrowRight} from '@element-plus/icons-vue';
//右侧数据切换
let isShow = ref(false);
//api
import {getSliders} from '@/utils/api/slider.js';
import {getFirstCategorys, getSecondCategorys, courseSearch} from '@/utils/api/course.js';
import {useRouter} from 'vue-router';	
let router = useRouter();
//mixin 导入很多组件都会复用来判断课程类型的函数
import courseType from '@/mixins/courseType.js';
let {courseTypeFn} = courseType();

let sliderList = ref([]);//装轮播图数据
let firstList = ref([]);//装一级分类的列表
let firstListCoursesAllPageInfo = ref([]);//按pageInfo对象分别装所有一级分类里面的课程
let currentHoverId = ref('');//当前hover的item，如果没有hover就为空串,如果hover了就是该item的id

let secondListAll = ref([]);//装所有二级分类的列表，优化只需get一次数据
let secondList = ref([]);//装二级分类的列表
let secondListCourses = ref([]);//装二级分类里面的课程

//生命周期钩子函数
onBeforeMount(()=>{
	getSliders().then(res=>{
		sliderList.value = res.data.list;
		});
	getFirstCategorys().then(res=>{
		firstList.value = res.data.list;
		for(let i in firstList.value){
			courseSearch({
				pageSize: 4,
				pageNum:1,
				entity:{
					firstCategory:firstList.value[i].id
				}
				}).then((res) => {
					firstListCoursesAllPageInfo.value.push(...res.data.pageInfo.list);
				})
		}
	});
	getSecondCategorys({categoryId: -1}).then(res => {
		secondListAll.value = res.data.list;
	});
})

//鼠标移入事件
const mouseHover = (id) => {
	isShow.value = true;
	currentHoverId.value = id;
	secondList.value = secondListAll.value.filter((value) =>{
		return value.parentId === id;
	})
	
	secondListCourses.value = firstListCoursesAllPageInfo.value.filter((value)=>{
		return id === value.firstCategory;
	});
}
//鼠标移出事件
const mouseOut = () => {
	isShow.value = false;
	currentHoverId.value = '';
};

const toDetail = (id) =>{
		router.push({
			path:`/course/detail/:id`,
			name:'detail',//带param传参一定要加上
			params:{
				id: id
			}
		})
	}
</script>

<style scoped>
	.nav-swiper{
		background: url('@/assets/img/transitionbg.png') no-repeat;
		width: 100%;
		height: 600px;
		box-sizing: border-box;
		padding:47px 0;
	}
	
	.nav-swiper-main{
		width: 1000px;
		/* padding: 47px 0; */
		margin: 0 auto;
		border-radius: 0 0 11px 11px;
		box-shadow: 0px 10px 20px rgba(0,0,0,0.1600);
		overflow: hidden;
	}
	
	.swiper-top{
		/* width: 100%; */      /* 默认宽度100% */
		display: inline-flex;
		justify-content: space-between;/* 每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。 */
		height: 373px;
		border-radius: 11px 11px 0 0;
	}
	
	.swiper-top>ul{
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: space-around;
		width: 160px;
		height: 373px;
		background: #2b283d;
		border-radius: 11px 0 0 0;
	}
	
	.swiper-top>ul>li{
		display: flex;
		align-items: center;
		justify-content: space-between;/* 两端对齐主轴的起点与终点，项目之间的间隔都相等。 */
		padding: 0 10px;
		width: 140px;/*减去padding的20*/
		height: 37px;
		color: #f2f2f2;
		cursor: pointer;
		font-size: 12px;
	}
	
	.el-carousel__container .el-carousel__indicators .el-carousel__indicator .el-carousel__button{
		width: 5px !important;
	}
	
	/* .swiper-top ul li+li{ */   /* "+"选择器：选择所有紧跟在 <li> 元素之后的第一个 <li> 元素*/
		/* margin-top: 35px; */
	/* } */
	
	.active{
		background: linear-gradient(90deg, #3fe5ff, 
			rgba(62, 222, 255, 0.93), 2%, 
			rgba(60,203,255,0.73) 9%, 
			rgba(58,186,255,0.56) 17%,
			rgba(57,172,255,0.41) 25%,
			rgba(55,160,255,0.28) 33%, 
			rgba(54,150,255,0.18) 43%, 
			rgba(53, 142, 255, 0.1) 53%, 
			rgba(53,137,255,0.04) 64%, 
			rgba(53, 133, 255, 0.01) 77%,
			rgba(53,133,255,0) 100%
		);
	}
	
	.active-right{/*li被hover active时，显示的首页菜单分类数据*/
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		left: 160px;/*左侧li宽度为160*/
		z-index: 999;
		width: 724px;
		height:373px; 
		background: #ffffff;
		border-radius: 0 11px 0 0;
	}
	
	.active-right-top{/*active的上半部分*/
		padding: 23px 30px;
	}
	
	.active-title{
		font-weight: bolder;
	}
	
	.active-right-top>div{
		display: flex;
		margin-top: 19px;
	}
	
	.active-right-top>div ul{
		display: flex;
		flex-wrap: wrap;/*自动换行*/
		margin-left: 7px;
	}
	
	.active-right-top>div ul li+li{
		/* display: flex; */
		margin-left: 20px;
	}
	
	.active-right-bottom{
		width: 724px;
		height: 217px;
		background: #f3f5f6;
	}
	
	.active-right-bottom>ul{
		display: flex;
		flex-wrap: wrap;
		height: 100%;
		align-items: center;
		padding: 0 30px;
	}
	
	.active-right-bottom>ul li{
		display: flex;
		width: 50%;
		cursor: pointer;
	}
	
	.active-right-bottom>ul li img{
		width: 140px;
		height:80px;
		border-radius: 5px;
	}
	
	.active-right-bottom>ul li>div{/*图片右边的上中下布局*/
		display: flex;
		margin-left: 10px;
		flex-direction: column;
		justify-content: space-between;
	}
	
	.active-course-title{
		font-size: 14px;
		color:#333333;
		font-weight: bolder;
	}
	
	.active-course-level{
		font-size: 12px;
		color:#808080;
	}
	
	.active-course-price{
		font-size: 12px;
		color: #3586ff;
	}
	
	.active-course-price.vip{
		width: 64px;
		height: 16px;
		line-height: 16px;
		margin-right: 5px;
		border-radius: 16px 0 16px 0;
		color: #fff;
		background: linear-gradient(90deg, #ff928e 0%, #fe7062 99%);
		text-align: center;
	}
	
	.swiper-top > div {/* >:直系选择选中走马灯所属的div */
		width: 840px;
		height: 373px;
		border-radius: 0 11px 0 0;
		overflow: hidden;
	}
	
/* 	::v-deep是什么？
	事先声明：在这里直接选中.el-carousel修改样式是不生效的！！！！
	在局部组件中修改第三方组件库的样式，
	而又不想去除因scoped属性而造成的组件之间样式覆盖的问题。
	这个时候我们就可以通过<样式穿透>这个特殊方式，
	穿透原有的默认样式，实现需要的效果。
	 语法：
	 外层容器 /deep/ 组件 { }
	 外层容器 ::v-deep组件{ }
	 */

	::v-deep .el-carousel{
		height: 373px;
	}
	
	::v-deep .el-carousel img{
		width: 100%;
		height: 373px;
	}
	
	::v-deep .el-carousel__container{
		height: 373px;
	}
	
	.swiper-bottom{
		display: flex;
	}
	
	.swiper-bottom li{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 213px;
		height: 133px;
		background: #ffffff;
		border-radius: 0 0 0 11px;
		cursor: pointer;
	}
	
	.swiper-bottom li img{
		width: 64px;
		height: 64px;
	}
	
	.swiper-bottom li div{
		display: flex;
		flex-direction: column;
		justify-content: space-around;/*每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。 */
		margin-left: 11px;
	}
	
	.swiper-bottom li div h4{
		font-weight: bolder;
		font-size: 16px;
		line-height: 32px;
		color: #333333;
	}
	
	.swiper-bottom li span{
		font-size: 12px;
		color: #808080;
	}
</style>