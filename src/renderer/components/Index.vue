<template>
	<div id="index-wrapper">
		<div class="time-entries" ref="timeEntries">
			<table>
				<thead>
					<tr>
						<th>{{ $trans('Project') }}</th>
						<th>{{ $trans('Customer') }}</th>
						<th>{{ $trans('Activity') }}</th>
						<th>{{ $trans('Description') }}</th>
						<th>{{ $trans('Begin') }}</th>
						<th>{{ $trans('End') }}</th>
						<th>{{ $trans('Duration') }}</th>
						<th>{{ $trans('Rate') }}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="timesheet in timesheets" @click="editTimesheet($event, timesheet)" :class="{'same-project': projectId === timesheet.project}">
						<td class="project">{{ getProjectNameById(timesheet.project) }}</td>
						<td class="customer">{{ getCustomerNameByProjectId(timesheet.project) }}</td>
						<td class="activity">{{ getActivityNameById(timesheet.activity) }}</td>
						<td class="description">{{ timesheet.description }}</td>
						<td class="begin">{{ timesheet.begin|date }}</td>
						<td class="end">{{ timesheet.end|date }}</td>
						<td class="duration">{{ timesheet.duration|duration }}</td>
						<td class="rate">{{ getRateWithCurrency(timesheet) }}</td>
						<td class="actions">
							<button href="#" @click="continueTimesheet(timesheet)" class="btn-with-icon continue">
								<img src="~@/assets/icons/continue-timesheet.svg">
								{{ $trans('Continue') }}
							</button>
							<button href="#" @click="deleteTimesheet(timesheet.id)" class="btn-with-icon delete">
								<img src="~@/assets/icons/delete-timesheet.svg">
								{{ $trans('Delete') }}
							</button>
						</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<td colspan="8">
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
						</td>
					</tr>
				</tfoot>
			</table>
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
			<span class="counter">{{ elapsed|duration }}</span>
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
			date(value) {
				if(value === null) {
					return '';
				}

				return moment(value).format('YYYY.MM.DD HH:mm:ss');
			},
			duration(remaining) {
				let days, hours, minutes, seconds, result = '', suffix;

				days = Math.floor(remaining / 86400);

				if(days > 0) {
					suffix = days > 1 ? this.$trans('days') : this.$trans('day');
					result += `${days} ${suffix} `;
					remaining = remaining % 86400;
				}

				hours = Math.floor(remaining / 3600);

				if(hours > 0) {
					remaining = remaining % 3600;

					if(hours < 10) {
						hours = '0' + hours;
					}

					result += `${hours}:`;
				}

				minutes = Math.floor(remaining / 60);

				if(minutes > 0) {
					remaining = remaining % 60;

					if(minutes < 10) {
						minutes = '0' + minutes;
					}

					result += `${minutes}:`;
				}
				else {
					result += `00:`;
				}

				seconds = remaining;

				if(seconds === 0) {
					result += `00`;
				}
				else if(seconds < 10) {
					result += `0${seconds}`;
				}
				else {
					result += `${seconds}`;
				}

				return result;
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
			getRateWithCurrency(timesheet) {
				let customerId, currency;
				const projectId = timesheet.project;

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

				return formatter.format(timesheet.rate);
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
			editTimesheet(e, timesheet) {
				if(e.target.classList.contains('delete')) {
					e.preventDefault();
					return;
				}

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

					this.loadTimeheets();
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

				if(data.length > 0 && this.timesheetId !== data[0].id) {
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
