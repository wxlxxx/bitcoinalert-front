window.$ = window.jQuery = require('jquery')
window.Popper = require('popper.js').default
window.Util = require('exports-loader?Util!bootstrap/js/dist/util')
window.Collapse = require('exports-loader?Collapse!bootstrap/js/dist/collapse')
window.Modal = require('exports-loader?Modal!bootstrap/js/dist/modal')
window.Tooltip = require('exports-loader?Tooltip!bootstrap/js/dist/tooltip')
window.Dropdown = require('exports-loader?Dropdown!bootstrap/js/dist/dropdown')

require('./style/main.scss')

$(function(){
	$('.dropdown-toggle').dropdown()
	$('body').tooltip({
	    selector: '[data-toggle="tooltip"]'
	});

	$('#left-menu a[href="'+window.location.pathname+'"]').parent('.collapse').collapse()
	$('a[href="'+window.location.pathname+'"]').addClass('active').attr('href','javascript:;')

	$('body').on('click','[data-toggle="customCollapse"]',function(){
		$('[data-toggle="customCollapse"]').removeClass('active')
		$(this).addClass('active')
		if($($(this).data('target')).is(':hidden')){
			$('.customCollapse').hide()
			$($(this).data('target')).show()
		}
		return false
	})
})

window.GetQueryString = function(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r!=null)return  unescape(r[2]); return null;
}
window.getData = function (url,type,data,callback_success,callback_fail){
	$.ajax({
		type: type,
		url: url,
		dataType: 'json',
		data: data,
		xhrFields: {
        	withCredentials: true
        },
        success:function(data){
        	if(data.code == '00'){
				callback_success(data)
			}else{
				callback_fail(data)
			}
        },
        error:function(data){
        	console.log(data.statusText)
        }
	})
}


if($('#vueApp_account').length > 0){
	require.ensure([],function(){
		const _ = require('./script/account.js')
	},'account')
}
if($('#vueApp_buy').length > 0){
	require.ensure([],function(){
		const _ = require('./script/buy.js')
	},'buy')
}
if($('#vueApp_channel').length > 0){
	require.ensure([],function(){
		const _ = require('./script/channel.js')
	},'channel')
}
if($('#vueApp_detail').length > 0){
	require.ensure([],function(){
		const _ = require('./script/detail.js')
	},'detail')
}
if($('#vueApp_form').length > 0){
	require.ensure([],function(){
		const _ = require('./script/form.js')
	},'form')
}
if($('#vueApp_home').length > 0){
	require.ensure([],function(){
		const _ = require('./script/home.js')
	},'home')
}
if($('#vueApp_list').length > 0){
	require.ensure([],function(){
		const _ = require('./script/list.js')
	},'list')
}