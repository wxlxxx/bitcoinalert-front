import Vue from 'vue/dist/vue.esm.js'
const swal = require('sweetalert')
import hex_md5 from './md5.js'

var apiServers = 'https://www.bitcoinalert.io/api'

new Vue({
	el: '#vueApp_form',
	data: {
		logged: false,
		userName: '',
		captcha: apiServers + '/portal/coin/captcha/code',
		showCaptcha: false,
		submitting: false,
		fail_text: '',
		emailId: '',
		emailCode: '',
		emailType: '',
	},
	created: function(){
		getData(apiServers + "/work/coin/user/info",'GET',{},function(data){
			this.logged = true
			this.userName = data.data.userName
		}.bind(this),function(data){
			this.logged = false
		}.bind(this))
	},
	mounted: function(){
		if(GetQueryString('code')=='00'&&GetQueryString('emailType')==1){
			this.emailId = GetQueryString('emailId') || ''
			this.emailCode = GetQueryString('emailCode') || ''
			this.emailType = GetQueryString('emailType') || ''
			$('#Modal-valid').modal({
				backdrop: false
			})
		}
		if(GetQueryString('code')=='00'&&GetQueryString('emailType')==0){
			swal({
				title: GetQueryString('msg')
			}).then(function(){
				window.location = '/user/login.html'
			})
		}
		if(GetQueryString('payStatus')==1){
			swal({
				title: 'Payment success'
			}).then(function(){
				window.location = '/user/account.html'
			})
		}
		if(GetQueryString('code') && GetQueryString('code') != '00'){
			swal({
				text: GetQueryString('msg')
			}).then(function(){
				window.location = '/'
			})
		}
	},
	methods: {
		checkSubmit: function(ele){
			var email_reg = /^(\w)+([\.\-]\w+)*@(\w)+([\.\-]\w+)*(\.\w+)+$/
			var pwd_reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/
			var $email = $(ele).find('input[name="userName"]')
			this.userName = $email.val()
			var $password = $(ele).find('input[data-name="passWord"]')
			if($password.val() != undefined){
				$(ele).find('input[data-name="hex_passWord"]').val(hex_md5($password.val()))
			}
			var $captcha = $(ele).find('input[data-name="captcha"]')
			var $code = $(ele).find('input[name="code"]')
			var $isRemember = $(ele).find('input[data-name="isRemember"]')
			if($isRemember.is(':checked')){
				$(ele).find('input[name="isRemember"]').val(true)
			}else{
				$(ele).find('input[name="isRemember"]').val(false)
			}
			if($email.val() != undefined && !email_reg.test($email.val())){
				$email.attr("data-toggle","tooltip").tooltip({
					title: 'This is an unavailable email address',
					placement: "bottom"
				}).tooltip('show')
			}else if($password.val() != undefined && !pwd_reg.test($password.val())){
				$password.attr("data-toggle","tooltip").tooltip({
					title: '8 to 16 digits and alphabetical combinations',
					placement: "bottom"
				}).tooltip('show')
			}else if($code.val() != undefined && $code.val() == ''){
				$code.attr("data-toggle","tooltip").tooltip({
					title: 'Please fill in the verification code',
					placement: "bottom"
				}).tooltip('show')
			}else if($captcha.val() != undefined && $captcha.val() == ''){
				$captcha.attr("data-toggle","tooltip").tooltip({
					title: 'Please fill in the verification code',
					placement: "bottom"
				}).tooltip('show')
			}else if($captcha.val() != undefined){
				getData(apiServers + "/portal/coin/captcha/valid",'POST',{code:$captcha.val()},function(data){
					var parameter = $(ele).serialize()
					$password.val(hex_md5($password.val()))
					this.postSubmit(ele,$(ele).attr('action'),$(ele).serialize())
				}.bind(this),function(data){
					$captcha.attr("data-toggle","tooltip").tooltip({
						title: data.msg,
						placement: "bottom"
					}).tooltip('show')
				}.bind(this))
			}else{
				this.postSubmit(ele,$(ele).attr('action'),$(ele).serialize())
			}
			$(ele).find('input').focus(function(){
				$(this).tooltip('dispose')
				this.fail_text = ''
			}.bind(this))
		},
		postSubmit:function(ele,url,postData){
			console.log(postData)
			this.submitting = true
			getData(url,'POST',postData,function(data){
				$('.modal').modal('hide')
				var swalText = ''
				if(ele == '#form-signup'){
					swalText = 'Please check your email ('+this.userName+') and  activate your account by clicking the confirmation link. If you don’t see the email, please check your spam folder.'
				}else if(ele == '#form-getBackPassword'){
					swalText = 'We sent you an email ('+this.userName+') to reset your password. If you don’t see the email, please check your spam folder.'
				}else if(ele == '#form-signin'){
					window.location = GetQueryString('callback') ? GetQueryString('callback') : '/alert-settings/price-point.html'
				}
				swal({
                  title: data.msg,
                  text: swalText
                }).then(function(){
                	if(ele == '#form-modifyPassword' || ele == '#form-resetPassword'){
                		window.location = '/user/login.html'
                	}else{
                		window.location = '/'
                	}
                })
				this.submitting = false
			}.bind(this),function(data){
				if(data.code == '12'){
					window.location = '/user/login.html'
				}else if((data.data && data.data.needCode) || data.code == '30'){
					this.showCaptcha = true
					this.submitting = false
				}else{
					this.showCaptcha = false
					this.fail_text = data.msg
					this.submitting = false
				}
			}.bind(this))
		},
		changeCaptcha:function(){
			var captchaAddress = this.captcha
			this.captcha = ''
			setTimeout(function(){
				this.captcha = captchaAddress
			}.bind(this),200)
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