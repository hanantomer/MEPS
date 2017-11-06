(function () {

    mada.ItemCollectionModel = Backbone.Collection.extend({

        initialize: function(attributes, options) {
            this.url = options.url;
            this.model = options.model;
        },

        addItem: function (type, errorCallback, successCallback) {

            var model = new this.model();

            var options = {};

            options.error = errorCallback;
            options.success = successCallback;

            model.save(null, options);
        },

        removeItem: function (type, id, successCallback) {

            var model = this.getItem(id, type);

            model.destroy({success: successCallback});
        },

        updateItem: function (type, id, attrs) {

            var model = this.getItem(id, type);

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

        getItem: function (id, type) {

            var model = this.findWhere({ "id": id });

            model.set("id", id);

            return model;
        }
    });
})();