(function () {

    mada.ComponentCollectionModel = Backbone.Collection.extend({

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

        removeComponent: function (type, id, successCallback) {

            var model = this.getComponent(id, type);

            model.destroy({success: successCallback});
        },

        updateComponent: function (type, id, attrs) {

            var model = this.getComponent(id, type);

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

        getComponent: function (id, type) {

            var model = this.findWhere({ "id": id });

            model.set("id", id);

            return model;
        }
    });



})();