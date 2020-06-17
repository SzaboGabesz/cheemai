<template>
	<div id="settings-wrapper">
		<div class="form">
			<div class="field">
				<label for="language">{{ $trans('Language') }}:</label>
				<select id="language" @change="setLanguage" :value="language">
					<option v-for="(name, code) in languages" :value="code">{{ name }}</option>
				</select>
			</div>
			<button class="action" @click="$router.push('/')">{{ $trans('Back') }}</button>
		</div>
	</div>
</template>

<script>
	import {mapState} from 'vuex';

	export default {
		name: 'Settings',
		data() {
			return {
				valid: true
			};
		},
		computed: {
			...mapState([
				'languages',
				'language'
			])
		},
		methods: {
			setLanguage(e) {
				this.$store.dispatch('setLanguage', e.target.value);
			}
		}
	}
</script>

<style>
	#settings-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	#settings-wrapper .form {
		display: flex;
		flex-direction: column;
	}

	#settings-wrapper .field {
		display: flex;
		flex-direction: column;
		margin-bottom: 15px;
		font-size: 12px;
	}

	#settings-wrapper .field label {
		margin-bottom: 5px;
	}

	#settings-wrapper .field select {
		width: 350px;
		height: 35px;
		border: 0;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		padding: 0 10px;
	}

	#settings-wrapper .field select:focus {
		background: #333a43;
		outline: 0;
	}

	#settings-wrapper .action {
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

	#settings-wrapper .action:focus {
		outline: 0;
	}
</style>
