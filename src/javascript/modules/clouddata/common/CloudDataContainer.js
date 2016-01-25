define([
    'container/BasicContainer',
    'core/functions/ComponentFactory',
    'jquery',
    'underscore'
], function (BasicContainer, ComponentFactory, $, _) {
    var CloudDataContainer = BasicContainer.extend({
        initialize:function(options){
            this.beRendered = false;
            return BasicContainer.prototype.initialize.call(this,options);
        },
        render: function (stateRoot, options) {
            if(!this.beRendered){
                try{
                    BasicContainer.prototype.render.call(this,stateRoot, options);
                }catch(e){
                    console.log(e);
                }
                this.beRendered = true;
            }
        }
    });

    CloudDataContainer.create = function (options) {
        var ret = new CloudDataContainer();
        if (ret.initialize(options) == false) {
            return false;
        }
        return ret;
    };

    return CloudDataContainer;
});