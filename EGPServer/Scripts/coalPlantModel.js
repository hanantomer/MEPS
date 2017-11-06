(function () {

    mada.CoalPlantStateModel = Backbone.AssociatedModel.extend({

        defaults: {
            id: -1
        },

        url: function () {
            return "Handlers/Handler.ashx?entityType=coalPlantState&id=" + this.get("id")
        }
    });


    mada.CoalPlantModel = Backbone.AssociatedModel.extend({

        relations: [
              {
                  type: Backbone.Many,
                  key: 'States',
                  relatedModel: mada.CoalPlantStateModel
              }
        ],
        defaults: {
            id: "",
            Name : "",
            Capacity: 0,
            Type:"coalPlant",
            States : []
        },

        url: function () {
            return "Handlers/Handler.ashx?entityType=coalPlant&id=" + (this.get("id")||'');
        },
        parse: function (response) {

            if (response[0])
                return response[0];

            return response;
        }
    });
})();