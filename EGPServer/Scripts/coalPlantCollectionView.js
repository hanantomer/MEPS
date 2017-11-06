(function () {

    mada.CoalPlantCollectionView = Backbone.View.extend({

        el: "#coalPlants",

        events: {
            //"click #btnAddCoalPlant": "addCoalPlant"
        },

        initialize: function () {

            _.bindAll(this, 'render');
            _.bindAll(this, 'addComponent');
        },

        addComponent: function() {

            this.addCoalPlant();
        },

        render: function () {

            var that = this;

            $("#components").show();

            $("#componentsList ul").html("");

            this.model.fetch({
                cache: false,
                success: function (results) {
                    $.each(results.models, function (i, e) {
                        that.showCoalPlant(e);
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

                        var coalPlantModel = that.model.getComponent(id, type);

                        coalPlantModel.fetch({

                            error: function(e) {
                                alert(e);
                            },

                            success: function (result) {

                                that.showCoalPlantStates(result);
                                            
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

        showCoalPlantStates: function (data) {

            var coalPlantModel = data;

            var that = this;

            $("#coalPlantStates").modal();

            $("#coalPlantStates h4").text(coalPlantModel.get("Name") + ": " + "States");

            $('#coalPlantStates').on('shown.bs.modal', function () {
                
                $("#coalPlantStatesTable").dataTable({
                    "data": data.get("States").models,
                    "searching": false,
                    "ordering": false,
                    "info": false,
                    "paging": false,
                    "destroy": true,
                    "columns":
                    [
                        { "data": "attributes.CoalPlantOperationModeName" },
                        {
                            "data": "attributes.CoalBurningPercentage", mRender: function (data) {

                                return that.getStateFieldHtml("CoalBurningPercentage", data);
                            }
                        },
                        {
                            "data": "attributes.CostPerHourPercentage", mRender: function (data) {

                                return that.getStateFieldHtml("CostPerHourPercentage", data);
                            }
                        },
                        {
                            "data": "attributes.EmissionPercentage", mRender: function (data) {

                                return that.getStateFieldHtml("EmissionPercentage", data);
                            }
                        },
                        {
                            "data": "attributes.MinutesToFullLoad", mRender: function (data) {

                                return that.getStateFieldHtml("MinutesToFullLoad", data);
                            }
                        },
                    ]
                });

                that.listenToChanges(coalPlantModel);
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

        getStateFieldHtml: function(name, value) {
            var val = value || '';
            var html = '<input max="100" type="number" data-field="' + name + '" value="' + val + '" class="form-control"/>';
            return html;
        },

        removeComponent: function (type, id) {

            this.model.removeComponent(type, id, this.render)
        },

        updateComponent: function (type, id, attrs) {

            this.model.updateComponent(type, id, attrs)
        },

        showCoalPlant: function (coalPlantModel) {

            var coalPlantHtml =
                "<li data-type='coalPlant' data-id='" + coalPlantModel.get("id") + "'>" +
                    $("#coalPlant").html() + "</li>";

            $("#componentsList ul").append(coalPlantHtml);

            var li =
                $("#componentsList ul").find("[data-id='" + coalPlantModel.get("id") + "']" +
                            "[data-type='" + coalPlantModel.get("Type") + "']");

            $(li).find("[name='ComponentName']").val(coalPlantModel.get("Name"));

            $(li).find("[name='Capacity']").val(coalPlantModel.get("Capacity"));
        },

        addComponent: function () {

            var that = this;

            this.model.addComponent(
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