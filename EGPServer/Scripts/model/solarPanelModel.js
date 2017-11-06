(function () {


    mada.SolarPanelModel = Backbone.AssociatedModel.extend({

        defaults: {
            id: "",
            Name : "",
            Type:"solarPanel"
        },

        url: function () {
            return "Handlers/Handler.ashx?entityType=solarPanel&id=" + (this.get("id")||'');
        },
        parse: function (response) {

            if (response[0])
                return response[0];

            return response;
        }
    });
})();