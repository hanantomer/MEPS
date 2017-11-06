(function () {

    mada.MadaView = Backbone.View.extend({

        el: "#mada",

        
        initialize: function () {

            _.bindAll(this, 'render');
        },


        render: function () {
            $(this.el).show();
        },

    });
})();
