define([
    'moment',
    'i18n'
],function(moment,i18n){

    var commonFormatter = "YYYY-MM-DD HH:mm:ss.SSS";
    var serverFormatter = "YYYY-MM-DDTHH:mm:ss.SSS";

    return {
        EmptyFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||typeof value == "object"){
                return '<span class="light">(undefined)</span><i class="icon btn-edit pencil"></i>';
            }
            else{
                return value+'<i class="icon btn-edit pencil"></i>';
            }
        },
        NumberFormatter:function (row, cell, value, columnDef, dataContext) {
            if(value === ""||value == null){
                return '<span class="light">(undefined)</span><i class="icon btn-edit pencil"></i>';
            }
            else{
                return parseFloat(value)+'<i class="icon btn-edit pencil"></i>';
            }
        },
        PasswordFormatter:function(row, cell, value, columnDef, dataContext){
            return '<span>(hidden)</span><i class="icon btn-edit pencil"></i>';
        },
        PointerFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||value == null||typeof value.className == 'undefined'){
                return '<span class="light">(undefined)</span><i class="icon btn-edit pencil"></i>';
            }
            else{
                return '<div class="wrapper"><a href="#classes/'+value.className+'/'+value.objectId+'">'+value.objectId+'</a></div><i class="icon btn-edit pencil"></i>';
            }
        },
        RelationFormatter:function (row, cell, value, columnDef, dataContext){
            var oid = dataContext.objectId;
            var className = columnDef.className;
            if(typeof oid == "undefined"||oid == null){
                return '<div class="wrapper"><a href="javascript:void(0)">'+i18n.t('clouddata.tag.add-relation')+'</a></div>';
            }
            else{
                return '<div class="wrapper"><a href="#relation/'+className+'/'+dataContext.objectId+'/'+columnDef.field+'">'+i18n.t('clouddata.tag.view-relation')+'</a></div>';
            }
        },
        JSONFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||value == null){
                return '<span class="light">(undefined)</span><i class="icon btn-edit pencil"></i>';
            }
            else{
                return JSON.stringify(value)+'<i class="icon btn-edit pencil"></i>';
            }
        },
        ACLFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||value == null){
                return '<i class="icon btn-edit pencil"></i>';
            }
            else{
                return JSON.stringify(value)+'<i class="icon btn-edit pencil"></i>';
            }
        },
        DateFormatter:function(row, cell, value, columnDef, dataContext) {
            if(typeof value == "undefined"||value == null|| typeof value.iso == "undefined"){
                return '<span class="light">(undefined)</span><i class="icon btn-edit pencil"></i>';
            }
            else{
                var iso = value.iso?value.iso:value;
                return moment(iso,serverFormatter).format(commonFormatter)+'<i class="icon btn-edit pencil"></i>';
            }
        },
        FixedDateFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||value == null){
                return '<span class="light">(undefined)</span>';
            }
            else{
                return moment(value,serverFormatter).format(commonFormatter);
            }
        },
        FileFormatter:function(row, cell, value, columnDef, dataContext) {
            if(typeof value == "undefined"||value == null||!value.url){
                return '<div class="progress-bar"><div class="percent"></div></div><span class="light">(undefined)</span><i class="icon btn-edit pencil"></i><input type="file"/>';
            }
            else{
                return '<span>'+value.url+'</span><i class="icon btn-remove remove"></i>';
            }
        },
        GeoPointFormatter:function(row, cell, value, columnDef, dataContext) {
            if(typeof value == "undefined"||value == null||typeof value.latitude == "undefined"||typeof value.longitude == "undefined"){
                return '<span class="light">(undefined)</span><i class="icon btn-edit pencil"></i>';
            }
            else{
                var latitude = Math.floor(value.latitude*100)/100;
                var longitude = Math.floor(value.longitude*100)/100;
                return latitude+','+longitude+'<i class="icon btn-edit pencil"></i>';
            }
        }
    }
});