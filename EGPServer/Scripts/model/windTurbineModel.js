(function () {


    mada.WindTurbineModel = Backbone.AssociatedModel.extend({

        defaults: {
            id: "",
            Name: "",
            MinWindVelocity: 0,
            MaxWindVelocity: 0,
            MaxCapacity: 0,
            MinCapacity: 0,
            Type:"windTurbine"
        },

        url: function () {
            return "Handlers/Handler.ashx?entityType=windTurbine&id=" + (this.get("id")||'');
        },
        parse: function (response) {

            if (response[0])
                return response[0];

            return response;
        }
    });
})();