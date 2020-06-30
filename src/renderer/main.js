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
Vue.trans = Vue.prototype.$trans = (str, vars = {}) => {
	let translation, keys = Object.keys(vars);

	if(str in translations[store.state.language]) {
		translation = translations[store.state.language][str];
	}
	else {
		translation = str;
	}



	keys.forEach((key) => {
		translation = translation.replace(new RegExp(':' + key, 'g'), vars[key]);
	});

	return translation;
};

Vue.notify = Vue.prototype.$notify = (options) => {
	store.dispatch('addNotification', options);
};

Number.prototype.pad = function(length, str = ' ') {
	let s = String(this);

	while (s.length < (length || 2)) {
		s = str + s;
	}

	return s;
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
			let url, method,
				client = axios.create({
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

				url = config.url;
				method = config.method.toUpperCase();

				return config;
			});

			client.interceptors.response.use((response) => {
				this.$store.commit('setLoading', false);

				return response;
			}, () => {
				this.$notify({
					type: 'error',
					text: this.getErrorMessage(url, method),
					timeout: 2000
				});

				this.$store.commit('setLoading', false);
			});

			return client;
		},
		getErrorMessage(requestUrl, requestMethod) {
			const errorMessages = {
				'DELETE ^timesheets/\\d+$'      : this.$trans('Failed to delete the timesheet!'),
				'PATCH  ^timesheets/\\d+/stop$' : this.$trans('Failed to stop the active timesheet!'),
				'PATCH  ^timesheets/\\d+$'      : this.$trans('Failed to modify the active timesheet!'),
				'GET    ^timesheets/active$'    : this.$trans('Failed to fetch the active timesheet!'),
				'GET    ^timesheets$'           : this.$trans('Failed to load the timesheets!'),
				'POST   ^timesheets$'           : this.$trans('Failed to start recording!'),
				'GET    ^projects$'             : this.$trans('Failed to load the projects!'),
				'GET    ^activities$'           : this.$trans('Failed to load the activities!'),
				'GET    ^customers/\\d+$'       : this.$trans('Failed to load the details of the customer!'),
				'GET    ^customers$'            : this.$trans('Failed to load customers!')
			};

			for(let key in errorMessages) {
				const parts = /^([A-Z]+) +(.*)$/.exec(key);
				const method = parts[1].toUpperCase();
				const regexp = new RegExp(parts[2]);

				if(method === requestMethod && regexp.test(requestUrl)) {
					return errorMessages[key].replace(':url', requestUrl);
				}
			}

			return this.$trans('An error occured during the request! (:url)').replace(':url', requestUrl);
		}
	},
	router,
	store,
	template: '<App/>',
	beforeCreate() {
		this.$store.commit('initialize');
	}
}).$mount('#app');
