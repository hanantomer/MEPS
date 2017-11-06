(function () {

    mada.ConfigurationDetailsView = Backbone.View.extend({

        initialize: function (attrs) {

            _.bindAll(this, 'render');

            this.options = attrs;

            this.itemHtml = mada.getHtmlFromFile("template/configurationDetails.html");
        },


        render: function (configurationModel) {

            var that = this;

            this.model = configurationModel;

            $(this.el).show();

            $(this.el).append(this.itemHtml);

            this.model.fetch({

                success: function (results) {

                    //mada.controller.showCoalPlantStatesView();
                }
            });
        }
    });
})();
