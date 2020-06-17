<template>
	<div class="notification" :class="cls" ref="notification" :style="style">
		<span class="text">
			<slot></slot>
		</span>
		<a href="#" class="close" @click="hide"></a>
	</div>
</template>

<script>
	import {mapState} from 'vuex';

	export default {
		data: () => {
			return {
				right: '',
				bottom: '',
				visible: true
			};
		},
		computed: {
			...mapState([
				'notifications'
			]),
			cls() {
				return [
					this.visible ? 'visible' : '',
					this.type
				];
			},
			style() {
				return {
					right: this.right,
					bottom: this.bottom
				};
			}
		},
		props: {
			id: String,
			type: String,
			timeout: Number
		},
		methods: {
			hide() {
				this.visible = false;
				this.$store.dispatch('removeNotification', this.id);
			},
			getBottom() {
				let bottom = 70;

				this.notifications.forEach((notification, index) => {
					if(notification.id === this.id) {
						bottom = 70 + (index * 60);
					}
				});

				return bottom;
			}
		},
		mounted() {
			const {width} = this.$refs.notification.getBoundingClientRect();

			this.right = `calc(50% - ${width / 2}px)`;
			this.bottom = `${this.getBottom()}px`;
		},
		created() {
			setTimeout(this.hide, this.timeout);
		}
	};
</script>
