$(document).ready(function () {

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;
    Backbone.$ = $;

    /*this is to prevent IE ajax aggresive caching*/
    $.ajaxSetup({ cache: false });

    $(document).ajaxStart(function () {
        $('#loadbar').show();
    });

    $(document).ajaxComplete(function () {
        $('#loadbar').css('display', 'none');
    });


    (function (window, f) {

        f();

    }(this, function () {


        var Controller = Backbone.View.extend({

            initialize: function () {

                _.bindAll(this, 'showConfigurationDetails');

                this.loadHtmlFile("login.html", $("#login"));

                this.initModels();

                this.initViews();

                this.startListening();

                this.router = mada.setRouter();

                this.showMada();

                //this.showLoginPage();
            },

            loadHtmlFile: function (fileName, el) {
                $.ajax({
                    url: fileName,
                    async: false,
                    success: function (e) {
                        $(el).html(e);
                    }
                });
            },


            showLoginPage: function() {
                $("#login").modal();
            },

            showModule: function (modulePrefix) {

                $("#page-wrapper").show();

                $("#page-wrapper > div").css("display", "none");

                $("#" + modulePrefix + "Wrapper").css("display", "block");
            },

            initModels: function () {

                mada.solarPanelCollectionModel = new mada.ItemCollectionModel(
                        null,
                        {
                            url: "Handlers/handler.ashx?entityType=SolarPanels",
                            model: mada.SolarPanelModel
                        });

                mada.windTurbineCollectionModel = new mada.ItemCollectionModel(
                    null,
                    {
                        url: "Handlers/handler.ashx?entityType=WindTurbines",
                        model: mada.WindTurbineModel
                    });

                mada.storageCollectionModel = new mada.ItemCollectionModel(
                    null,
                    {
                        url: "Handlers/handler.ashx?entityType=StorageTypes",
                        model: mada.StorageModel
                    });

                mada.configurationCollectionModel = new mada.ItemCollectionModel(
                    null,
                    {
                        url: "Handlers/handler.ashx?entityType=Configurations",
                        model: mada.ConfigurationModel
                    });
            },

            initViews: function () {

                mada.solarPanelCollectionView =
                    new mada.ItemCollectionView(
                        {
                            model: mada.solarPanelCollectionModel,
                            el: "#items",
                            itemTitle: "Solar Panel Types",
                            itemType: "solarPanel",
                            showDetails: this.showSolarPanel
                        });

                mada.windTurbineCollectionView =
                    new mada.ItemCollectionView(
                        {
                            model: mada.windTurbineCollectionModel,
                            el: "#items",
                            itemTitle: "Wind Turbine Types",
                            itemType: "windTurbine",
                            showDetails: this.showWindTurbine
                        });

                mada.storageCollectionView =
                  new mada.ItemCollectionView(
                      {
                          model: mada.storageCollectionModel,
                          el: "#items",
                          itemTitle: "Storage Types",
                          itemType: "storage",
                          showDetails: this.showStorage
                      });


                mada.configurationCollectionView =
                    new mada.ItemCollectionView(
                        {
                            model: mada.configurationCollectionModel,
                            el: "#items",
                            itemTitle: "Grid Setup",
                            itemType: "configuration",
                            showItemCallback: mada.initMap,
                            showDetails: this.showConfigurationDetails
                        });

                mada.configurationDetailsView =
                    new mada.ConfigurationDetailsView({
                        model: mada.configurationModel,
                        el: "#itemDetails"
                    });

                mada.madaView =
                    new mada.MadaView({
                        el: "#mada"
                    });
            },

            /*Listen to events raised by views*/
            startListening: function () {

                // Menu events

                this.listenTo(this, 'loginRoute', this.login);
                this.listenTo(this, 'configurationCollectionRoute', this.showConfigurationCollection);
                this.listenTo(this, 'solarPanelCollectionRoute', this.showSolarPanelCollection);
                this.listenTo(this, 'windTurbineCollectionRoute', this.showWindTurbineCollection);
                this.listenTo(this, 'storageRoute', this.showStorage);
                this.listenTo(this, 'madaRoute', this.showMada);

                

                // add component
                $("#btnAddComponent").click(function () {
                    mada.controller.addItem();
                });
            },

            addItem: function() {

                this.lastView.addItem();
            },

            login: function (userName, passWord) {

                $("#login").modal('hide');
            },

            showSolarPanelCollection: function () {

                this.hidePlacholders();

                mada.solarPanelCollectionView.render();

                this.lastView = mada.solarPanelCollectionView;
            },

            showWindTurbineCollection: function () {

                this.hidePlacholders();

                mada.windTurbineCollectionView.render();

                this.lastView = mada.windTurbineCollectionView;
            },

            showStorage: function () {

                this.hidePlacholders();

                mada.storageCollectionView.render();

                this.lastView = mada.storageCollectionView;
            },

            showConfigurationCollection: function () {

                this.hidePlacholders();

                mada.configurationCollectionView.render();

                this.lastView = mada.configurationCollectionView;
            },

            showConfigurationDetails: function (configurationModel) {

                this.hidePlacholders();

                mada.configurationDetailsView.render(configurationModel);

                this.lastView = mada.configurationDetailsView;
            },

            showMada: function () {

                this.hidePlacholders();

                mada.madaView.render();

                this.lastView = mada.madaView;
            },



            hidePlacholders: function () {
                $(".placeholder").hide();
            }
        });

        mada.controller = new Controller();

        /*start router*/
        Backbone.history.start();
    }));
});


