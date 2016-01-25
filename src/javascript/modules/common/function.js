define([
    'app',
    'jquery',
    'underscore',
    'moment',
    'Q',
    'semanticui_dropdown2'
], function (AppCube, $, _, moment,Q) {
    return {

        /**
         * [description]
         * @param  {[type]} storeName         [可缺省]
         * @param  {[type]} $el               [元素]
         * @param  {[type]} options           [description]
         * @param  {[type]} appendDefaultItem [description]
         * @return {[type]}                   [description]
         */
        initSimpleDropdown:function(storeName, $el, options,selectedValue){
            var defer=Q.defer();
            var data;
            var init;
            //store是否缺省
            if(_.isObject(storeName)){
                selectedValue=options;
                options=$el;
                $el=storeName;
                init=options.init||true;
                data=options.data;
                render(data,$el,defer,init,selectedValue);

            }else{

                AppCube.DataRepository.fetch(storeName,options.formatter).done(function (res) {
                    render(res,$el,defer,init,selectedValue);
                });
            }
            return defer.promise;
            /**
             * [render 公用的render]
             * @param  {[type]} sourceData [description]
             * @return {[type]}            [description]
             */
            function render(sourceData){
                var template=_.template("<div class=\"item\" data-value=\"<%= id %>\"><%= text %></div>");    

                var menuHtml = _.map(sourceData, function (item,index) {
                    if(index==0){
                        selectedValue=selectedValue||item[options.valueName || 'id'];
                    }
                    if (item) {
                        return template({
                            id: item[options.valueName || 'id'],
                            text: item[options.textName || 'text']
                        });
                    }
                });
                menuHtml=menuHtml.join("");
                if(init){
                    $el.find(".menu").html(menuHtml);
                }else{
                    $el.find(".menu").append(menuHtml);
                }

                if (!$el.data('moduleDropdown')) {
                    //设置选中
                    if(selectedValue){
                        $el.dropdown("set selected",selectedValue);
                    }else{
                        $el.dropdown();
                    }
                } else {

                }
                
                defer.resolve();
            }
        },
        initDropdown2Single: function (storeName, $el, options, appendDefaultItem) {
            AppCube.DataRepository.fetch(storeName).done(function (res) {
                var data = _.map(res, function (item) {
                    if (item) {
                        return {
                            id: item[options.valueName || 'id'],
                            text: item[options.textName || 'text']
                        }
                    }
                });
                if (appendDefaultItem) {
                    data.splice(0, 0, {
                        id: 'all',
                        text: appendDefaultItem
                    })
                }
                if (!$el.data('moduleDropdown2')) {
                    var parmas = {
                        allowCreate: options.allowCreate,
                        data: data
                    };
                    if(options.onChange)parmas.onChange = options.onChange;
                    $el.dropdown2(parmas);
                } else {
                    $el.dropdown2('set data', data);
                }
                if (typeof options.callback == 'function') {
                    options.callback();
                }
            });
        },
        initDropdown2Multiple: function (storeName, $el, options) {
            AppCube.DataRepository.fetch(storeName).done(function (res) {
                var data = _.map(res, function (item) {
                    if (item) {
                        return {
                            id: item[options.valueName || 'id'] || item,
                            text: item[options.textName || 'text'] || item
                        }
                    }
                });
                if (!$el.data('moduleDropdown2')) {
                    $el.dropdown2({
                        action: 'multiple',
                        allowCreate: options.allowCreate,
                        onChange: options.onChange,
                        data: data
                    });
                } else {
                    $el.dropdown2('set data', data);
                }
                if (typeof options.callback == 'function') {
                    options.callback();
                }
            });
        }
    }
});