(function () {


    mada.StorageModel = Backbone.AssociatedModel.extend({

        defaults: {
            id: "",
            Name : "",
            Type:"storage"
        },

        url: function () {
            return "Handlers/Handler.ashx?entityType=storage&id=" + (this.get("id")||'');
        },
        parse: function (response) {

            if (response[0])
                return response[0];

            return response;
        }
    });
})();