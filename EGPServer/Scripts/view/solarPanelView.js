(function () {

    mada.SolarPanelView = Backbone.View.extend({

        el: "#component div.panel-body",

        render: function () {

            var that = this;

            $("#component").show();

            this.model.fetch({

                success: function (results) {

                    //mada.controller.showCoalPlantStatesView();
                }
            });
        }
    });
})();
