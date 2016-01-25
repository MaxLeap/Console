define([
    'app',
    'dispatcher',
    'layout/BasicLayout',
    'jquery',
    'underscore',
    'backbone'
],function(AppCube,Dispatcher,BasicLayout,$,_,Backbone){
    var CloudDataLayout = BasicLayout.extend({
        show: function (options) {
            if (this.options.action == options.action) {

                this.changeState('default');
                if (this.options.store)this.loadStoreData();

                AppCube.current_action = options.action;
                var self = this;
                var className = options.options.className;
                AppCube.DataRepository.fetch('Store:Schemas').done(function(res){
                    if(className){
                        var find = _.find(res,function(item){
                            return item.className == className;
                        });
                        if(find){
                            AppCube.currentClass = className;
                        }
                    }else{
                        className = res[0]?res[0].className:false;
                        AppCube.currentClass = className;
                    }
                    if(options.state=='class'){
                        self.renderState({
                            className:AppCube.currentClass
                        });
                        Backbone.history.navigate("classes/"+AppCube.currentClass);
                        Dispatcher.trigger('show:Class',{className:AppCube.currentClass},'Layout');

                    }else if(options.state == 'pointer'){
                        self.renderState({
                            className:AppCube.currentClass
                        });
                        Dispatcher.trigger('show:Pointer',{
                            className:AppCube.currentClass,
                            objectId:options.options.oid
                        },'Layout');

                    }else if(options.state == 'relation'){
                        self.renderState({
                            className:AppCube.currentClass,
                            objectId:options.options.oid,
                            columnName:options.options.columnName
                        });
                        Dispatcher.trigger('show:Relation',{
                            className:AppCube.currentClass,
                            objectId:options.options.oid,
                            columnName:options.options.columnName
                        },'Layout');
                    }
                });
                $(this.options.root).show();
            }
        },
        hide: function (options) {
            if (this.options.action != options.action) {
                if ($(this.options.root).css('display') != 'none') {
                    $(this.options.root).hide();
                    this.clearState();
                }
            }
        },
        changeState: function (state) {
            this._currentState = state;
        }
    });

    CloudDataLayout.create = function(options){
        var ret = new CloudDataLayout();
        if (ret.initialize(options) == false) {
            return false;
        }
        return ret;
    };
    return CloudDataLayout;
});