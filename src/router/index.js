import {
	createWebHashHistory,
	createRouter
} from 'vue-router';
import {useUserStore} from '@/store/user';
import {useCartStore} from '@/store/cart';

const routes = [
	{
		path: '/',
		redirect:'/home'
	},
	{
		path: '/home',
		name: 'home',
		component: () => import('@/views/Home.vue'),
		meta:{
			title:'主页'
		},
	},
	{
		path: '/course',
		name: 'course',
		component: () => import('@/views/Course.vue'),
		meta:{
			title:'课程浏览'
		},
	},
	{
		path: '/course/detail/:id',
		name: 'detail',
		component: () => import('@/views/Detail.vue'),
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('@/views/Login.vue'),
		meta:{
			title:'用户登录'
		},
		beforeEnter: (to, from, next) => { //导航守卫
			if (useUserStore().token) {
				next(from.path);//回去
			} else {
				next();
			}
		}
	},
	{
		path: '/course-play/:courseId/:chapterId',
		name: 'course-play',
		component: () => import('@/views/CoursePlay.vue')
	},
	{
		path: "/cart",
		name: "cart",
		component: () => import("@/views/Cart.vue"),
		meta:{
			title:'购物车'
		},
		beforeEnter: (to, from, next) => { //导航守卫
			if (useUserStore().token) {
				next();
			} else {
				next('/login');
			}
		}
	},
	{
		path: "/confirm-order",
		name: "confirm-order",
		component: () => import("@/views/ConfirmOrder.vue"),
		meta:{
			title:'确认订单'
		},
		beforeEnter: (to, from, next) => { //导航守卫
			if (from.name !== 'cart' && useCartStore().orderList.length === 0){
				next('/cart');
			} else if(!useUserStore().token){
				next('/login');
			} else {
				next();
			}
		}
	}
]

const router = createRouter({
	routes, //`routes: routes` 的缩写
	history: createWebHashHistory()
});

router.beforeEach((to, from, next)=>{
	if(to.meta.title){
	    document.title = to.meta.title
	  }
	  
	if(to.matched.length === 0){
		next('/home');
	} else {
		next();
	}

})

export default router;
