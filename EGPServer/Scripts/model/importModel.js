(function () {

    mada.ImportModel = Backbone.AssociatedModel.extend({

        initialize: function (attributes, options) {

            mada.assert(options.entityType != null);
            this.entityType = options.entityType;
        },

        url: function () {
            return "Handlers/Handler.ashx?entityType=" + this.entityType;
        }
    });
})();