import Vue from 'vue/dist/vue.esm.js'
const swal = require('sweetalert')

var apiServers = 'https://www.bitcoinalert.io/api'

new Vue({
	el: '#vueApp_detail',
	data: {
		alertType: 'PRICE',
		marketList: [],
		marketChecked: null,
		marketChecked_error: false,
		currencyList: [],
		currencyChecked: null,
		currencyChecked_error: false,
		alertKey: ['B','S','H','L','V','A'],
		alertKeyChecked: '',
		alertKeyChecked_error: false,
		currPrice: 0,
		alertCondition: ['LESS','GREATER'],
		alertConditionChecked: 'LESS',
		alertValue: 0,
		alertTimes: 1,
		currAlertItem: null,
		alertMethod: [],
		alertPart: '1m',
		alertPart_list: ['30m','1h','3h','6h','12h','1d','3d','1w'],
		alertFrequency: '1m',
		alertFrequency_list: ['30m','1h','3h','6h','12h','1d','3d','1w'],
		logged: false,
		userName: 'unknown',
		vip: false,
		smsCredits: 0
	},
	created: function(){
		getData(apiServers + "/work/coin/user/info",'GET',{},function(data){
			this.logged = true
			this.userName = data.data.userName
			this.vip = data.data.vip
			this.smsCredits = data.data.msCredits
			if(!this.vip && (window.location.pathname.search('/add-alert/percentage-change.html') != -1 || window.location.pathname.search('/add-alert/coin-daily-update.html') != -1)){
				var wrapper = document.createElement('div')
				wrapper.innerHTML = '<p class="h4 text-white">Upgrade to enjoy all cool features!</p><p class="h5 text-white">Never miss every golden inversting oppounity!</p>'
				swal({
					icon: '../images/Shape.png',
					content: wrapper,
					className: 'bg-primary',
					closeOnClickOutside: false,
					buttons: {
                        yes: {
                        	text: 'Upgrade now',
                        	className: 'btn btn-danger btn-lg'
                        }
                    }
				}).then(function(value){
					switch(value){
                        case 'yes':
                        window.location = '/buy/upgrade.html'
                    }
				})
				$('#left-menu').css('z-index',10001)
				$('.swal-overlay').css('background-color','rgba(0,0,0,0.1)')
			}
		}.bind(this),function(data){
			this.logged = false
			if(window.location.pathname != '/' && window.location.pathname != '/markets.html'){
				window.location = '/user/login.html?callback='+window.location.href
			}
		}.bind(this))

		if(window.location.pathname.search('/price-point.html') != -1){
			this.alertType = 'PRICE'
		}
		if(window.location.pathname.search('/percentage-change.html') != -1){
			this.alertType = 'PERCENT'
		}
		if(window.location.pathname.search('/coin-daily-update.html') != -1){
			this.alertType = 'REGULAR'
		}
		getData(apiServers+'/portal/coin/market/list','GET','',function(data){
			this.marketList = data.data
			if(window.location.pathname == '/markets.html'){
				this.marketChecked = this.marketList[0]
			}
			if(GetQueryString('alertId')){
				getData(apiServers + '/work/coin/alert/select','GET',{alertId:GetQueryString('alertId')},function(data){
					this.currAlertItem = data.data
					this.alertMethod = this.currAlertItem.alertMethod.split(',')
					this.marketList.map(function(item){
						if(item.id == this.currAlertItem.marketId){
							this.marketChecked = item
							return false
						}
					}.bind(this))
				}.bind(this))
			}
		}.bind(this))
	},
	mounted: function(){
		this.highcharts([0],[0],' ')
	},
	watch: {
		marketChecked: function(currVal,oldVal){
			this.currencyChecked = null
			if(currVal){
				this.marketChecked_error = false
				getData(apiServers+'/portal/coin/market/currency/list','POST',{marketId:currVal.id},function(data){
					this.currencyList = data.data
					if(this.currAlertItem){
						this.currencyList.map(function(item){
							if(item.id == this.currAlertItem.currencyId){
								this.currencyChecked = item
								return false
							}
						}.bind(this))
					}
				}.bind(this))
			}
		},
		currencyChecked: function(currVal,oldVal){
			this.alertKeyChecked = ''
			if(currVal){
				this.currencyChecked_error = false
				if(this.currAlertItem){
					this.alertKeyChecked = this.currAlertItem.alertKey
				}else{
					this.alertKey.map(function(item){
						if(item == currVal.supportAlertKey.substr(0,1)){
							this.alertKeyChecked = item
							return false
						}
					}.bind(this))
				}
			}
		},
		alertKeyChecked: function(currVal,oldVal){
			$('#highcharts1').html('')
			this.currPrice = 0
			if(currVal){
				this.alertKeyChecked_error = false
				getData(apiServers+'/work/coin/market/currency/price','POST',{marketId:this.marketChecked.id,currencyId:this.currencyChecked.id,alertKey:currVal},function(data){
					this.currPrice = data.data.price
				}.bind(this))
				getData(apiServers+'/work/coin/market/currency/price/history','POST',{marketId:this.marketChecked.id,currencyId:this.currencyChecked.id,alertKey:currVal},function(data){
					var dateList = []
					var priceList = []
					data.data.map(function(item){
						dateList.push( parseInt((new Date().getTime() + new Date().getTimezoneOffset()*60*1000 - new Date(item.priceTime).getTime())/1000/60/60) + ' hours ago' )
						priceList.push(item.price)
					})
					this.highcharts(dateList.reverse(),priceList.reverse(),this.alertKeyChecked)
				}.bind(this))
				if(this.currAlertItem){
					this.alertConditionChecked = this.currAlertItem.alertCondition
					this.alertValue = this.currAlertItem.alertValue
					this.alertTimes = this.currAlertItem.alertTimes
				}
			}
		},
		alertMethod: function(currVal,oldVal){
			currVal.map(function(item){
				if(item == 'SMS' && this.smsCredits == 0){
					swal({
						title: 'Insufficient number of remaining SMS',
						buttons: {
	                        yes: 'Buy Cedits now',
	                        no: 'Buy it later'
	                    }
					}).then(function(value){
						switch(value){
	                        case 'yes': window.location = '/user/account.html?step=2'; break;
	                        case 'no' : this.alertMethod.splice($.inArray('SMS', this.alertMethod), 1); break;
	                    }
					}.bind(this))
					return false
				}
			}.bind(this))
		}
	},
	methods: {
		setAlert: function(){
			if(!this.vip && (window.location.pathname.search('/add-alert/percentage-change.html') != -1 || window.location.pathname.search('/add-alert/coin-daily-update.html') != -1)){
				var wrapper = document.createElement('div')
				wrapper.innerHTML = '<p class="h4 text-white">Upgrade to enjoy all cool features!</p><p class="h5 text-white">Never miss every golden inversting oppounity!</p>'
				swal({
					icon: '../images/Shape.png',
					content: wrapper,
					className: 'bg-primary',
					buttons: {
                        yes: {
                        	text: 'Upgrade now',
                        	className: 'btn btn-danger btn-lg'
                        }
                    }
				}).then(function(value){
					switch(value){
                        case 'yes':
                        window.location = '/buy/upgrade.html'
                    }
				})
				return false
			}
			if(!this.marketChecked){
				this.marketChecked_error = true
				return false
			}
			if(!this.currencyChecked){
				this.currencyChecked_error = true
				return false
			}
			if(!this.alertKeyChecked){
				this.alertKeyChecked_error = true
				return false
			}
			if(this.alertMethod.length == 0){
				swal({
					title: 'Please add alert methods'
				})
			}
			var url = this.currAlertItem&&GetQueryString('type')=='edit' ? '/work/coin/alert/edit' : '/work/coin/alert/add'
			var data = {
				marketId: this.marketChecked.id,
				currencyId: this.currencyChecked.id,
				alertKey: this.alertKeyChecked,
				alertCondition: this.alertConditionChecked,
				alertValue: this.alertValue,
				alertMethod: this.alertMethod.join(','),
				alertType: this.alertType,
				status: 1
			}
			if(this.currAlertItem&&GetQueryString('type')=='edit'){
				data.alertId = this.currAlertItem.id
			}
			if(this.alertType == 'PERCENT'){
				data.alertPart = this.alertPart
			}
			if(this.alertType == 'REGULAR'){
				data.alertFrequency = this.alertFrequency
			}

			if(this.alertType == 'REGULAR'){
				data.alertFrequency = this.alertFrequency
			}else{
				data.alertTimes = this.alertTimes
				if(this.alertType == 'PERCENT'){
					data.alertPart = this.alertPart
				}
			}
			getData(apiServers + url,'POST',data,function(data){
				if(GetQueryString('type')=='edit'){
        			window.location = window.location.pathname.replace('add-alert','alert-settings') + '?type=editAlertSuccess'
        		}else{
        			window.location = window.location.pathname.replace('add-alert','alert-settings') + '?type=setAlertSuccess'
        		}
			}.bind(this),function(data){
				swal({
                  title: data.msg
                })
			}.bind(this))
		},
		logout:function(){
			getData(apiServers + "/work/coin/user/logout",'POST',{},function(data){
				this.logged = false
				window.location = '/'
			}.bind(this),function(data){
				swal({
                	title: data.msg
                })
			}.bind(this))
		},
		highcharts: function(categories,data,name){
			if($('#highcharts1').length != 0){
				Highcharts.chart('highcharts1', {
					title: {
						text: ''
					},
					subtitle: {
						text: ''
					},
					xAxis: {
						tickInterval: 48,
				        categories: categories || ''
				    },
					yAxis: {
						title: {
							text: ''
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'middle'
					},
					series: [{
						name: name || '',
						data: data || ''
					}],
					responsive: {
						rules: [{
							condition: {
								maxWidth: 500
							},
							chartOptions: {
								legend: {
									layout: 'horizontal',
									align: 'center',
									verticalAlign: 'bottom'
								}
							}
						}]
					}
				})
			}
		},
	},
	filters: {
		alertKey_f: function(value){
			switch(value){
				case 'B': value = 'Buy Price'; break;
				case 'S': value = 'Sell Price'; break;
				case 'H': value = 'Heigh Price'; break;
				case 'L': value = 'Low Price'; break;
				case 'V': value = 'Volume'; break;
				case 'A': value = 'Average Price'; break;
			}
			return value || 'Buy Price'
		},
		alertCondition_f: function(value){
			switch(value){
				case 'LESS': value = 'less than or equals'; break;
				case 'GREATER': value = 'greater than or equals'; break;
			}
			return value
		},
		alertCondition_f_percent: function(value){
			switch(value){
				case 'LESS': value = 'decreases'; break;
				case 'GREATER': value = 'increases'; break;
			}
			return value
		},
		alertFrequency_f: function(value){
			switch(value){
				case '30m': value = '30 minutes'; break;
				case '1h': value = 'hour'; break;
				case '3h': value = '3 hours'; break;
				case '6h': value = '6 hours'; break;
				case '12h': value = '12 hours'; break;
				case '1d': value = 'day'; break;
				case '3d': value = '3 days'; break;
				case '1w': value = 'week'; break;
			}
			return value
		},
		alertPart_f: function(value){
			switch(value){
				case '30m': value = '30 minutes'; break;
				case '1h': value = '1 hour'; break;
				case '3h': value = '3 hours'; break;
				case '6h': value = '6 hours'; break;
				case '12h': value = '12 hours'; break;
				case '1d': value = '1 day'; break;
				case '3d': value = '3 days'; break;
				case '1w': value = '1 week'; break;
			}
			return value
		}
	}
})