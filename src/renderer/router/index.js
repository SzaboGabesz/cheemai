import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/authentication-data',
			name: 'authentication-data',
			component: require('@/components/AuthenticationData').default
		},
		{
			path: '/',
			name: 'index',
			component: require('@/components/Index').default
		},
		{
			path: '/settings',
			name: 'settings',
			component: require('@/components/Settings').default
		},
		{
			path: '*',
			redirect: '/'
		}
	]
})
