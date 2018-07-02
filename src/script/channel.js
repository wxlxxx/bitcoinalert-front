import Vue from 'vue/dist/vue.esm.js'
const swal = require('sweetalert')

var apiServers = 'https://www.bitcoinalert.io/api'

new Vue({
	el: '#vueApp_channel',
	data: {
		channel_email: null,
		channel_sms: null,
		update_value: '',
		fail_text: '',
		logged: false,
		userName: 'unknown',
		vip: false,
		country_list: [],
		moNo: '+86',
		need_sms_valid: false,
		sms_valid_code: '',
		send_sms_code: 'Get the verifying code',
		count_down: 60
	},
	created: function(){
		getData(apiServers + "/work/coin/user/info",'GET',{},function(data){
			this.logged = true
			this.userName = data.data.userName
			this.vip = data.data.vip
			data.data.channelInfo.channels.map(function(item){
				if(item.method == 'EMAIL'){
					this.channel_email = item
				}
				if(item.method == 'SMS'){
					this.channel_sms = item
				}
			}.bind(this))
		}.bind(this),function(data){
			this.logged = false
			if(window.location.pathname != '/'){
				window.location = '/user/login.html?callback='+window.location.href
			}
		}.bind(this))

		getData(apiServers+'/work/coin/user/sms/country/list','GET',{},function(data){
			this.country_list = data.data
		}.bind(this),function(data){
			console.log(data.msg)
		})
	},
	methods: {
		update_channel: function(obj){
			if(obj == 'EMAIL'){
				var email_reg = /^(\w)+([\.\-]\w+)*@(\w)+([\.\-]\w+)*(\.\w+)+$/
				if(!email_reg.test(this.update_value)){
					this.fail_text = 'This is an unavailable email address'
					return false
				}
			}else if(!this.vip){
				swal({
					title: 'You must purchase SMS credits as well to get alerts.'
				})
				return false
			}else if(this.update_value == ''){
				swal({
					title: 'Please add SMS number first'
				})
				return false
			}
			var data = obj == 'EMAIL' ? {
				email: this.update_value
			} : {
				phone: this.moNo.replace('+','%2B')+this.update_value
			}
			getData(apiServers + "/work/coin/alert/channel/update?method="+obj,"POST",data,function(data){
				if(obj == 'SMS'){
					this.need_sms_valid = true
					var loop = setInterval(function(){
						if(this.count_down > 0){
							this.count_down -= 1
							this.send_sms_code = 'Resend('+this.count_down+'s)'
						}else{
							clearInterval(loop)
							this.count_down = 60
							this.send_sms_code = 'Resend'
						}
					}.bind(this),1000)
				}else{
					swal({
	                	title: data.msg,
	                	text: "Please check your inbox("+this.update_value+") to verify your new email. If you don't see the email, please check your spam folder."
	                }).then(function(){
	                	window.location.reload()
	                })
				}
			}.bind(this),function(data){
				swal({
                	text: data.msg
                })
			}.bind(this))
		},
		smsValid: function(){
			getData(apiServers + "/work/coin/user/sms/valid","POST",{code: this.sms_valid_code},function(data){
				swal({
                	title: data.msg
                }).then(function(){
                	window.location.reload()
                })
			}.bind(this),function(data){
				swal({
                	text: data.msg
                })
			}.bind(this))
		},
		logout: function(){
			getData(apiServers + "/work/coin/user/logout",'POST',{},function(data){
				this.logged = false
				window.location = '/'
			}.bind(this),function(data){
				swal({
                	title: data.msg
                })
			}.bind(this))
		}
	}
})