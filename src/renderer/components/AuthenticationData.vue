<template>
	<div id="authentication-data-wrapper">
		<div class="form">
			<div class="field">
				<label for="host">{{ $trans('Host') }}:</label>
				<input type="text" id="host" :value="host" @keyup="setHost">
			</div>

			<div class="field">
				<label for="username">{{ $trans('Username') }}:</label>
				<input type="text" id="username" :value="username" @keyup="setUsername">
			</div>

			<div class="field">
				<label for="apiKey">{{ $trans('API Key') }}:</label>
				<input type="text" id="apiKey" :value="apiKey" @keyup="setApiKey">
			</div>

			<button @click="$router.push('/')" class="action" :class="{'visible': !loading}" :disabled="!valid">
				<img src="~@/assets/icons/valid-auth-data.svg" v-if="valid">
				<img src="~@/assets/icons/invalid-auth-data.svg" v-else>
				{{ valid ? $trans('Looking good, go back') : $trans('Invalid credentials') }}
			</button>
		</div>
	</div>
</template>

<script>
	import {mapState} from 'vuex';

	export default {
		name: 'AuthenticationData',
		data() {
			return {
				valid: true,
				lastChange: 0
			};
		},
		watch: {
			host() {
				this.validateCredentials();
			},
			username() {
				this.validateCredentials();
			},
			apiKey() {
				this.validateCredentials();
			}
		},
		computed: {
			...mapState([
				'loading',
				'host',
				'username',
				'apiKey'
			])
		},
		methods: {
			async validateCredentials() {
				this.lastChange = Date.now();

				setTimeout(async () => {
					if(this.lastChange <= Date.now() - 1500) {
						try {
							const {status} = await this.$root.getClient().get('users/me');

							this.valid = status === 200;
						}
						catch (e) {
							this.valid = false;
						}
					}
				}, 1500);
			},
			setHost(e) {
				this.$store.dispatch('setHost', e.target.value);
			},
			setUsername(e) {
				this.$store.dispatch('setUsername', e.target.value);
			},
			setApiKey(e) {
				this.$store.dispatch('setApiKey', e.target.value);
			}
		},
		created() {
			this.validateCredentials();
		}
	}
</script>

<style>
	#authentication-data-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	#authentication-data-wrapper .form {
		display: flex;
		flex-direction: column;
	}

	#authentication-data-wrapper .field {
		display: flex;
		flex-direction: column;
		margin-bottom: 15px;
		font-size: 12px;
	}

	#authentication-data-wrapper .field label {
		margin-bottom: 5px;
	}

	#authentication-data-wrapper .field input {
		width: 350px;
		height: 35px;
		border: 0;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		padding: 0 10px;
	}

	#authentication-data-wrapper .action {
		visibility: hidden;
		align-self: center;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 35px;
		color: #fff;
		border: solid 2px #fff;
		background: rgba(0, 0, 0, .05);
		cursor: pointer;
		padding: 0 20px;
		margin-top: 25px;
	}

	#authentication-data-wrapper .action:focus {
		outline: 0;
	}

	#authentication-data-wrapper .action.visible {
		visibility: visible;
	}

	#authentication-data-wrapper .action svg {
		margin-right: 5px;
	}
</style>
