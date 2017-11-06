(function () {

    mada.SolarPanelCollectionView = Backbone.View.extend({

        el: "#solarPanels",

        events: {
            //"click #btnAddSolarPanel": "addSolarPanel"
        },

        initialize: function () {

            _.bindAll(this, 'render');
            _.bindAll(this, 'addItem');
        },

        addItem: function() {

            this.addSolarPanel();
        },

        render: function () {

            var that = this;

            $("#items").show();

            $("#itemsList ul").html("");

            this.model.fetch({
                cache: false,
                success: function (results) {
                    $.each(results.models, function (i, e) {
                        that.showSolarPanel(e);
                    });

                    $("button[name='remove']").on("click", function (e) {
                        mada.showWarning(
                            "Are you sure?",
                            "Remove component",
                            function () {

                                var id = $(e.currentTarget).closest("li").data("id");

                                var type = $(e.currentTarget).closest("li").data("type");

                                that.removeComponent(type, id);
                            });
                    });

                    $("button[name='details']").on("click", function (e) {
                        
                        var id = $(e.currentTarget).closest("li").data("id");

                        var type = $(e.currentTarget).closest("li").data("type");

                        var solarPanelModel = that.model.getComponent(id, type);

                        solarPanelModel.fetch({

                            error: function(e) {
                                alert(e);
                            },

                            success: function (result) {

                               // that.showSolarPanelStates(result);
                                            
                            }});
                    });

                    $("input").on("change", function (e) {

                        var id = $(e.currentTarget).closest("li").data("id");

                        var type = $(e.currentTarget).closest("li").data("type");

                        that.updateComponent(
                            type,
                            id,
                            [{
                                "name": $(e.currentTarget).data("field"),
                                "value": e.currentTarget.value
                            }]);

                    });
                }
            });
        },

        removeComponent: function (type, id) {

            this.model.removeComponent(type, id, this.render)
        },

        updateComponent: function (type, id, attrs) {

            this.model.updateComponent(type, id, attrs)
        },

        showSolarPanel: function (solarPanelModel) {

            var solarPanelHtml =
                "<li data-type='solarPanel' data-id='" + solarPanelModel.get("id") + "'>" +
                    $("#solarPanel").html() + "</li>";

            $("#itemsList ul").append(solarPanelHtml);

            var li =
                $("#itemsList ul").find("[data-id='" + solarPanelModel.get("id") + "']" +
                            "[data-type='" + solarPanelModel.get("Type") + "']");


            mada.populateViewByModel(li, solarPanelModel);
        },

        addItem: function () {

            var that = this;

            this.model.addItem(
                'solarPanel',
                function (e) {
                    alert(e);
                    console.error(e);
                },
                function (e) {
                    that.render();
                });
        }
    });
})();
