import Vue from 'vue/dist/vue.esm.js'
const swal = require('sweetalert')
require('slick-carousel')

var apiServers = 'https://www.bitcoinalert.io/api'

new Vue({
	el: '#vueApp_home',
	data: {
		logged: false,
		userName: 'unknown',
	},
	created: function(){
		getData(apiServers + "/work/coin/user/info",'GET',{},function(data){
			this.logged = true
			this.userName = data.data.userName
		}.bind(this),function(data){
			this.logged = false
		}.bind(this))
	},
	methods: {
		goto: function(url){
			if(this.logged){
				window.location = url
			}else{
				window.location = '/user/signup.html'
			}
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
	}
})

$(function(){
	$('.rate-star > label').click(function(){
		var index = $(this).index()
		$('.rate-star > label').each(function(){
			if($(this).index()<=index){
				$(this).find('i').attr('class','star')
			}else{
				$(this).find('i').attr('class','star-empty')
			}
		})
	})
	$('#slick-1').slick({
		dots: true,
		arrows:false
	})
})