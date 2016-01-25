define([
    'app',
    'Storage',
    'Logger',
    'language',
    'underscore',
    'jquery',
    'moment'
], function (AppCube,Storage,Logger,language,_, $,moment) {

    return {
        Clone: function (obj, preventName) {
            var self = this;
            if ((typeof obj) == 'object') {
                var res = (obj == null || !obj.sort) ? {} : [];
                for (var i in obj) {
                    if (i != preventName)
                        res[i] = self.Clone(obj[i], preventName);
                }
                return res;
            } else if ((typeof obj) == 'function') {
                return (new obj()).constructor;
            }
            return obj;
            /*
             return $.extend(true,{},obj);
             */
        },
        UC_First: function (str) {
            var tmp = str.toLowerCase();
            var result = tmp.replace(/\b\w+\b/g, function (word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            return result;
        },
        jumpTo: function (path) {
            window.location.href = path;
        },
        changeHash:function(options){
            if(options.hash){
                window.location.hash = options.hash;
            }
            if(options.reload){
                location.reload();
            }
        },
        secToHou:function(sec){
            var tmp = Math.floor(sec);
            var hour = Math.floor(tmp/3600);
            var minute = Math.floor((tmp-3600*hour)/60);
            var second = tmp-3600*hour-60*minute;
            return {
                hour:hour,minute:minute,second:second
            }
        },
        formatAxis: function (array) {
            var tmp = [];
            moment.locale(Storage.get('moment'));
            _.forEach(array, function (item) {
                if (/^(\d{4})(\d{2})(\d{2})(\d{2})?$/.test(item)) {
                    if (RegExp.$4) {
                        var time = moment(RegExp.$2 + '/' + RegExp.$3 + ' ' + RegExp.$4 + ':00','MM/DD HH:mm').format('lll');
                    } else {
                        var time = moment(RegExp.$2 + '/' + RegExp.$3,'MM/DD').format('ll');
                    }
                    tmp.push(time);
                } else if (/^(\d{2})$/.test(item)) {
                    //remove :00
                    tmp.push(RegExp.$1);
                } else {
                    tmp.push(item);
                }
            });
            return tmp;
        },
        getLength:function(str){
            var realLength = 0;
            var len = str.length;
            var charCode = -1;
            for(var i = 0; i < len; i++){
                charCode = str.charCodeAt(i);
                if (charCode >= 0 && charCode <= 128) {
                    realLength += 1;
                }else{
                    realLength += 3;
                }
            }
            return realLength;
        },
        forceRender: function () {
            var el = document.body;
            el.style.cssText += ';-webkit-transform:rotateZ(0deg)';
            el.offsetHeight;
            el.style.cssText += ';-webkit-transform:none';
        },
        isImage:function(file){
            return file?/^image\//.test(file.type):false;
        },
        parseUrl:function(url){
            if(/^(http|https):\/\//.test(url)){
                return url;
            }else{
                return "https://"+url;
            }
        },
        strEllip: function(str,n)
        {
            var ilen = str.length;
            if(ilen*2 <= n) return str;
            n -= 3;
            var i = 0;
            while(i < ilen && n > 0)
            {
                if(escape(str.charAt(i)).length>4) n--;
                n--;
                i++;
            }
            if( n > 0) return str;
            return str.substring(0,i)+"...";
        },
        ParseError: function(resp, prefix, type, handlers, options) {
            var self = this;
            if (!resp || !type || !prefix) {
               return Logger.error(language.i18n('error'));
            }
            try {
                var reason = (resp.responseText.charAt(0)!='{')?resp:JSON.parse(resp.responseText);
                if (reason && (reason.errorCode||reason.status)) {
                    reason.errorCode = reason.errorCode?reason.errorCode:reason.status;
                    var key = prefix + '.' + type + '.' + reason.errorCode;
                    var failkey = prefix + '.error';

                    if(resp.status!= 400){
                        reason.errorMessage = 'Sever Error  ' + reason.errorCode;
                    }
                    if(typeof handlers == 'function'){
                        handlers(resp,options);
                    }
                    else if(handlers && reason.errorCode in handlers){
                        handlers[reason.errorCode](resp,options);
                    }
                    else if(handlers && handlers['default']){
                        handlers['default'](resp,options);
                    }
                    else if (language.i18n(key)) {
                        Logger.error(language.i18n(key));
                    }else if(reason.errorMessage) {
                        Logger.error(reason.errorMessage);
                    }else {
                        Logger.error(language.i18n(failkey));
                    }
                } else {
                    Logger.error(text);
                }
            } catch (e) {
                Logger.error(language.i18n('error'));
            }
        },
        goTo:function(action,state,id){
            window.location.hash = action + (state?'/'+state:'') + (id?'/'+id:'');
        },
        navigateTo:function(action,state,id){
            AppCube.Router.navigate(action + (state?'/'+state:'') + (id?'/'+id:''));
        },
        normalize:function(key){
            var map = {
                "ios":"iOS",
                "android":"Android",
                "app store":"App Store",
                "google play":"Google Play"
            };
            return map[key.toLowerCase()] || key;
        },
        parseCurrentUrl:function(){
            var urlObj = {
               origin:window.location.origin,
               pathname:window.location.pathname,
               module:"dashboard",
               appId:"",
               hash:window.location.hash,
               url:window.location.href
            };
            var moduleArr = urlObj.pathname.match(/^(.*?)\/(\w+)\/?/);
            if(moduleArr && moduleArr.length>2){
               urlObj.module = moduleArr[2];
            }
            var appIdArr = urlObj.pathname.match(/\/apps\/(\w+)/);
            if(appIdArr && appIdArr.length>1){
               urlObj.appId = appIdArr[1];
            }
            if(
               (urlObj.appId != "") 
               && 
               (!/\/apps\/(\w+)/.test(window.location.href))
               ){
               //补充 appId
               urlObj.url =  urlObj.url.replace(urlObj.module,urlObj.module+"/apps/"+urlObj.appId);
            }

            return urlObj;
        },
        getCreditCardFullType:function (e){
            var t=false;
            if(/^5[1-5][0-9]{14}$/.test(e)){
                t="MasterCard"
            }else if(/^4[0-9]{12}(?:[0-9]{3})?$/.test(e)){
                t="Visa"
            }else if(/^3[47][0-9]{13}$/.test(e)){
                t="American Express"
            }else if(/^(?:2131|1800|35\d{3})\d{11}$/.test(e)){
                t="JCB"
            }else if(/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(e)){
                t="Diners Club"
            }else if(/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(e)){
                t="Discover"
            }return t
        },
        getCreditCardType:function(e){
            var t=false;
            if(/^5[1-5]/.test(e)){
                t="mastercard"
            }else if(/^4/.test(e)){
                t="visa"
            }else if(/^3[47]/.test(e)){
                t="ae"
            }else if(/^(?:2131|1800|35)/.test(e)){
                t="jcb"
            }else if(/^3(?:0[0-5]|[68])/.test(e)){
                t="dinner"
            }else if(/^6(?:011|5)/.test(e)){
                t="discover"
            }return t
        },
        getPixelRatio:function(context) {
            var backingStore = context.backingStorePixelRatio ||
                context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
            return (Math.round(window.devicePixelRatio) || 1) / backingStore;
        }
    }
});