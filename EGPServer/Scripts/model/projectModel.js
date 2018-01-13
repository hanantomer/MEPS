(function () {


    mada.ConfigurationModel = Backbone.AssociatedModel.extend({

        defaults: {
            id: "",
            Name : "",
            Type:"configuration"
        },

        url: function () {
            return "Handlers/Handler.ashx?entityType=configuration&id=" + (this.get("id") || '');
        },
        parse: function (response) {

            if (response[0])
                return response[0];

            return response;
        }
    });
})();