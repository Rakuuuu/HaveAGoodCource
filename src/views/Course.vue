<template>
	<Header></Header>
	<div class="filter">
		<div class="filter-main">
			<div class="filter-item">
				<div class="item-title">课程方向：</div>
				<ul>
					<li 
						:class="currentFirstId===''?'active':''"
						@click="cleanCurrentFirstId"
					>全部</li>
					<li
						v-for='item in firstList'
						:key="item.id"
						 :class="currentFirstId===item.id?'active':''"
						@click="eventFirst(item.id)"
					>{{ item.categoryName }}</li>
				</ul>
			</div>
			<div class="filter-item">
				<div class="item-title">课程分类：</div>
				<ul>
					<li 
						:class="currentSecondId===''?'active':''"
						@click="cleanCurrentSecondId"
					>全部</li>
					<li
						v-for='item in secondList'
						:key="item.id"
						 :class="currentSecondId===item.id?'active':''"
						@click="eventSecond(item.id)"
					>{{ item.categoryName }}</li>
				</ul>
			</div>
			<div class="filter-item">
				<div class="item-title">课程难度：</div>
				<ul>
					<li  
						:class="currentLevel === 0 ?'active':''"
						@click="cleanCurrentLevel"
					>
						全部
					</li>
					<li
						v-for='item in levelList'
						:key="item.id"
						:class="currentLevel === item.id ?'active':''"
						@click="eventLevel(item.id)"
					>{{ item.name }}</li>
				</ul>
			</div>
		</div>
	</div>
	<div class='course-list'>
		<div class='list-main'>
			<div class="list-top">
				<ul>
					<li 
						v-for="item in courseFilter"
						:class="{'list-top-active': item.id === currentFilterId}"
						@click='eventFilter(item.id)'
					>
						<span>{{item.name}}</span>
						<div 
							class="caret"
							v-if="item.id===4"
						>
							<el-icon size="8" :color="courseFilter[3].sortPriceMode==='price-asc'?'#2c8eff':'gray'"><CaretTop /></el-icon>
							<el-icon size="8" :color="courseFilter[3].sortPriceMode==='price-desc'?'#2c8eff':'gray'"><CaretBottom /></el-icon>
						</div>
					</li>
				</ul>
				<el-radio-group v-model="radio" @change="eventRadio">
				  <el-radio :label="0" size="large">全部</el-radio>
				  <el-radio :label="1" size="large">免费课程</el-radio>
				  <el-radio :label="2" size="large">会员专属</el-radio>
				</el-radio-group>
			</div>
			<ul class="list-center" v-if='courseList.length !== 0'>
				<li
					v-for="item in courseList"
					:key="item.id"
					@click="toDetail(item.id)"
				>
					<img :src="item.courseCover"/>
					<div class='course-content'>
						<h3>{{item.courseName}}</h3>
						<div>{{courseTypeFn(item.courseLevel)}} · {{item.clicks}}人报名</div>
						<div class='price'>
							<div 
								class='price-vip' 
								v-if="item.isMember===1"
							>会员专享</div>
							<div class='price-free' v-else>免费课程</div>
							<div class='price-total'>￥ {{item.salePrice}}</div>
						</div>
					</div>
				</li>
			</ul>
			<div class="list-center-empty" v-else>
				<img src="@/assets/img/empty.png" width="250" height="158"/>
				<div>暂无课程资料</div>
			</div>
			<div class="list-bottom">
				<el-pagination 
					background 
					:current-page="courseParams.pageNum"
					layout="prev, pager, next" 
					@current-change="pageChange"
					:total="courseTotal" />
			</div>
		</div>
	</div>
	<Footer></Footer>
</template>

