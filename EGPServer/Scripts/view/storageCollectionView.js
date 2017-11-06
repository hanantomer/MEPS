(function () {

    mada.StorageCollectionView = Backbone.View.extend({

        el: "#storage",

        
        initialize: function () {

            _.bindAll(this, 'render');
            _.bindAll(this, 'addComponent');
        },

        addComponent: function() {

            this.addSolarPanel();
        },

        render: function () {

            var that = this;

            $("#components").show();

            $("#componentsList ul").html("");

            this.model.fetch({
                cache: false,
                success: function (results) {
                    $.each(results.models, function (i, e) {
                        that.showStorage(e);
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

                        var componenetModel = that.model.getComponent(id, type);

                        componenetModel.fetch({

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

        showStorage: function (model) {

            var html =
                "<li data-type='storage' data-id='" + model.get("id") + "'>" +
                    $("#storage").html() + "</li>";

            $("#componentsList ul").append(html);

            var li =
                $("#componentsList ul").find("[data-id='" + model.get("id") + "']" +
                            "[data-type='" + model.get("Type") + "']");


            mada.populateViewByModel(li, model);
        },

        addComponent: function () {

            var that = this;

            this.model.addComponent(
                'storage',
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
