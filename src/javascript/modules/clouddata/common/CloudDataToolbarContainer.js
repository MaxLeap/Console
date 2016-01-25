define([
    './CloudDataContainer'
], function (CloudDataContainer) {
    var ToolbarContainer = CloudDataContainer.extend({
        render: function (stateRoot, options) {
            if(!this.beRendered){
                try{
                    CloudDataContainer.prototype.render.call(this,'#main-toolbar>.toolbar-content',options);
                }catch(e){
                    console.log(e);
                }
                this.beRendered = true;
            }
        }
    });

    ToolbarContainer.create = function (options) {
        var ret = new ToolbarContainer();
        if (ret.initialize(options) == false) {
            return false;
        }
        return ret;
    };

    return ToolbarContainer;
});