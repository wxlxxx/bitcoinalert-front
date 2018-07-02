import Vue from 'vue/dist/vue.esm.js'
const swal = require('sweetalert')

var apiServers = 'https://www.bitcoinalert.io/api'

new Vue({
	el: '#vueApp_list',
	data: {
		alertItems:[],
		totalPageNum:0,
		showPage:[],
		showPageHalfNum:3,
		currPage:1,
		alertType: '',
		logged: false,
		userName: 'unknown',
		vip: false
	},
	created: function(){
		getData(apiServers + "/work/coin/user/info",'GET',{},function(data){
			this.logged = true
			this.userName = data.data.userName
			this.vip = data.data.vip
		}.bind(this),function(data){
			this.logged = false
			if(window.location.pathname != '/'){
				window.location = '/user/login.html?callback='+window.location.href
			}
		}.bind(this))
		this.changePage(this.currPage)
		if(GetQueryString('type') == 'setAlertSuccess'){
			swal({
				text: 'Price Point alert has been created.',
				timer: 2000, 
  				showConfirmButton: false
			})
		}else if(GetQueryString('type') == 'editAlertSuccess'){
			swal({
				text: 'Price Point alert has been edited.',
				timer: 2000, 
  				showConfirmButton: false
			})
		}
	},
	methods: {
		getAlertList: function(num){
			getData(apiServers + "/work/coin/alert/list",'GET',{pageSize:10,pageNum:num},function(data){
				this.alertItems = data.data.content
				this.totalPageNum = data.data.totalPages
			}.bind(this),function(data){
				console.log(data.msg)
			}.bind(this))
		},
		alert_copy: function(obj){
			var data = {
				marketId: obj.marketId,
				currencyId: obj.currencyId,
				alertKey: obj.alertKey,
				alertCondition: obj.alertCondition,
				alertValue: obj.alertValue,
				alertMethod: obj.alertMethod,
				alertType: obj.alertType,
				status: obj.status,
			}
			if(obj.alertType == 'REGULAR'){
				data.alertFrequency = obj.alertFrequency
			}else{
				data.alertTimes = obj.alertTimes
				if(obj.alertType == 'PERCENT'){
					data.alertPart = obj.alertPart
				}
			}
			getData(apiServers + '/work/coin/alert/add','POST',data,function(data){
				swal({
                  title: data.msg
                }).then(function(){
                	this.getAlertList()
                }.bind(this))
			}.bind(this),function(data){
				swal({
                  title: data.msg
                })
			}.bind(this))
		},
		alert_delete: function(id){
			swal({
				title: 'Confirm Delete',
				text: 'You are going to to delete this alert. This is irreversible. Are you sure you want to delete this alert?',
				buttons: {
					no: 'CANCEL',
					yes: {
						text: 'DELETE',
						className: 'btn-danger'
					}
				}
			}).then(function(value){
                switch(value){
                    case 'yes':
                    getData(apiServers + "/work/coin/alert/delete",'POST',{alertId: id},function(data){
						this.alertItems.map(function(item,index){
							if(item.id == id){
								this.alertItems.splice(index,1)
								return false
							}
						}.bind(this))
					}.bind(this),function(data){
						console.log(data.msg)
					}.bind(this))
                }
            }.bind(this))
		},
		alert_switch: function(obj){
			var data = {
				alertId: obj.id,
				marketId: obj.marketId,
				currencyId: obj.currencyId,
				alertKey: obj.alertKey,
				alertCondition: obj.alertCondition,
				alertValue: obj.alertValue,
				alertMethod: obj.alertMethod,
				alertType: obj.alertType,
				status: obj.status == 1 ? 0 : 1,
			}
			if(obj.alertType == 'REGULAR'){
				data.alertFrequency = obj.alertFrequency
			}else{
				data.alertTimes = obj.alertTimes
				if(obj.alertType == 'PERCENT'){
					data.alertPart = obj.alertPart
				}
			}
			getData(apiServers + "/work/coin/alert/edit",'POST',data,function(data){
				this.alertItems.map(function(item){
					if(item.id == obj.id){
						item.status = obj.status == 1 ? 0 : 1
						swal({
							text: obj.status == 1 ? 'Alert turned on successfully!' : 'Alert turned off successfully!',
							className: obj.status == 1 ? 'text-primary' : 'text-danger',
							timer: 2000, 
			  				buttons: false
						})
						return false
					}
				}.bind(this))
			}.bind(this),function(data){
				console.log(data.msg)
			}.bind(this))
		},
		changePage:function(value){
	        this.currPage = value
	        this.showPage = []
	        for(var i = -this.showPageHalfNum;i<=this.showPageHalfNum;i++){
	          this.showPage.push(value+i)
	        }
	        this.getAlertList(value-1)
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
		}
	},
	filters: {
		alertKey_f: function(value){
			switch(value){
				case 'B': value = 'Buy price'; break;
				case 'S': value = 'Sell Price'; break;
				case 'H': value = 'Heigh Price'; break;
				case 'L': value = 'Low Price'; break;
				case 'V': value = 'Volume'; break;
				case 'A': value = 'Average Price'; break;
			}
			return value
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
				case '3d': svalue = '3 days'; break;
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
				case '3d': svalue = '3 days'; break;
				case '1w': value = '1 week'; break;
			}
			return value
		}
	}
})