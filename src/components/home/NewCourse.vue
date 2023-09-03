<template>
	<div class='new-course'>
		<div class='new-course-main'>
			<div class='new-course-top'>
				<div class='title-hot'>
					<div class="hot">HOT</div>
					<div class='hot-triangle'></div>
				</div>
				<div class='title-text'>新上好课</div>
			</div>
			<ul class='new-course-bottom'>
				<li
					v-for="item in newList"
					:key="item.id"
					@click="toDetail(item.id)"
				>
					<img :src="item.courseCover"/>
					<div class='course-content'>
						<h3>{{item.courseName}}</h3>
						<div>{{courseTypeFn(item.courseLevel)}} · {{item.clicks}}人报名</div>
						<div class='price'>
							<div class='price-vip' v-if="item.isMember===1">会员专享</div>
							<div class='price-free' v-else>免费课程</div>
							<div class='price-total'>￥ {{item.salePrice}}</div>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
	import {mostNew} from '@/utils/api/course.js';
	import { onBeforeMount } from 'vue';
	import {useRouter} from 'vue-router';
	
	let router = useRouter();
	
	//新好上课数据
	let newList = ref([]);
	
	//mixin 导入很多组件都会复用来判断课程类型的函数
	import courseType from '@/mixins/courseType.js';
	let {courseTypeFn} = courseType();
	
	onBeforeMount(()=>{
		mostNew({
			pageNum:1,
			pageSize:8
		}).then(res => {
			newList.value = res.data.pageInfo.list;
		})
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
</script>

<style scoped>
	.new-course{
		padding: 38px 0;
		background: #f3f5f9;
	}
	
	.new-course-main{
		width: 1000px;
		margin: 0 auto;
	}
	
	.new-course-top{
		display: flex;
		align-items: center;
	}
	
	.title-hot{
		display: flex;/* 使小三角和hot文字的背景并排 */
	}
	
	.title-hot .hot{
		width: 65px;
		height: 25px;
		color:#fff;
		line-height: 25px;
		background: linear-gradient(90deg, #ff727f 0%, #fc685c 100%);
		text-align: center;
		border-radius: 5px 0 5px 5px;
	}
	
	.title-hot .hot-triangle{
		width: 0;
		height: 0;
		border: 2px solid #fc685c;
	/* 	设置右下透明 */
		border-bottom-color: transparent;
		border-right-color: transparent;
	/* ------------ */
	}
	
	.title-text{
		position: relative;
		margin-left: 11px;
		font-size: 23px;
		line-height:35px;
		color: #333333;
		z-index: 999;
	}
	
	.title-text:after{
		position: absolute;
		bottom: 0;
		left: 0;
		z-index: -1;/*防止被background盖住 */
		width: 120%;
		margin-left: -10%;
		height:9px;
		background: linear-gradient(90deg, #fbf84f 0%, #fea935 100%);
		border-radius: 5px;
		content: '';
	}
	
	.new-course-bottom{
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;/* 设置flex超出自动换行 */
	}
	
	.new-course-bottom li{
			width: 230px;
			height: 275px;
			margin-top: 38px;
			background: #ffffff;
			box-shadow: 1px 3px 3px rgba(27, 39, 94, 0.1);
			border-radius: 5px;
			overflow: hidden;
			transition: transform 0.2s;
	}
	
	.new-course-bottom li:hover{
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
	.new-course-bottom li:last-child:nth-child(4n + 2){/*监视最后一行且列为2的元素*/
		margin-right: 515px;/*计算每个元素的间距*/
	}
	
	.new-course-bottom li:last-child:nth-child(4n + 3){/*监视最后一行且列为3的元素*/
		margin-right: 255px;/*计算每个元素的间距*/
	}
	
	.new-course-bottom li:hover{
		cursor:pointer;
	}
	
	.new-course-bottom li img{
		width: 230px;
		height: 153px;
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
</style>