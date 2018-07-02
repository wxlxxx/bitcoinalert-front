import Vue from 'vue/dist/vue.esm.js'
const swal = require('sweetalert')

var apiServers = 'https://www.bitcoinalert.io/api'

new Vue({
	el: '#vueApp_buy',
	data: {
		sku_list: [],
		curr_sku: null,
		logged: false,
		userName: 'unknown',
	},
	computed: {
		sku_list_upgrade: function () {
			if($(window).width() <= 500){
				return this.sku_list.reverse()
			}else{
				this.sku_list.splice(1,0,this.sku_list[2])
				this.sku_list.splice(-1,1)
				return this.sku_list
			}
		}
	},
	created: function(){
		getData(apiServers + "/work/coin/user/info",'GET',{},function(data){
			this.logged = true
			this.userName = data.data.userName
		}.bind(this),function(data){
			this.logged = false
		}.bind(this))
		getData(apiServers + "/portal/coin/payment/sku/list",'GET',{productType:'PRO'},function(data){
			this.sku_list = data.data
			this.curr_sku = this.sku_list[2]
		}.bind(this),function(data){
			console.log(data.msg)
		}.bind(this))
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