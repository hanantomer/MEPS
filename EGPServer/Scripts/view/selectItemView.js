(function () {

    mada.SelectItemView = Backbone.View.extend({

        initialize: function (attrs) {

            this.options = attrs;

            this.itemHtml = mada.getHtmlFromFile("template/" + this.options.templateName + ".html");

            _.bindAll(this, 'render');
        },

        render: function () {

            $(this.$el).html("");
            $(this.$el).append(this.itemHtml);

            var that = this;

            this.model.fetch({
                cache: false,
                success: function (results) {

                    mada.showReferenceTable(that.$el, results.models, that.options.onSelect, true);

                    $(that.$el).modal();
                }
            });
        }
    });
})();
