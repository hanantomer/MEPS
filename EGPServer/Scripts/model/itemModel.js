(function () {


    mada.ItemModel = Backbone.AssociatedModel.extend({

        url: function () {
            return "Handlers/Handler.ashx?entityType=" + this.options.entityType + "&id=" + (this.get("id")||'');
        },
        parse: function (response) {

            if (response[0])
                return response[0];

            return response;
        }
    });
})();