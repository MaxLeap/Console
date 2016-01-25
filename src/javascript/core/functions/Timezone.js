define([
    'jquery',
    'underscore',
    'C',
    'moment',
    'moment-timezone'
], function($,_, C,moment, momentTimezone){
    var Timezone = {
        default_format : 'llll',
        default_server_timezone_offset:"0",
        timezones : {
                "0":'Greenwich',
                "7":'Asia/Bangkok',
                "8":'Asia/Shanghai'
        },
        init:function(){
            if(this.inited){
                return
            }
            moment.locale(C.get('moment'));
            this.timezone = this.getUserTimezone();
            this.inited = true;
        },
        //获取用户时区
        getUserTimezone:function(){
            return C.get('User.Timezone') || 'Asia/Shanghai';
        },
        //从浏览器中获取时区偏移值
        getTimezoneOffsetByBrowser:function(){
            return -(new Date().getTimezoneOffset())/60;
        },
        //根据时区字符串获取偏移值
        getTimezoneOffsetByString:function(timezone){
            //如果没有 timezone, 则根据浏览器时区返回
            return parseInt(moment().tz(timezone).format('Z'));
        },
        //根据时区获取偏移值
        getTimezoneOffset:function(timezone){
            this.init();
            timezone = timezone || this.timezone;
            return this.getTimezoneOffsetByString(timezone);
        },
        /**
         * 将时间戳基于某一个时区转换为时间
         * 
         * @param {string} time 时间戳
         * @param {string} source_timezone 原时区
         * @param {string} dest_timezone 目标时区
         * @param {string} format 格式化规范 可选
         */
        convertTimestampToTimeByTimezone:function(ts,source_timezone,dest_timezone,format){
            if(!ts || ts=="") return
            format = format || this.default_format;
            //Todo 空值判断: source_timezone, dest_timezone
            var new_time = moment.unix(ts).format(format);
            // require moment 2.8 or higher
            // var standard_time = moment(ts).tz(source_timezone);
            // var new_time = standard_time.clone().tz(dest_timezone).format(format);
            //console.log("convertTimestampToTimeByTimezone:"+ ts +" ========> "+new_time+"  tz:("+source_timezone+"==>"+dest_timezone+")");
            return new_time
        },
        /**
         * 将时间从一个时区转换到另一个时区
         * 
         * @param {string} time 时间
         * @param {string} source_timezone 原时区
         * @param {string} dest_timezone 目标时区
         * @param {string} format 格式化规范 可选
         */
        convertByTimezone:function(time,source_timezone,dest_timezone,format){
            if(!time || time=="") return
            this.init();
            //Todo: 空值判断逻辑可能不对
            source_timezone = source_timezone || this.timezone;

            format = format || this.default_format;
            var standard_time = moment(time).tz(source_timezone);
            var new_time = standard_time.clone().tz(dest_timezone).format(format);
            //console.log("convertByTimezone:"+ time +" ========> "+new_time+"  tz:("+source_timezone+"==>"+dest_timezone+")");
            return new_time
        },
        /**
         * 将服务器时间转换成当前用户时间
         * 
         * @param {string} response_time 原时区 -12~13
         * @param {string} server_timezone_offset 服务器时区偏移 -12~13 默认为0
         * @param {string} user_timezone 用户时区  默认为浏览器时区
         * @param {string} format 格式化规范
         */
        parseServerTime:function(response_time,server_timezone_offset,user_timezone,format){
            this.init();
            //Todo: 空值判断逻辑可能不对
            user_timezone = user_timezone ||　this.timezone;

            server_timezone_offset = server_timezone_offset || this.default_server_timezone_offset;

            var server_timezone = this.timezones[server_timezone_offset];
            return this.convertByTimezone(response_time,server_timezone,user_timezone,format);
        },
        /**
         * 将当前用户时间转换成服务器时间
         * 
         * @param {string} user_time 当前用户时间
         * @param {string} server_timezone_offset 服务器时区偏移 -12~13 默认为0
         * @param {string} user_timezone 当前用户时区
         * @param {string} format 格式化规范
         */
        buildServerTime:function(user_time,server_timezone_offset,user_timezone,format){
            this.init();
            //Todo: 空值判断逻辑可能不对
            user_timezone = user_timezone ||　this.timezone;

            server_timezone_offset = server_timezone_offset || this.default_server_timezone_offset;
            var server_timezone =  this.timezones[server_timezone_offset];
            return this.convertByTimezone(user_time,user_timezone,server_timezone,format);
        },
        /**
         * 处理服务器返回的数据(数组)，将指定的时间属性格式化为用户时区的时间
         *
         * 
         */
        handlerTimeProperties:function(arr,properties,options){
            var self = this;
            if(!arr || (arr.length==0) || !properties ||(properties.length==0)){
                return
            }

            self.init();

            options = options || {};
            options.server_timezone_offset = options.server_timezone_offset || self.default_server_timezone_offset;
            options.user_timezone = options.user_timezone || self.timezone;

            options.format = options.format || self.default_format;

            _.each(arr,function(item){
                _.each(properties,function(property){
                    if(_.has(item,property)){
                        item[property] = self.parseServerTime(item[property],
                                            options.server_timezone_offset,
                                            options.user_timezone,
                                            options.format);
                    }
                });
            });
        },
        handlerTimePropertiesNoFormat:function(arr,properties){
            var self = this;
            if(!arr || (arr.length==0) || !properties ||(properties.length==0)){
                return
            }
            _.each(arr,function(item){
                _.each(properties,function(property){
                    if(_.has(item,property)){
                        item[property] = moment.tz(item[property],'Greenwich').unix()*1000;
                    }
                });
            });
        },
        Convert2LocalTime:function(time,format){
            //时间戳与时区无关！！！！！
            if(!$.isNumeric(time))throw new Error('must be timestamp');
            var server_time = moment.tz(time,'Greenwich');
            var local_time = server_time.clone().tz(this.getUserTimezone());
            if(format==false)return local_time;
            if(typeof format != 'undefined'){
                return local_time.format(format);
            }else{
                return local_time.unix()*1000;
            }
        }
    };
    return Timezone;
});