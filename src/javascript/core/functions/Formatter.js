define([
    'C',
    'moment',
    'underscore'
], function (C,moment, _) {
    return {
        AnalyticsTask:function(res,options){
            var dates = [];
            var stats = [];
            var tmp_stats = {};
            var tmp;
            var start_moment = moment(options.params.start_date,'YYYY-MM-DDHH');
            var end_moment = moment(options.params.end_date,'YYYY-MM-DDHH');
            var timeunit = options.params.time_unit;
            _.forEach(res.stats,function(item){
                tmp_stats[item.date+''] = item;
            });
            if(timeunit == 'hourly'){
                var unix = start_moment.unix();
                var end_unix = end_moment.subtract(-23,'hours').unix();
                while(end_unix>=unix){
                    tmp = parseInt(moment.unix(unix).format('YYYYMMDDHH'));
                    dates.push(tmp);
                    stats.push(tmp_stats[tmp]?tmp_stats[tmp]:{date:tmp});
                    unix+=3600;
                }
            }else if(timeunit=='daily'){
                var day_moment = start_moment.clone();
                while(end_moment>=day_moment){
                    tmp = day_moment.format('YYYYMMDD');
                    dates.push(tmp);
                    stats.push(tmp_stats[tmp]?tmp_stats[tmp]:{date:tmp});
                    day_moment.subtract(-1,'days');
                }
            }else if(timeunit=='weekly'){
                var week_moment = start_moment.clone();
                if(start_moment.day()==1){

                }else if(start_moment.day()==0){
                    week_moment = week_moment.day(1);
                }else{
                    week_moment = week_moment.subtract(-7,'days').day(1);
                }
                while(end_moment>=week_moment){
                    tmp = week_moment.format('YYYYMMDD');
                    dates.push(tmp);
                    stats.push(tmp_stats[tmp]?tmp_stats[tmp]:{date:tmp});
                    week_moment.subtract(-7,'days');
                }
            }else if(timeunit=='monthly'){
                var month_moment = start_moment.clone();
                if(start_moment.date()!=1){
                    month_moment = month_moment.subtract(-1,'month').date(1);
                }
                while(end_moment>=month_moment){
                    tmp = month_moment.format('YYYYMMDD');
                    dates.push(tmp);
                    stats.push(tmp_stats[tmp]?tmp_stats[tmp]:{date:tmp});
                    month_moment.subtract(-1,'month').date(1);
                }
            }
            res.dates = dates;
            res.stats = stats;
            res.chart_name = start_moment.format('ll')+' - '+end_moment.format('ll');
            return res;
        },
        Float2Money:function(row, cell, value, columnDef, dataContext){
            if(!$.isNumeric(value)||Number(value)<0)return '0';
            /^(\d+)(\.\d+)?$/.test(Number(value));
            var number = RegExp.$1;
            var decimal = RegExp.$2||"";
            if(decimal)decimal = decimal.slice(0,3);
            var money = "";
            while(number.length>3){
                money = "," + number.slice(number.length-3)+money;
                number = number.slice(0,number.length-3);
            }
            return number + money + decimal;
        },
        Float2Percent:function(row, cell, value, columnDef, dataContext){
            if(typeof value == 'number'){
                return Math.round(value*10000)/100+'%';
            }else{
                return value;
            }
        },
        Float2Percent100:function(row, cell, value, columnDef, dataContext){
            if(typeof value == 'number'){
                return value + '%';
            }else{
                return value;
            }
        },
        TotalPercent:function(row, cell, value, columnDef, dataContext){
            var rate = Math.round(dataContext[columnDef.field+'_rate']*10000)/100+'%';
            return value +' ('+rate+')';
        },
        DateFormat:function(row, cell, value, columnDef, dataContext){
            if((value+'').length==10){
                return moment(value,'YYYYMMDDHH').format('lll');
            }else if((value+'').length==9){
                var unit = value.charAt(value.length-1);
                var start = moment(value,'YYYYMMDDHH').format('ll');
                var end = '';
                if(unit=='W'){
                    end = moment(value,'YYYYMMDD').subtract(-6,'days').format('ll');
                }else{
                    var tmp = moment(value,'YYYYMMDD');
                    var tmp_moment = (tmp.date()==1)?tmp:tmp.subtract(-1,'month');
                    end = tmp_moment.subtract(-1,'month').subtract(1,'days').format('ll');
                }
                return start+' - '+end;
            }else{
                return moment(value,'YYYYMMDDHH').format('ll');
            }
        },
        Timestamp2Date:function(row, cell, value, columnDef, dataContext){
            if(value&&value!=-1){
                return moment.unix((value||0)/1000).format('MM/DD/YYYY HH:mm');
            }else{
                return '--';
            }
        },
        NormalDateFormat:function(row, cell, value, columnDef, dataContext){
            return moment(value).format('MM/DD/YYYY HH:mm');
        },
        StringFormat: function (row, cell, value, columnDef, dataContext) {
            return (typeof value == 'string') ? value : '';
        },
        NumberFormat: function (row, cell, value, columnDef, dataContext) {
            return (typeof value == 'number') ? value : 0;
        },
        ActionAllFormat:function(row, cell, value, columnDef, dataContext){
            return '<i class="action edit icon"></i><i class="action trash icon"></i>';
        },
        ActionDeleteFormat:function(row, cell, value, columnDef, dataContext){
            return '<i class="action trash icon"></i>';
        }
    }
});