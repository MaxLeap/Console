define([
    'container/BasicContainer'
], function (BasicContainer) {
    var ToolbarContainer = BasicContainer.extend({
        render: function (stateRoot, options) {
            BasicContainer.prototype.render.call(this,'#main-toolbar>.toolbar-content',options);
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