<script setup>
	//element+
	import {CaretTop, CaretBottom} from '@element-plus/icons-vue';
	import { onBeforeMount, reactive } from 'vue';
	import {getFirstCategorys, getSecondCategorys, courseSearch} from '@/utils/api/course';
	
	//mixin 导入很多组件都会复用来判断课程类型的函数
	import courseType from '@/mixins/courseType.js';
	let {courseTypeFn} = courseType();
	
	import router from '@/router/index.js';
	
	let courseParams = reactive({//reactive只接收对象
		pageNum: 1,
		pageSize: 8,
		entity:{
			firstCategory: '',
			secondCategory: '',
			courseLevel: '',
			sortBy:'',
			isMenber:'',//收费课
			isFree:''//免费课
		}
	});
	
	let courseTotal = ref(0);//课程总数
	let firstList = ref([]);//一级分类数据
	let currentFirstId = ref('');//当前选中的一级选项
	let secondList = ref([]);//二级分类数据	
	let currentSecondId = ref('');//当前选中的二级选项
	let courseList = ref([]);//课程列表数据
	let levelList = ref([//课程等级数据
		{name:'初级', id: 1},
		{name:'中级', id: 2},
		{name:'高级', id: 3}
	]);
	let currentLevel = ref(0);
	
	//排序的方式sortBy
	let currentFilterId = ref(1);
	let courseFilter = ref([
		{id:1, name:'综合'},
		{id:2, name:'最新课程'},
		{id:3, name:'最多报名'},
		{id:4, name:'价格', sortPriceMode: ''}
	])
	
	let radio = ref(0);
	
	//生命周期钩子函数
	onBeforeMount(()=>{
		//获取一级分类
		getFirstCategorys().then((res)=>{
			firstList.value = res.data.list;
		});
		//获取二级分类
		secondCategorys({categoryId: -1});
		//载入课程数据
		getCourseSearch(courseParams);
	})
	
	const toDetail = (id) =>{
		router.push({
			path:`/course/detail/:id`,
			name:'detail',//带param传参一定要加上
			params:{
				id: id
			}
		})
	}
	
	//封装请求函数，以便更快捷地给secondList和courseList赋值
	const secondCategorys = ( params ) => {
		getSecondCategorys(params).then((res) => {
			secondList.value = res.data.list;
		});
	} 
	const getCourseSearch = ( data ) => {
		courseSearch(data).then((res) => {
			// console.log(res.data.pageInfo.list);
			courseList.value = res.data.pageInfo.list;
			courseTotal.value = res.data.pageInfo.total;
		});
	}	
	
	//三层筛选的响应事件
	//一级筛选事件
	const eventFirst = (id) => {
		currentFirstId.value = id;
		currentSecondId.value = '';
		currentLevel.value = 0;
		
		courseParams.entity.firstCategory = id;
		courseParams.entity.secondCategory = '';
		courseParams.entity.courseLevel = '';
		secondCategorys({categoryId: id});
		getCourseSearch(courseParams);
	};
	//二级筛选事件
	const eventSecond = (id) => {
		currentSecondId.value = id;
		
		courseParams.entity.secondCategory = id;
		courseParams.entity.courseLevel = '';
		getCourseSearch(courseParams);
	}
	//三级（课程等级）筛选事件
	const eventLevel = (level) => {
		currentLevel.value = level;
		
		courseParams.entity.courseLevel = level;
		getCourseSearch(courseParams);
	}
	
	//恢复一级筛选全部
	const cleanCurrentFirstId = () =>{
		currentFirstId.value = '';
		currentSecondId.value = '';
		currentLevel.value = 0;
		//获取二级分类
		secondCategorys({categoryId: -1});
		
		//初始化请求参数
		courseParams.pageNum = 1;
		courseParams.entity.firstCategory = '';
		courseParams.entity.secondCategory = '';
		courseParams.entity.courseLevel = '';
		
		getCourseSearch(courseParams);
	}
	
	//恢复二级筛选全部
	const cleanCurrentSecondId = () =>{
		currentSecondId.value = '';
		currentLevel.value = 0;
		
		//初始化除了一级id以外的请求参数
		courseParams.pageNum = 1;
		courseParams.entity.secondCategory = '';
		courseParams.entity.courseLevel = '';
		
		getCourseSearch(courseParams);
	}
	
	//恢复三级筛选全部
	const cleanCurrentLevel = () =>{
		currentLevel.value = 0;		
		//初始化除了一级、二级筛选以外的请求参数
		courseParams.pageNum = 1;
		courseParams.entity.courseLevel = '';
		getCourseSearch(courseParams);
	}
	
	//列表排序
	const eventFilter = (id) => {
		currentFilterId.value = id;
		if(id === 1){
			courseParams.entity.sortBy = '';
			courseFilter.value[3].sortPriceMode = '';
		} else if(id === 2){
			courseParams.entity.sortBy = 'time-desc';
			courseFilter.value[3].sortPriceMode = '';
		} else if(id === 3){
			courseParams.entity.sortBy = 'clicks-desc';
			courseFilter.value[3].sortPriceMode = '';
		} else if(id === 4){
			if(courseFilter.value[3].sortPriceMode === 'price-desc' || courseFilter.value[3].sortPriceMode === '')
				courseFilter.value[3].sortPriceMode = 'price-asc';
			else
				courseFilter.value[3].sortPriceMode = 'price-desc';
				
			courseParams.entity.sortBy = courseFilter.value[3].sortPriceMode;
		}
		getCourseSearch(courseParams);
	}
	
	//辨别免费或收费课程
	const eventRadio = () =>{
		if(radio.value === 0){
			courseParams.entity.isFree = '';
			courseParams.entity.isMember = '';
		} else if(radio.value===1){
			courseParams.entity.isFree = '1';
			courseParams.entity.isMember = '';
		} else if(radio.value===2){
			courseParams.entity.isFree = '';
			courseParams.entity.isMember = '1';
		}
		getCourseSearch(courseParams);
	}
	
	//切换当前页面的事件
	const pageChange = ( value ) =>{
		courseParams.pageNum = value;
		getCourseSearch(courseParams);
	}
