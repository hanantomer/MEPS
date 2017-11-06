(function () {

    mada.WindTurbineCollectionView = Backbone.View.extend({

        el: "#windTurbine",

        initialize: function () {

            _.bindAll(this, 'render');
            _.bindAll(this, 'addItem');
        },

        render: function () {

            var that = this;

            $("#items").show();

            $("#itemsList ul").html("");

            this.model.fetch({
                cache: false,
                success: function (results) {
                    $.each(results.models, function (i, e) {
                        that.showComponent(e);
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

                        var windTurbineModel = that.model.getComponent(id, type);

                        windTurbineModel.fetch({

                            error: function (e) {
                                alert(e);
                            },

                            success: function (result) {

                                that.showWindTurbineChart(result);

                            }
                        });
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

        showWindTurbineChart: function (model) {

            $("#windTurbineChart h4").text(model.get("Name") + ": " + "Chart");

            $("#windTurbineChart").modal();

            $('#windTurbineChart').on('shown.bs.modal', function () {

                var data = [];

                data.push({ y: 0, a: 0 });

                data.push({ y: model.get("MinWindVelocity"), a: 0 });

                data.push({ y: model.get("MinWindVelocity"), a: model.get("MinCapacity") });

                for (
                    var i = model.get("MinWindVelocity") + 1; 
                    i <= model.get("MaxWindVelocity") ; 
                    i++) {

                    var capacity = 
                        model.get("MinCapacity") *
                            Math.pow(
                                i / model.get("MinWindVelocity"),
                                3);

                    capacity = Math.min(capacity, model.get("MaxCapacity"))

                    data.push({ y: i, a: Math.round(capacity) });
                }

                data.push({ y: model.get("MaxWindVelocity"), a: 0 });

                if (window.windTurbineChartObject == null) {

                    window.windTurbineChartObject =

                        Morris.Line({
                            element: 'windTurbinChartDialogBody',
                            data: data,
                            xkey: 'y',
                            ykeys: ['a'],
                            labels: [''],
                            parseTime: false
                        });
                }
                else {
                    window.windTurbineChartObject.setData(data);
                }
            })

            
        },

        listenToChanges: function (coalPlantModel) {

            var that = this;

            $("#coalPlantStates input").change(function (e) {

                var val = e.currentTarget.value;

                var fieldName = $(e.currentTarget).data("field");

                var rowIndex = $(e.currentTarget).closest('tr').index();

                var coalPlantStateModel = 
                    coalPlantModel.get("States").models[rowIndex];

                coalPlantStateModel.set(fieldName, val);

                var changed = {};

                changed[fieldName] = val;

                changed["CoalPlantId"] = coalPlantModel.get("id");

                changed["id"] = coalPlantStateModel.get("id");

                changed["CoalPlantOperationModeId"] = coalPlantStateModel.get("CoalPlantOperationModeId");

                coalPlantStateModel.save(
                    changed,
                    {
                        patch:true,
                        error: function (e) { alert(e)}
                    });
            });
        },

        removeComponent: function (type, id) {

            this.model.removeComponent(type, id, this.render)
        },

        updateComponent: function (type, id, attrs) {

            this.model.updateComponent(type, id, attrs)
        },

        showComponent: function (model) {

            var html =
                "<li data-type='windTurbine' data-id='" + model.get("id") + "'>" +
                    $("#windTurbine").html() + "</li>";

            $("#itemsList ul").append(html);

            var li =
                $("#itemsList ul").find("[data-id='" + model.get("id") + "']" +
                            "[data-type='" + model.get("Type") + "']");

            mada.populateViewByModel(li, model);

        },

        addItem: function () {

            var that = this;

            this.model.addItem(
                'coalPlant',
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
