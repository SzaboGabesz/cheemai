<template>
	<div id="index-wrapper">
		<div class="time-entries" ref="timeEntries">
			<div class="table">
				<div class="table-header">{{ $trans('Project') }}</div>
				<div class="table-header">{{ $trans('Customer') }}</div>
				<div class="table-header">{{ $trans('Activity') }}</div>
				<div class="table-header">{{ $trans('Description') }}</div>
				<div class="table-header">{{ $trans('Begin') }}</div>
				<div class="table-header">{{ $trans('End') }}</div>
				<div class="table-header">{{ $trans('Duration') }}</div>
				<div class="table-header">{{ $trans('Rate') }}</div>
				<div class="table-header"></div>

				<template v-for="timesheet in timesheets">
					<div class="table-cell project" :class="{'same-project': projectId === timesheet.project}" @dblclick="continueTimesheet(timesheet)" @click="editTimesheet(timesheet)">{{ getProjectNameById(timesheet.project) }}</div>
					<div class="table-cell customer" :class="{'same-project': projectId === timesheet.project}" @dblclick="continueTimesheet(timesheet)" @click="editTimesheet(timesheet)">{{ getCustomerNameByProjectId(timesheet.project) }}</div>
					<div class="table-cell activity" :class="{'same-project': projectId === timesheet.project}" @dblclick="continueTimesheet(timesheet)" @click="editTimesheet(timesheet)">{{ getActivityNameById(timesheet.activity) }}</div>
					<div class="table-cell description" :class="{'same-project': projectId === timesheet.project}" @dblclick="continueTimesheet(timesheet)" @click="editTimesheet(timesheet)">{{ timesheet.description }}</div>
					<div class="table-cell begin" :class="{'same-project': projectId === timesheet.project}" @dblclick="continueTimesheet(timesheet)" @click="editTimesheet(timesheet)">{{ timesheet.begin|date(language) }}</div>
					<div class="table-cell end" :class="{'same-project': projectId === timesheet.project}" @dblclick="continueTimesheet(timesheet)" @click="editTimesheet(timesheet)">{{ timesheet.end|date(language) }}</div>
					<div class="table-cell duration" :class="{'same-project': projectId === timesheet.project}" @dblclick="continueTimesheet(timesheet)" @click="editTimesheet(timesheet)">{{ getDuration(timesheet.duration) }}</div>
					<div class="table-cell rate" :class="{'same-project': projectId === timesheet.project}" @dblclick="continueTimesheet(timesheet)" @click="editTimesheet(timesheet)">{{ getFormattedRate(timesheet.project, timesheet.rate) }}</div>
					<div class="table-cell actions">
						<button href="#" @click="continueTimesheet(timesheet)" class="btn-with-icon continue">
							<img src="~@/assets/icons/continue-timesheet.svg" :title="$trans('Continue')">
						</button>
						<div class="separator"></div>
						<button href="#" @click="deleteTimesheet(timesheet.id)" class="btn-with-icon delete">
							<img src="~@/assets/icons/delete-timesheet.svg" :title="$trans('Delete')">
						</button>
						<template v-if="timesheet.description">
							<div class="separator"></div>
							<button href="#" @click="getTaskStatistics(timesheet)" class="btn-with-icon task-statistics">
								<img src="~@/assets/icons/task-statistics.svg" :title="$trans('Task statistics')">
							</button>
						</template>
					</div>
				</template>

				<div class="table-footer">
					<button href="#" @click="loadTimeheets" class="btn-with-icon">
						<img src="~@/assets/icons/reload-timesheets.svg">
						{{ $trans('Reload') }}
					</button>
					<div class="separator"></div>
					<button href="#" @click="list.page--" :disabled="list.page === 1" class="btn-with-icon">
						<img src="~@/assets/icons/previous-page.svg">
						{{ $trans('Previous page') }}
					</button>
					<div class="separator"></div>
					<button href="#" @click="list.page++" :disabled="timesheets.length < list.size" class="btn-with-icon">
						<img src="~@/assets/icons/next-page.svg">
						{{ $trans('Next page') }}
					</button>
				</div>
			</div>
		</div>
		<div class="recording">
			<img src="~@/assets/icons/settings.svg" class="settings" @click="$router.push('/settings')">
			<input type="text" :placeholder="$trans('What are you working on?')" v-model="description" @keyup="modifyDescription" @change="modifyDescription">
			<select v-model="projectId" @change="onChangeProject">
				<option v-if="projects.length === 0">{{ $trans('No projects') }}</option>
				<option v-for="project in projects" :value="project.id">{{ project.name }}</option>
			</select>
			<select v-model="activityId" @change="onChangeActivity">
				<option v-if="activities.length === 0">{{ $trans('No activities') }}</option>
				<option v-for="activity in activities" :value="activity.id">{{ activity.name }}</option>
			</select>
			<img src="~@/assets/icons/start-timesheet.svg" class="start" :class="{'disabled': !startEnabled}" @click="start" v-if="isStopped">
			<img src="~@/assets/icons/stop-timesheet.svg" class="stop" @click="stop" v-if="isStarted">
			<span class="counter">{{ getDuration(elapsed) }}</span>
		</div>
	</div>
