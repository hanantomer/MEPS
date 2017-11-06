(function () {

    mada.ItemCollectionView = Backbone.View.extend({

        initialize: function (attrs) {

            this.options = attrs;

            this.itemHtml = mada.getHtmlFromFile("template/" + this.options.itemType + ".html");

            _.bindAll(this, 'render');
            _.bindAll(this, 'addItem');
        },

        render: function () {

            var that = this;

            $(this.el).show();

            $("#itemsList ul").html("");

            this.model.fetch({
                cache: false,
                success: function (results) {
                    $.each(results.models, function (i, e) {
                        that.showItem(e);
                    });

                    if (that.options.showItemCallback)
                        that.options.showItemCallback($("#itemsList"));


                    $("button[name='remove']").on("click", function (e) {
                        mada.showWarning(
                            "Are you sure?",
                            "Remove item",
                            function () {

                                var id = $(e.currentTarget).closest("li").data("id");

                                var type = $(e.currentTarget).closest("li").data("type");

                                that.removeComponent(type, id);
                            });
                    });

                    $("button[name='details']").on("click", function (e) {
                        
                        var id = $(e.currentTarget).closest("li").data("id");

                        var type = $(e.currentTarget).closest("li").data("type");

                        var itemModel = that.model.getItem(id, type);

                        itemModel.fetch({

                            error: function(e) {
                                alert(e);
                            },

                            success: function (result) {

                                that.options.showDetails(result);
                                            
                            }});
                    });

                    $("input").on("change", function (e) {

                        var id = $(e.currentTarget).closest("li").data("id");

                        var type = $(e.currentTarget).closest("li").data("type");

                        that.updateItem(
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

        removeItem: function (type, id) {

            this.model.removeItem(type, id, this.render)
        },

        updateItem: function (type, id, attrs) {

            this.model.updateItem(type, id, attrs)
        },

        showItem: function (model) {

            var html =
                "<li data-type='" + this.options.itemType + "' data-id='" + model.get("id") + "'>" +
                    this.itemHtml + "</li>";

            $("#itemsList ul").append(html);

            var li =
                $("#itemsList ul").find("[data-id='" + model.get("id") + "']" +
                            "[data-type='" + model.get("Type") + "']");


            mada.populateViewByModel(li, model);
        },

        addItem: function () {

            var that = this;

            this.model.addItem(
                this.options.itemTitle,
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
