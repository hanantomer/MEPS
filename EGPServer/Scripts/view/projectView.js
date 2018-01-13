(function () {

    mada.ProjectView = Backbone.View.extend({

        initialize: function (attrs) {

            _.bindAll(this, 'render');
            

            this.options = attrs;
        },

        render: function (id) {

            $(this.$el).show();

            mada.router.navigate("#openProjectGeneral/" + id, { trigger: true });
        }
    });
})();
