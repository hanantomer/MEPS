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

                mada.router = mada.setRouter();

                this.loadHtmlFile("template/login.html", $("#login"));

                this.loadHtmlFile("template/project.html", $("#project"));

                this.initModels();

                this.initViews();

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


            showLoginPage: function () {
                $("#login").modal();
            },

            showModule: function (modulePrefix) {

                $("#page-wrapper").show();

                $("#page-wrapper > div").css("display", "none");

                $("#" + modulePrefix + "Wrapper").css("display", "block");
            },

            initModels: function () {

                mada.projectModel = new mada.ItemModel(
                null,
                {
                    url: "Handlers/handler.ashx?entityType=project"
                });

            },

            initViews: function () {

                mada.solarPanelSupplierCollectionView =
                    new mada.ItemCollectionView(
                        {
                            model: new mada.ItemCollectionModel(null, { entityType: "solarPanelSupplier" }),
                            el: "#items",
                            title: "Solar Panel Suplliers"
                        });


                mada.solarPanelCollectionView =
                    new mada.ItemCollectionView(
                        {
                            model: new mada.ItemCollectionModel(null, { entityType: "solarPanel" }),
                            el: "#items",
                            title: "Solar Panel Types",
                            parentElement: {
                                label: "Supplier",
                                dataField: "SolarPanelSupplierId",
                                parentTable: "SolarPanelSupplier",
                                changeCallback: "parentChanged"
                            }
                        });

                mada.windTurbineSupplierCollectionView =
                    new mada.ItemCollectionView(
                        {
                            model: new mada.ItemCollectionModel(null, {
                                entityType: "windTurbineSupplier"
                            }),
                            el: "#items",
                            title: "Wind Turbine Suppliers"
                        });


                mada.windTurbineCollectionView =
                    new mada.ItemCollectionView(
                        {
                            model: new mada.ItemCollectionModel(null, {
                                entityType: "windTurbine",
                                detailsTableName: "WindTurbinePowerCurve"
                            }),
                            el: "#items",
                            title: "Wind Turbine Types",
                            hasImport: "true",
                            postRender: this.showWindTurbineChart,
                            parentElement: {
                                label: "Supplier",
                                dataField: "windTurbineSupplierId",
                                parentTable: "WindTurbineSupplier",
                                changeCallback: "parentChanged"
                            }
                        });

                mada.storageSupplierCollectionView =
                  new mada.ItemCollectionView(
                      {
                          model: new mada.ItemCollectionModel(null, { entityType: "storageSupplier" }),
                          el: "#items",
                          title: "Storage Suppliers"
                      });


                mada.storageCollectionView =
                  new mada.ItemCollectionView(
                      {
                          model: new mada.ItemCollectionModel(null, { entityType: "storage" }),
                          el: "#items",
                          title: "Storage Types",
                          parentElement: {
                              label: "Supplier",
                              dataField: "storageSupplierId",
                              parentTable: "StorageSupplier",
                              changeCallback: "parentChanged"
                          },
                      });

                mada.importWindTurbineTypesDialogView =
                    new mada.ImportView(
                        {
                            model: new mada.ImportModel(null, { entityType: "importWindTurbines" }),
                            templateName: "import",
                            el: "#import",
                            title: "Import"
                        });

                mada.selectProjectDialogView =
                    new mada.SelectItemView(
                        {
                            templateName: "selectProject",
                            model: new mada.ItemCollectionModel(null, { entityType: "project" }),
                            el: "#selectItem",
                            title: "Please select a project",
                            onSelect: function (id) {
                                mada.router.navigate("#openProject/" + id, { trigger: true });
                            }
                        });

                mada.projectView =
                    new mada.ProjectView({
                        model: mada.projectModel,
                        el: "#projectPanel"
                    });

                mada.projectGeneralView =
                 new mada.ProjectGeneralView({
                     model: mada.projectModel,
                     el: "#projectGeneral"
                 });


                mada.madaView =
                    new mada.MadaView({
                        el: "#mada"
                    });
            },


            login: function (userName, passWord) {

                $("#login").modal('hide');
            },

            settingsSolarPanelSuppliers: function () {

                this.hidePlacholders();

                mada.solarPanelSupplierCollectionView.render();
            },

            settingsSolarPanels: function () {

                this.hidePlacholders();

                mada.solarPanelCollectionView.render();

                this.lastView = mada.solarPanelCollectionView;
            },

            settingsWindTurbineSuppliers: function () {

                this.hidePlacholders();

                mada.windTurbineSupplierCollectionView.render();

                this.lastView = mada.windTurbineSupplierCollectionView;
            },

            settingsWindTurbines: function () {

                this.hidePlacholders();

                mada.windTurbineCollectionView.render();

                this.lastView = mada.windTurbineCollectionView;
            },

            settingsStorageSuppliers: function () {

                this.hidePlacholders();

                mada.storageSupplierCollectionView.render();

                this.lastView = mada.storageSupplierCollectionView;
            },



            settingsStorage: function () {

                this.hidePlacholders();

                mada.storageCollectionView.render();

                this.lastView = mada.storageCollectionView;
            },

            import: function (parentParam) {

                if (parentParam.parentFieldName == "windTurbineSupplierId") {
                    mada.importWindTurbineTypesDialogView.render(parentParam.parentFieldValue);
                }
            },


            selectProject: function () {

                mada.selectProjectDialogView.render();
            },

            openProject: function (params) {

                var id = params[0];

                this.hidePlacholders();

                mada.projectView.render(id);

            },

            openProjectGeneral: function (params) {

                var id = params[1];

                mada.projectGeneralView.render(id);
            },

            showWindTurbineChart: function (model, viewEl, id) {

                var chartContainer =
                   viewEl.find("[data-id='" + id + "']").find("div[name='windTurbineChart']");

                var data = [];

                $.each(model.get("WindTurbinePowerCurve"), function (i, e) {

                    data.push({ y: e.WindVelocity, a: e.Power });
                });

                

                //if (viewEl.windTurbineChartObject == null) {

                  //  viewEl.windTurbineChartObject =

                        Morris.Line({
                            element: chartContainer,
                            data: data,
                            xkey: 'y',
                            ykeys: ['a'],
                            labels: [''],
                            parseTime: false
                        });
                //}
                //else {
                //    viewEl.windTurbineChartObject.setData(data);
                //}
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


