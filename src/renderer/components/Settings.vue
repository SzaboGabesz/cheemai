<template>
	<div id="settings-wrapper">
		<div class="form">
			<div class="field">
				<label for="language">{{ $trans('Language') }}:</label>
				<select id="language" @change="setLanguage" :value="language">
					<option v-for="(name, code) in languages" :value="code">{{ name }}</option>
				</select>
			</div>
			<div class="field">
				<label for="background-color-1">{{ $trans('Background color') }}:</label>
				<div class="background-color">
					<input type="color" id="background-color-1" :value="backgroundColor[0]" @change="setBackgroundColor" ref="backgroundColor1">
					<input type="color" id="background-color-2" :value="backgroundColor[1]" @change="setBackgroundColor" ref="backgroundColor2">
				</div>
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
				'language',
				'backgroundColor'
			])
		},
		methods: {
			setLanguage(e) {
				this.$store.dispatch('setLanguage', e.target.value);
			},
			setBackgroundColor() {
				this.$store.dispatch('setBackgroundColor', [
					this.$refs.backgroundColor1.value,
					this.$refs.backgroundColor2.value
				]);
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

	#settings-wrapper .background-color {
		display: flex;
		justify-content: space-between;
	}

	#settings-wrapper .background-color input {
		border: 0;
		width: 50%;
		height: 35px;
		background: rgba(0, 0, 0, 0.5);
		padding: 3px 10px;
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
