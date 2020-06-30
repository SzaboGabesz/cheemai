<template>
	<div id="app">
		<header>
			<span>
				Cheemai
			</span>
			<span class="kimai-version">{{ version }}</span>
			<div class="actions">
				<a href="#" @click="minimize" class="minimize"></a>
				<a href="#" @click="maximize" class="maximize"></a>
				<a href="#" @click="close" class="close"></a>
			</div>
		</header>
		<main>
			<router-view></router-view>
		</main>
		<div class="xhr-loader" :class="{'visible': loading}">
			<div class="lds-ellipsis">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
		</div>
		<notification
				v-for="notification in notifications"
				:key="notification.id"
				:id="notification.id"
				:type="notification.type"
				:timeout="notification.timeout">
			{{ notification.text }}
		</notification>
	</div>
</template>

<script>
	require('perfect-scrollbar/css/perfect-scrollbar.css');
	require('./assets/scss/app.scss');
	const {remote, ipcRenderer} = require('electron');
	import {mapState} from 'vuex';
	import Notification from "./components/Notification";

	export default {
		name: 'cheemai',
		data: () => {
			return {
				version: ''
			};
		},
		components: {
			Notification
		},
		watch: {
			backgroundColor(colors) {
				this.changeBackgroundColor(colors);
			}
		},
		computed: {
			...mapState([
				'language',
				'loading',
				'languages',
				'notifications',
				'backgroundColor'
			])
		},
		methods: {
			getWindow() {
				return remote.BrowserWindow.getFocusedWindow();
			},
			minimize() {
				this.getWindow().minimize();
			},
			maximize() {
				this.getWindow().isMaximized() ? this.getWindow().unmaximize() : this.getWindow().maximize();
			},
			close() {
				this.getWindow().close();
			},
			changeBackgroundColor(colors) {
				this.$el.parentNode.style.background = `radial-gradient(circle at center, ${colors[0]} 0%, ${colors[1]} 90%)`;
			}
		},
		mounted() {
			this.changeBackgroundColor(this.backgroundColor);
		},
		created() {
			if(this.language === '') {
				ipcRenderer.send('get-locale');
				ipcRenderer.once('on-get-locale', (e, locale) => {
					const supportedLanguages = Object.keys(this.languages);

					if(supportedLanguages.indexOf(locale) !== -1) {
						this.$store.dispatch('setLanguage', locale);
					}
					else {
						this.$store.dispatch('setLanguage', supportedLanguages[0]);
					}
				});
			}

			if(this.backgroundColor.length === 0) {
				this.$store.dispatch('setBackgroundColor', ['#606E86', '#3B434E']);
			}

			this.$root.getClient().get('/version').then(({data}) => {
				this.version = `(w/ Kimai ${data.version})`;
			});
		}
	}
</script>
