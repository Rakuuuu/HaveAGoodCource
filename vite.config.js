import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
//引入插件
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';
import requireTransform from 'vite-plugin-require-transform';


const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
	define: {//解决vite不支持'@'的问题
		'process.env': {},
	},
	plugins: [
		vue(),
		//配置插件和@代表src目录
		AutoImport({
			imports:['vue', 'vue-router'],
			resolvers:[
				ElementPlusResolver(),
			],
		}),
		requireTransform({//解决Vite不能使用require问题
				fileRegex: /.js$|.vue$/
			}),
		Components({
			resolvers: [
				// Auto register Element Plus components
				// 自动导入 Element Plus 组件
				ElementPlusResolver(),
			],
		})
	],
	server:{//设置代理
		proxy:{
			'/api':'http://testapi.xuexiluxian.cn'
		}
	},
	resolve: {
		// 配置路径别名
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	}
})
