(function () {

    


    mada.ProjectGeneralView = Backbone.View.extend({

        events: {
            "change input": "change",
        },

        initialize: function (attrs) {

            _.bindAll(this, 'render');
            _.bindAll(this, 'setGeneralCoordinates');
            _.bindAll(this, 'change');

            this.options = attrs;

            this.setValidation();

        },

        change: function (e) {

            if (e.currentTarget.id === "projectCoordinates") {

                var lat_lng_arr = e.currentTarget.value.split(",");

                this.generalMap.panTo({ lat: parseInt(lat_lng_arr[0]), lng: parseInt(lat_lng_arr[1])});
            }
        },


        setValidation: function () {

            $("#projectGeneralForm").validator({
                custom: {
                    'validatecoordinates': mada.validatecoordinates
                },
                errors: {
                    'validatecoordinates': "invalid coordinates"
                }
            });
        },

        render: function (id) {

            var that = this;

            this.model.set("entityType", "project");

            this.model.set("id", id);

            this.model.fetch({

                success: function () {

                    $.each(that.model.attributes, function (e, i) {

                        that.$el.find('[data-field="' + e + '"]').val(that.model.get(e));
                    });

                    var lat = that.model.get("Lat");
                    var lng = that.model.get("Lng");

                    that.$el.find('[data-field="Coordinates"]').val(lat + "," + lng);

                    that.generalMap =
                        mada.initMap($("#generalMap")[0], that.setGeneralCoordinates, lat, lng);

                }
            });
        },
        setGeneralCoordinates: function (latLng) {

            this.model.set('Lat', latLng.lat());
            this.model.set('Lng', latLng.lng());

            this.model.save(
                this.model.attributes,
                {
                    patch: true,
                    error: function (e) { mada.showWarning("Error while updating project", "Error") }
                });
        }
    });
})();
