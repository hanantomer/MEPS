(function () {

    mada.ItemCollectionModel = Backbone.Collection.extend({

        initialize: function (attributes, options) {

            this.model = options.model || mada.ItemModel;

            mada.assert(options.entityType != null);

            this.entityType = options.entityType;

            this.detailsTableName = options.detailsTableName;

            _.bindAll(this, 'addItem');
        },

        url: function () {
            return "Handlers/Handler.ashx?entityType=" +
                this.entityType + "&detailsTableName=" +
                (this.detailsTableName || '');
        },

        addItem: function (type, parentFieldName, parentFieldValue, errorCallback, successCallback) {

            var model = new this.model();
            model.set("entityType", this.entityType);

            if (parentFieldName != null)
            {
                model.set("parentFieldName", parentFieldName);
                model.set("parentFieldValue", parentFieldValue);
            }

            var options = {};

            options.error = errorCallback;
            options.success = successCallback;

            model.save(null, options);
        },

        removeItem: function (id, successCallback) {

            var model = this.getItem(id);

            model.destroy({success: successCallback});
        },

        updateItem: function (id, attrs) {

            var model = this.getItem(id);

            $.each(attrs, function (i, e) {
                model.set(e.name, e.value);
            });

            model.save(
                model.changedAttributes(),
                {
                    patch:true,
                    error: function(e) {
                        alert(e);
                        console.error(e);
                    }
                });
        },

        getItem: function (id) {

            var model = this.findWhere({ "id": parseInt(id) });

            model.set("id", id);

            return model;
        }
    });
})();