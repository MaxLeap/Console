define([
    'jquery'
], function ($) {
    return {
        'required': {
            msg: 'error.format.required',
            validator: function (value) {
                return $.trim(value) && (typeof value != null);
            }
        },
        'appname': {
            regex: /^[a-zA-Z0-9]+[0-9a-zA-Z_-\s\u4e00-\u9fa5]{1,}$/,
            msg: 'error.format.appname',
            rules: ['required']
        },
        'columnname':{
            regex: /^[A-Za-z_][A-Za-z0-9_]*$/,
            msg: 'error.format.columnname',
            rules: ['required']
        },
        'targetclass':{
            msg: 'error.local.targetclass',
            validator: function (value,options) {
                var type = options.type;
                var target = options.target;
                return !((type=="Pointer"||type=="Relation")&&!target);
            }
        },
        'eid':{
            regex: /^[A-Za-z][A-Za-z0-9]+$/,
            msg: 'error.format.appname',
            rules: ['required']
        },
        'url': {
            regex: /^((http|https):\/\/(.*))?$/,
            msg: 'error.format.url'
        },
        //匹配不包含协议的url
        'urlpathAndNotEmpty': {
            msg: 'error.format.urlpathAndNotEmpty',
            validator: function(value){
                var value = $.trim(value);
                if(value.length < 1){
                    return false;
                }
                return /^(?!http:\/\/|https:\/\/|:\/\/)(.*)+$/.test(value);
            }
        },
        'json': {
            msg: 'error.format.json',
            validator: function (value) {
                try {
                    var jsonSEReg=/(^\{.*\}$)|(^\[(.*)\]$)/;
                    if(jsonSEReg.test(value)){
                        JSON.parse(value);
                    }else{
                        return false;
                    }
                } catch (e) {
                    return false;
                }
                return true;
            }
        },
        'number':{
            msg: 'error.format.number',
            validator: function (value) {
                if(value == ""){
                    return true
                }
                else{
                    return $.isNumeric(value);
                }
            }
        },
        'numberAndNotempty':{
            msg: 'error.format.number',
            validator: function (value) {
                if(value == ""){
                    return false
                }
                else{
                    return $.isNumeric(value);
                }
            }
        },
        'latitude':{
            msg: 'error.format.geo',
            rules: ['required','number'],
            validator: function (value,options) {
                return Math.abs(value)<=180;
            }
        },
        'longitude':{
            msg: 'error.format.geo',
            rules: ['required','number'],
            validator: function (value,options) {
                return Math.abs(value)<=90;
            }
        },
        'email':{
            regex: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            msg: 'error.format.email'
        },
        'phone':{
            regex: /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/,
            msg: 'error.format.phone'
        },
        'object':{
            msg: 'error.format.object',
            validator: function (value) {
                if(!/^\s*\{/.test(value)){
                    return false;
                }
                try {
                    JSON.parse(value);
                } catch (e) {
                    return false;
                }
                return true;
            }
        },
        'array':{
            msg: 'error.format.array',
            validator: function (value) {
                if(!/^\s*\[/.test(value)){
                    return false;
                }
                try {
                    JSON.parse(value);
                } catch (e) {
                    return false;
                }
                return true;
            }
        },
        'passwordconfirm': {
            msg: 'error.local.passwordconfirm',
            rules: ['required'],
            validator: function(value, $ele, options){
                return $.trim(value) === $.trim(options.password);
            }
        },
        'nonemptyemail': {
            rules: ['required', 'email']
        },
        'username': {
            msg: 'error.format.username',
            validator: function(value){
                return $.trim(value).length >= 6;
            }
        },
        'password': {
            msg: 'error.format.password',
            validator: function(value){
                return $.trim(value).length >= 8;
            }
        },
        'arrayrequired': {
            msg: 'error.format.required',
            validator: function(value){
                return value.split(',')[0].length > 0
            }
        },
        'marketingschedule':{
            msg: 'error.format.marketingschedule',
            validator: function(value,$el,options){
                var startType = $el.find('.begin-at').dropdown('get value');
                if(startType==0){
                    var endNode = $el.next();
                    var endType = endNode.find('.end-at').dropdown('get value');
                    if(endType==0){
                        var start = $el.find('[name=start_date]').val() +' '+$el.find('[name=start_time]').val();
                        var end = endNode.find('[name=end_date]').val() +' '+$el.find('[name=end_time]').val();
                        return start<end;
                    }
                }
                return true;
            }
        },
        'subsciption':{
            msg: 'error.format.required',
            validator: function(value,$el,list){
                return !(!list||list.length==0)
            }
        },
        'exportdata':{
            msg: 'error.format.required',
            validator: function(value,$el,options){
                return !(!options.classNames||options.classNames.length==0)
            }
        },
        'numberbigger':{
            msg: 'error.format.bigger',
            rules: ['number'],
            validator: function(value,$el,options){
                options = options || {};
                if( value&&options.compareWithVal 
                    && 
                    !(parseInt(value)<parseInt(options.compareWithVal)) 
                    ){
                    return true
                }
                return false
            }
        },
        //大于等于0的数字
        'numberGTE0':{
            msg: 'error.format.numberGTE0',
            validator: function (value) {
                if(value == ""){
                    return false;
                }
                else if($.isNumeric(value)&&/^[1-9][0-9]*$/.test(value)){
                    if(value>=0){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }
        },
        //大于等于的整数
        'numberGTE1':{
            msg: 'error.format.numberGTE1',
            validator: function (value) {
                if(value == ""){
                    return false;
                }
                else if($.isNumeric(value)&&/^[1-9][0-9]*$/.test(value)){
                    if(value>=1){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }
        },
        //大于0的数字
        'numberGT0':{
            msg: 'error.format.numberGT0',
            validator: function (value) {
                if(value == ""){
                    return false;
                }
                else if($.isNumeric(value)&&/^[1-9][0-9]*$/.test(value)){
                    if(value>0){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }
        },
        // 1- 7之间的数值包含1 或 7
        'numberBT1To7':{
            msg: 'error.format.numberBT1To7',
            validator: function (value) {
                if(value == ""){
                    return false;
                }
                else if($.isNumeric(value)&&/^[1-9][0-9]*$/.test(value)){
                    if(value>=1&&value<=7){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }
        },
        numberBT1To7AndBigger:{
            msg: 'error.format.numberBT1To7AndBigger',
            validator: function(value,$el,options){
                options = options || {};
                if( value&&options.compareWithVal &&!(parseInt(value)<parseInt(options.compareWithVal)) ){
                    if(value == ""){
                        return false;
                    }
                    else if($.isNumeric(value)&&/^[1-9][0-9]*$/.test(value)){
                        if(value>=1&&value<=7){
                            return true;
                        }else{
                            return false;
                        }
                    }else{
                        return false;
                    }

                }
                return false
            }
        },
        'phoneAndNotempty': {
            msg: 'error.format.phone',
            validator: function(value,$el){
                var value = $.trim(value);
                var phoneValidate = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/.test(value);
                var mobileValidate = /^1[3|4|5|6|7|8|9][0-9]{1}[0-9]{8}$/.test(value);
                if(!phoneValidate && !mobileValidate){
                    return false;
                }
                return true;
            }
        },
        'checkboxNotEmpty': {
            msg: 'error.local.event-not-empty',
            validator: function(value,$el){
                return $el.find('input:checked').length > 0 ;
            }
        }
    };
});