import Vue from 'vue/dist/vue.esm.js'
const swal = require('sweetalert')

var apiServers = 'https://www.bitcoinalert.io/api'

new Vue({
	el: '#vueApp_account',
	data: {
		logged: false,
		userName: 'unknown',
		vip: false,
		userInfo: {
			channelInfo: {
				channels: []
			}
		},
		sku_list_sms: [],
		curr_sku_sms: {
			id: null
		},
		sku_list_pro: [],
		curr_sku_pro: {
			id: null
		},
		billing: [],
		step: 1
	},
	created:function(){
		getData(apiServers + "/work/coin/user/info",'GET',{},function(data){
			this.logged = true
			this.userName = data.data.userName
			this.vip = data.data.vip
			this.userInfo = data.data
		}.bind(this),function(data){
			this.logged = false
			if(window.location.pathname != '/'){
				window.location = '/user/login.html?callback='+window.location.href
			}
		}.bind(this))

		getData(apiServers + "/work/coin/payment/sku/list",'GET',{productType:'SMS'},function(data){
			this.sku_list_sms = data.data
			this.curr_sku_sms = this.sku_list_sms[0]
		}.bind(this),function(data){
			console.log(data.msg)
		}.bind(this))

		getData(apiServers + "/work/coin/payment/sku/list",'GET',{productType:'PRO'},function(data){
			this.sku_list_pro = data.data
			this.curr_sku_pro = this.sku_list_pro[0]
		}.bind(this),function(data){
			console.log(data.msg)
		}.bind(this))

		getData(apiServers + "/work/coin/payment/list",'GET',{pageSize: 1000},function(data){
			this.billing = data.data.content
		}.bind(this),function(data){
			console.log(data.msg)
		}.bind(this))
		if(GetQueryString('step')){
			this.step = GetQueryString('step')
		}
	},
	methods: {
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
	}
})