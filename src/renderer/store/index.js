import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

/**
 * This data is stored in the localStorage. If you extend the store and
 * want the new property to be synced, make sure you add it to the
 * whitelist array in the main.js.
 */
export default new Vuex.Store({
	state: {
		loading: false,
		host: '',
		username: '',
		apiKey: '',
		language: '',
		projects: [],
		activities: [],
		customers: [],
		notifications: [],
		languages: {
			'en': 'English',
			'hu': 'Magyar'
		},
		currencies: [
			'USD',
			'GBP',
			'EUR',
			'HUF'
		]
	},
	mutations: {
		setLoading(state, loading) {
			state.loading = loading;
		},
		setHost(state, host) {
			state.host = host;
		},
		setUsername(state, username) {
			state.username = username;
		},
		setApiKey(state, apiKey) {
			state.apiKey = apiKey;
		},
		setLanguage(state, language) {
			state.language = language;
		},
		setProjects(state, projects) {
			state.projects = projects;
		},
		setActivities(state, activities) {
			state.activities = activities;
		},
		setCustomers(state, customers) {
			state.customers = customers;
		},
		addNotification(state, notification) {
			notification.id = Math.random().toString(36);
			state.notifications.push(notification);
		},
		setNotifications(state, notifications) {
			state.notifications = notifications;
		},
		removeNotification(state, notification) {
			state.notifications.splice(
				state.notifications.findIndex(
					(element) => element.id === notification
				),
				1
			);
		},
		initialize(state) {
			if(localStorage.getItem('data')) {
				this.replaceState(
					Object.assign(state, JSON.parse(localStorage.getItem('data')))
				);
			}
		}
	},
	actions: {
		setLoading({commit}, loading) {
			commit('setLoading', loading);
		},
		setHost({commit}, host) {
			commit('setHost', host);
		},
		setUsername({commit}, username) {
			commit('setUsername', username);
		},
		setApiKey({commit}, apiKey) {
			commit('setApiKey', apiKey);
		},
		setLanguage({commit}, language) {
			commit('setLanguage', language);
		},
		setProjects({commit}, projects) {
			commit('setProjects', projects);
		},
		setActivities({commit}, activities) {
			commit('setActivities', activities);
		},
		setCustomers({commit}, customers) {
			commit('setCustomers', customers);
		},
		addNotification({commit}, notification) {
			commit('addNotification', notification);
		},
		removeNotification({commit}, notification) {
			commit('removeNotification', notification);
		}
	},
	strict: process.env.NODE_ENV !== 'production'
})
