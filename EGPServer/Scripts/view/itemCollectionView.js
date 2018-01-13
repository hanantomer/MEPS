(function () {

    mada.ItemCollectionView = Backbone.View.extend({


        initialize: function (attrs) {


            mada.assert(this.model.entityType != null);

            this.parentParamStorageKey = "mada." + this.model.entityType + ".parentParam";

            this.options = attrs;

            this.collectionHtml = mada.getHtmlFromFile("template/itemCollection.html");

            this.itemHtml = mada.getHtmlFromFile("template/" + this.model.entityType + ".html");

            this.setTemplates();

            _.bindAll(this, 'render');
            _.bindAll(this, 'parentChanged');
            _.bindAll(this, 'addItem');
            _.bindAll(this, 'import');
        },

        setTemplates: function () {

            this.parentElementTemplate =
                _.template(
                "<select class='form-control'/></select>");

            this.bodyTemplate = _.template(this.collectionHtml);
        },

        render: function () {

            var that = this;

            $(this.el).html(this.bodyTemplate({ title: this.options.title }));

            if (!this.options.hasImport) {
             $(this.$el.find("button[name='import']")).hide();
            }

            $(this.el).show();

            if (this.options.parentElement != null) {

                this.setParentElement();

            }
            else {
                this.loadItems();
            }

            $(this.el).find("div.panel-heading button[name='add']").click(this.addItem);
            $(this.el).find("div.panel-heading button[name='import']").click(this.import);
        },

        setParentElement: function () {

            var parentElParam = this.options.parentElement;

            this.parentEl = $(this.el).find("div [name='itemsParent']");

            $(this.parentElementTemplate()).appendTo(this.parentEl);

            var savedParentParam = null;

            if (localStorage.getItem(this.parentParamStorageKey)) {
                savedParentParam = JSON.parse(localStorage.getItem(this.parentParamStorageKey));
            }

            var $select = this.parentEl.find("select");

            var that = this;

            $select.select2({
                placeholder: "select " + parentElParam.label,
                minimumInputLength: 0,
                multiple: false,
                ajax:
                    {
                        url:
                            "Handlers/handler.ashx?entityType=" +
                            parentElParam.parentTable +
                            "&select2=true"
                    }
            });


            $select.on('select2:select', function (e) {

                var data = e.params.data;

                if (that[parentElParam.changeCallback]) {

                    var parentParam = {};
                    parentParam["parentFieldName"] = parentElParam.dataField;
                    parentParam["parentFieldValue"] = data.id;
                    parentParam["parentFieldText"] = data.text;

                    localStorage.setItem(that.parentParamStorageKey, JSON.stringify(parentParam));

                    that[parentElParam.changeCallback](parentParam);
                }
                else {
                    alert("callback function" + parentElParam.changeCallback + ", does not exist");
                }

            });

            if (savedParentParam) {

                var $option = $("<option selected class='select2'>" + savedParentParam.parentFieldText + "</option>").
                    val(savedParentParam.parentFieldValue);

                $select.empty().append($option);

                var data = {
                    "id": savedParentParam.parentFieldValue,
                    "text": savedParentParam.parentFieldText
                };

                $select.trigger({
                    type: 'select2:select',
                    params: {
                        data: data
                    }
                });

            } else {
                savedParentParam = {};
            }

            var that = this;

        },

        parentChanged: function (parentParam) {

            this.parentParam = parentParam;

            this.loadItems(parentParam);
        },

        loadItems: function (parentParam) {

            this.itemsListEl = $(this.el).find("div[name='itemsList'] ul");

            this.itemsListEl.html("");

            var that = this;

            this.model.fetch({
                data: $.param(parentParam || 0),
                cache: false,
                success: function (results) {

                    $.each(results.models, function (i, e) {

                        that.showItem(e);
                    });

                    $("button[name='remove']").on("click", function (e) {

                        var itemName = $(e.currentTarget).closest("li").find('input[data-field="Name"]').val();

                        mada.showWarning(
                            "Are you sure?",
                            "Remove " + itemName,
                            function () {

                                var id = $(e.currentTarget).closest("li").data("id");

                                that.removeItem(id);
                            });
                    });


                    $("input").on("change", function (e) {

                        var id = $(e.currentTarget).closest("li").data("id");

                        var itemModel = that.model.getItem(id);

                        that.updateItem(
                            id,
                            [{
                                "name": $(e.currentTarget).data("field"),
                                "value": e.currentTarget.value
                            }]);

                        if (that.options.showDetails) {
                            that.options.showDetails(itemModel, $(e.currentTarget).closest("li"));
                        }
                    });
                }
            });

        },

        removeItem: function (id) {

            this.model.removeItem(id, this.render)
        },

        updateItem: function (id, attrs) {

            this.model.updateItem(id, attrs)
        },

        showItem: function (itemModel) {

            var html =
                "<li data-id='" + itemModel.get("id") + "'>" +
                    this.itemHtml + "</li>";


            this.itemsListEl.append(html);

            var li =
                this.itemsListEl.find("[data-id='" + itemModel.get("id") + "']");

            mada.populateViewByModel(li, itemModel);

            if (this.options.postRender) {

                this.options.postRender(itemModel, this.$el, itemModel.get("id"));
            }
        },

        addItem: function () {

            var that = this;

            var parentFieldName;
            var parentFieldValue;

            if (this.options.parentElement != null) {

                parentFieldName = this.options.parentElement.dataField;

                parentFieldValue = this.$el.find("#itemsParent select").val();

                if (parentFieldValue == null) {

                    mada.showWarning("please select a " + this.options.parentElements[0].label);
                    return;
                }
            }

            this.model.addItem(
                this.options.title,
                parentFieldName,
                parentFieldValue,
                function (e) {
                    alert(e);
                    console.error(e);
                },
                function (e) {
                    that.render();
                });
        },

        import: function () {

            mada.controller.import(this.parentParam);
        }
    });
})();
