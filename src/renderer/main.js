import Vue from 'vue';
import axios from 'axios';
import App from './App';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) {
	Vue.use(require('vue-electron'));
}

Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.trans = Vue.prototype.$trans = (str) => {
	if(str in translations[store.state.language]) {
		return translations[store.state.language][str];
	}
	else {
		return str;
	}
};

Vue.notify = Vue.prototype.$notify = (options) => {
	store.dispatch('addNotification', options);
};

store.subscribe((mutation, state) => {
	const data = {};
	const whitelist = [
		'host',
		'username',
		'apiKey',
		'language'
	];

	// Save only the whitelisted items from the store
	Object.keys(state).forEach((item) => {
		if(whitelist.indexOf(item) !== -1) {
			data[item] = state[item];
		}
	});

	localStorage.setItem('data', JSON.stringify(data));
});

let translations = {};

Object.keys(store.state.languages).forEach((languageCode) => {
	try {
		translations[languageCode] = require(`./locale/${languageCode}.json`);
	}
	catch(e) {}
});

/* eslint-disable no-new */
new Vue({
	components: { App },
	methods: {
		/**
		 * @param {Object} options
		 * @param {Boolean} options.hideLoader
		 * @param {Boolean} options.showLoader
		 *
		 * @return {AxiosInstance}
		 */
		getClient(options = {}) {
			let client = axios.create({
					baseURL: `${store.state.host}/api`,
					timeout: 60000
				});

			client.defaults.headers.common = {
				'X-AUTH-USER': store.state.username,
				'X-AUTH-TOKEN': store.state.apiKey,
			};

			client.interceptors.request.use((config) => {
				if(
					!(
						('hideLoader' in options && options.hideLoader === true) ||
						('showLoader' in options && options.showLoader === false)
					)
				) {
					this.$store.commit('setLoading', true);
				}

				return config;
			});

			client.interceptors.response.use((response) => {
				this.$store.commit('setLoading', false);

				return response;
			}, () => {
				this.$store.commit('setLoading', false);
			});

			return client;
		}
	},
	router,
	store,
	template: '<App/>',
	beforeCreate() {
		this.$store.commit('initialize');
	}
}).$mount('#app');
