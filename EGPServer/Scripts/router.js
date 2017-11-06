(function () {
 
    window.mada.setRouter = function () {
 
        /*backbone router init*/
        var Router = Backbone.Router.extend({
 
            routes: {
                'login': 'loginRoute',
                'configurations': 'configurationCollectionRoute',
                'solarPanels': 'solarPanelCollectionRoute',
                'windTurbines': 'windTurbineCollectionRoute',
                'storage': 'storageRoute',
                'general': 'generalRoute',
                'windData': 'windDataRoute',
                'sunData': 'sunDataRoute',
                'demandData': 'demandDataRoute',
                '*path': 'madaRoute'
            },
 
            invokeControllerTrigger: function (triggerName) {
 
                var params = [];
 
                params.push(triggerName);
 
                for (var i = 1; i < arguments.length; i++) {
                    params.push(arguments[i]);
                }
 
                mada.controller.trigger(triggerName, params);
            },

            loginRoute: function () {

                this.invokeControllerTrigger("loginRoute");
            },

            solarPanelCollectionRoute: function () {

                this.invokeControllerTrigger("solarPanelCollectionRoute");
            },

            windTurbineCollectionRoute: function () {

                this.invokeControllerTrigger("windTurbineCollectionRoute");
            },

            storageRoute: function () {

                this.invokeControllerTrigger("storageRoute");
            },

            configurationCollectionRoute: function () {
 
                this.invokeControllerTrigger("configurationCollectionRoute");
            },

            madaRoute: function () {

                this.invokeControllerTrigger("madaRoute");
            },
        });

        return new Router();
    }
})(this);