</script>

<style scoped>
	.filter{
		width: 100%;
		height:197px;
		background: #f3f5f9;
	}
	
	.filter-main{
		width: 1000px;
		height:197px;
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		justify-content: space-around;
		margin: 0 auto;
	}
	
	.filter-item{
		display: flex;
		align-items: center;
	}
	
	.item-title{
		/*flex-shrink：
		默认值1.flex空间不足时挤压该元素；
		0.即flex空间不足不会挤压该元素*/
		flex-shrink: 0;
		padding: 0 20px;
		font-size: 14px;
		font-weight: bold;
		color: #333333;
	}
	
	.filter-item ul{
		display: flex;
		flex-wrap: wrap;
	}
	
	.filter-item ul li{
		/*flex-shrink：
		默认值1.flex空间不足时挤压该元素；
		0.即flex空间不足不会挤压该元素*/
		flex-shrink: 0;
		margin-right: 20px;
		padding: 0 5px;
		font-size: 14px;
		line-height:30px;
		font-weight: 400;
		color: #515759;
		cursor: pointer;
	}
	
	.filter-item ul li.active{
		line-height:30px;
		text-align: center;
		color:#388fff;
		text-decoration: none;
		background: rgba(44,128,255,.1);
		border-radius: 5px;
		font-size: 14px;
		pointer-events: none;/*不可点击*/
	}
	
	.course-list{
		padding: 50px 0;
		background:#ffffff;
		width: 100%;
	}
	
	.list-main{
		width: 1000px;
		margin: 0 auto;
	}
	
	.list-top{
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.list-top ul{
		display: flex;
		align-content: center;
	}
	
	.list-top ul li{
		display: flex;
		align-items: center;
		cursor: pointer;
		position: relative;
	}
	
	.list-top-active{
		color:#2c81ff;
	}
	
	.list-top-active:not(.list-top-active:last-child){
		pointer-events: none;/*价格排序可点击，其余不可点击*/
	}
	
	.list-top ul li+li{
		margin-left: 30px;
	}
	
	.list-top ul li+li:before{
		position: absolute;
		left: 0;
		content: '';
		margin-left: -15px;
		width: 0.5px;
		height: 15px;
		background: #808080;
	}
	
	.caret{
		display: flex;
		flex-direction: column;
	}
	
	.list-center{
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;/* 设置flex超出自动换行 */
	}
	
	.list-center li{
			width: 230px;
			height: 275px;
			margin-top: 38px;
			background: #ffffff;
			box-shadow: 1px 3px 3px rgba(27, 39, 94, 0.1);
			border-radius: 5px;
			overflow: hidden;
			cursor: pointer;
			transition: transform 0.2s;
	}
	
	.list-center li:hover{
		animation: floatUp  0.2s linear;
		transform: scale(105%, 110%);
	}
	
	/* .new-course-bottom li:out */
	
	@keyframes floatUp{
		0%{
			transform: scale(100%, 100%);
		}
		50%{
			transform: scale(102.5%, 105%);
		}
		100%{
			transform: scale(105%, 110%);
		}
	}
	
	/*如果列表有某行的项数为2—3个，就监视最后一行且列为2-3的元素并追加margin-right*/
	.list-center li:last-child:nth-child(4n + 2){/*监视最后一行且列为2的元素*/
		margin-right: 515px;/*计算每个元素的间距*/
	}
	
	.list-center li:last-child:nth-child(4n + 3){/*监视最后一行且列为3的元素*/
		margin-right: 255px;/*计算每个元素的间距*/
	}
	
	.list-center li img{
		width: 230px;
		height: 153px;
	}
	
	.list-center-empty{
		height: 400px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.list-center-empty img{
		width:250px;
		height:158px;
	}
	
	.list-center-empty div{
		color:#999999;
		margin-top: 20px;
	}
	
	.course-content{
		padding: 7px 16px;
		height: 108px;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}
	
	.course-content h3{
		font-weight: bolder;
		font-size: 16px;
		color:#333333;
	}
	
	.course-content>div{/* 课程等级和报名人数的文字 */
		font-size: 12px;
		color:#808080;
	}
	
	.price{
		display: flex;
		align-items: center;
	}
	
	.price-vip{
		width: 64px;
		height: 16px;
		line-height: 16px;
		margin-right: 5px;
		border-radius: 16px 0 16px 0;
		color: #fff;
		background: linear-gradient(90deg, #ff928e 0%, #fe7062 99%);
		text-align: center;
	}
	
	.price-free{
		margin-right: 10px;
		color: #2c81ff;
		text-align: center;
	}
	
	.price-total{
		font-size: 12px;
		color:#ff727f;
		line-height: 12px;
	}
	
	.list-bottom{
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-top: 50px;
	}
</style>