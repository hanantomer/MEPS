(function () {
 
    window.mada.setRouter = function () {
 
        /*backbone router init*/
        var Router = Backbone.Router.extend({
 
            routes: {
                'login': 'login',
                'newProject': 'newProjectRoute',
                'selectProject': 'invokeControllerFunction',
                'openProject/:id': 'invokeControllerFunction',
                'openProjectGeneral/:id': 'invokeControllerFunction',
                'projectPowerUnits/:id': 'invokeControllerFunction',
                'projectWindData/:id': 'invokeControllerFunction',
                'projectSunData/:id': 'invokeControllerFunction',
                'projectDemandData/:id': 'invokeControllerFunction',
                'settingsSolarPanels': 'invokeControllerFunction',
                'settingsWindTurbines': 'invokeControllerFunction',
                'settingsStorage': 'invokeControllerFunction',
                'settingsSolarPanelSuppliers': 'invokeControllerFunction',
                'settingsWindTurbineSuppliers': 'invokeControllerFunction',
                'settingsStorageSuppliers': 'invokeControllerFunction',
                'importWindTurbineTypes': 'invokeControllerFunction',
                '*path': 'madaRoute'
            },

            invokeControllerFunction: function () {
 
 
                var routeName = Backbone.history.getFragment(); // route name should match a controller function

                var functionNameToInvoke = routeName;

                var id;

                if (routeName.indexOf('/') > 0) {

                    functionNameToInvoke = routeName.substr(0, routeName.indexOf('/'));
                    id = routeName.substr(routeName.indexOf('/') + 1);
                }

                if (functionNameToInvoke && mada.controller[functionNameToInvoke]) {
                    mada.controller[functionNameToInvoke].call(mada.controller, id);
                }
            },

            loginRoute: function () {

                this.invokeControllerFunction("loginRoute");
            },

            newProjectRoute: function (e) {

                this.invokeControllerFunction("newProjectRoute", e);
            },

          
            madaRoute: function () {

                this.invokeControllerFunction("madaRoute");
            }
        });

        return new Router();
    }
})(this);