</template>

<script>
	require('../assets/scss/index.scss');
	import moment from 'moment';
	import {mapState} from 'vuex';
	import PerfectScrollbar from 'perfect-scrollbar';
	const cc = require('currency-codes');

	export default {
		data: () => {
			return {
				description: '',
				projectId: 0,
				activityId: 0,
				started: 0,
				ended: 0,
				elapsed: 0,
				timesheetId: 0,
				timesheets: [],
				list: {
					size: 10,
					page: 1
				}
			};
		},
		watch: {
			list: {
				deep: true,
				handler() {
					this.loadTimeheets();
				}
			}
		},
		filters: {
			date(value, locale) {
				if(value === null) {
					return '';
				}

				const date = moment(value);
				const options = {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric'
				};

				return new Intl.DateTimeFormat(locale, options).format(date);
			}
		},
		computed: {
			...mapState([
				'host',
				'username',
				'apiKey',
				'language',
				'projects',
				'activities',
				'customers'
			]),
			isStopped() {
				return this.started === 0 || (this.started !== 0 && this.ended !== 0);
			},
			isStarted() {
				return this.started !== 0 && this.ended === 0;
			},
			startEnabled() {
				return this.description.length > 0;
			}
		},
		methods: {
			getTimeUnitsFromSeconds(seconds) {
				let result = {
						days: 0,
						hours: 0,
						minutes: 0,
						seconds: 0
					};

				result.days = Math.floor(seconds / 86400);
				seconds = seconds % 86400;
				result.hours = Math.floor(seconds / 3600);
				seconds = seconds % 3600;
				result.minutes = Math.floor(seconds / 60);
				seconds = seconds % 60;
				result.seconds = seconds;

				return result;
			},
			getNiceDuration(seconds) {
				const result = [];
				const timeUnits = this.getTimeUnitsFromSeconds(seconds);

				if(timeUnits.days > 0) {
					result.push(timeUnits.days, this.$trans('day(s)'));
				}

				if(timeUnits.hours > 0) {
					result.push(timeUnits.hours, this.$trans('hour(s)'));
				}

				if(timeUnits.minutes > 0) {
					result.push(timeUnits.minutes, this.$trans('minute(s)'));
				}

				return result.join(' ');
			},
			getDuration(seconds) {
				let result = '';
				const timeUnits = this.getTimeUnitsFromSeconds(seconds);

				if(timeUnits.days > 0) {
					result += timeUnits.days + ' ' + this.$trans('day(s)') + ' ';
				}

				if(timeUnits.hours > 0) {
					result += timeUnits.hours.pad(2, '0') + ':';
				}

				result += timeUnits.minutes.pad(2, '0') + ':';
				result += timeUnits.seconds.pad(2, '0');

				return result;
			},
			getFormattedRate(projectId, rate) {
				let customerId, currency;

				this.projects.forEach((project) => {
					if(project.id === projectId) {
						customerId = project.customer;
					}
				});

				this.customers.forEach((customer) => {
					if(customer.id === customerId) {
						currency = customer.currency;
					}
				});

				if(!currency) {
					currency = 'HUF';
				}

				const maximumFractionDigits = cc.code(currency).digits;
				const formatter = new Intl.NumberFormat(
					this.language, {
						style: 'currency',
						currency,
						minimumFractionDigits: 0,
						maximumFractionDigits
					}
				);

				return formatter.format(rate);
			},
			getProjectNameById(projectId) {
				let projectName = '';

				this.projects.forEach((project) => {
					if(project.id === projectId) {
						projectName = project.name;
					}
				});

				return projectName;
			},
			getCustomerNameByProjectId(projectId) {
				let customerName = '';

				this.projects.forEach((project) => {
					if(project.id === projectId) {
						customerName = project.parentTitle;
					}
				});

				return customerName;
			},
			getActivityNameById(activityId) {
				let activityName = '';

				this.activities.forEach((activity) => {
					if(activity.id === activityId) {
						activityName = activity.name;
					}
				});

				return activityName;
			},
			continueTimesheet(timesheet) {
				if(!this.isStarted) {
					this.projectId = timesheet.project;
					this.activityId = timesheet.activity;
					this.description = timesheet.description;

					this.start();
				}
			},
			async deleteTimesheet(id) {
				await this.$root.getClient().delete(`timesheets/${id}`);
				this.loadTimeheets();
			},
			editTimesheet(timesheet) {
				// FIXME
			},
			async modifyDescription(e) {
				if(e.type === 'keyup' && e.keyCode === 13 && !this.isStarted) {
					this.start();
					return;
				}

				if(this.isStarted && ((e.type === 'keyup' && e.keyCode === 13 && this.description !== e.target.value) || e.type === 'change')) {
					await this.$root.getClient().patch(`timesheets/${this.timesheetId}`, {
						description: e.target.value
					});

					this.loadTimeheets({ hideLoader: true });
				}
			},
			async loadProjects() {
				const {data: projects} = await this.$root.getClient().get('projects');

				await this.$store.dispatch('setProjects', projects);

				if(this.projectId === 0 && projects.length > 0) {
					this.projectId = this.projects[0].id;
				}
			},
			async loadActivities() {
				const projectId = this.projectId === 0 ? null : this.projectId;
				const {data: activities} = await this.$root.getClient().get('activities', {
					params: {
						project: projectId
					}
				});

				await this.$store.dispatch('setActivities', activities);

				if(this.activityId === 0 && activities.length > 0) {
					this.activityId = activities[0].id;
				}
			},
			async onChangeProject() {
				await this.loadActivities();

				const isCurrentActivityPresent = this.activities.filter((activity) => {
					return activity.id === this.activityId;
				}).length > 0;

				if(!isCurrentActivityPresent && this.activities.length > 0) {
					this.activityId = this.activities[0].id;
				}

				if(this.isStarted) {
					this.$root.getClient().patch(`timesheets/${this.timesheetId}`, {
						project: this.projectId,
						activity: this.activityId
					});
				}
			},
			async onChangeActivity() {
				if(this.isStarted) {
					this.$root.getClient().patch(`timesheets/${this.timesheetId}`, {
						activity: this.activityId
					});
				}
			},
			async loadCustomers() {
				const {data: customersData} = await this.$root.getClient().get('customers');
				const customers = [];

				for (const customerData of customersData) {
					const {data: customerDetails} = await this.$root.getClient().get(`customers/${customerData.id}`);
					customers.push(customerDetails);
				}

				await this.$store.dispatch('setCustomers', customers);
			},
			async getTaskStatistics(timesheet) {
				const description = timesheet.description;
				const {data: timesheets} = await this.$root.getClient().get('timesheets', {
					params: {
						activities: timesheet.activity,
						project: timesheet.project,
						term: timesheet.description,
						size: 1000000
					}
				});

				let totalDuration = 0, totalRate = 0;

				timesheets.forEach((timesheet) => {
					if(timesheet.description === description) {
						totalDuration += timesheet.duration;
						totalRate += timesheet.rate;
					}
				});

				totalDuration = this.getNiceDuration(totalDuration);
				totalRate = this.getFormattedRate(timesheet.project, totalRate);

				this.$notify({
					type: 'success',
					text: this.$trans('You\'ve worked :duration on ":task" for :rate.', {
						'duration': totalDuration,
						'rate': totalRate,
						'task': description
					}),
					timeout: 10000
				});
			},
			async loadTimeheets() {
				const {data: timesheets} = await this.$root.getClient().get('timesheets', {
					params: {
						page: this.list.page,
						size: this.list.size
					}
				});

				this.timesheets = timesheets;
			},
			async start() {
				if(this.startEnabled) {
					this.started = Date.now();

					const {data: {id: timesheetId}} = await this.$root.getClient().post('timesheets', {
						"project": this.projectId,
						"activity": this.activityId,
						"description": this.description
					});

					this.timesheetId = timesheetId;
				}
				else {
					this.$notify({
						type: 'warning',
						text: this.$trans('Please enter the description!'),
						timeout: 2000
					});
				}
			},
			async stop() {
				this.ended = Date.now();

				this.started = 0;
				this.ended = 0;
				this.description = '';
				this.elapsed = 0;

				await this.$root.getClient().patch(`timesheets/${this.timesheetId}/stop`);
				this.loadTimeheets();
			},
			async checkActiveTimesheet() {
				const {data} = await this.$root.getClient({ hideLoader: true }).get('timesheets/active');

				if(Array.isArray(data) && data.length > 0 && this.timesheetId !== data[0].id) {
					const timesheet = data[0];

					this.timesheetId = timesheet.id;
					this.projectId = timesheet.project.id;
					this.activityId = timesheet.activity.id;
					this.description = timesheet.description;
					this.started = +moment(timesheet.begin);
				}
			},
			initPerfectScrollbar() {
				new PerfectScrollbar(this.$refs.timeEntries);
			}
		},
		mounted() {
			this.initPerfectScrollbar();
		},
		async created() {
			if(this.host === '' || this.username === '' || this.apiKey === '') {
				this.$router.push('/authentication-data');
				return;
			}

			await this.loadProjects();
			await this.loadActivities();
			await this.loadCustomers();
			await this.checkActiveTimesheet();
			await this.loadTimeheets();

			setInterval(async () => {
				if(this.isStarted) {
					let milliseconds = Date.now() - this.started;
					this.elapsed = Math.floor(milliseconds / 1000);
				}
			}, 1000);

			setInterval(this.checkActiveTimesheet, 5000);
		}
	}
</script>
