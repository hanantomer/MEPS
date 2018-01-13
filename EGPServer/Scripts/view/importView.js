(function () {

    mada.ImportView = Backbone.View.extend({

        initialize: function (attrs) {

            this.options = attrs;

            this.itemHtml = mada.getHtmlFromFile("template/" + this.options.templateName + ".html");


            _.bindAll(this, 'render');
            _.bindAll(this, 'import');
            _.bindAll(this, 'setSelectedFiles');
        },

        render: function (supplierId) {

            this.supplierId = supplierId;

            var that = this;

            this.$el.show();

            this.$el.html(this.itemHtml);

            mada.registerFileSelect(this.$el, this.setSelectedFiles);

            this.$el.find('button[name="import"]').click(function (i, e) {

                that.import();
            });

            this.$el.modal();
        },

        setSelectedFiles: function (selectedFiles) {

            this.selectedFiles = selectedFiles;
        },

        import: function () {

            var that = this;

            var numFilesImported = 0;

            $.each(this.selectedFiles, function (i, e) {

                var file = e;
                var reader = new FileReader();
                reader.addEventListener("load", function (e) {

                    var data = new FormData();
                    data.append(file.name, file);
                
                    var ajaxRequest = $.ajax({
                        type: "POST",
                        url: "Handlers/Handler.ashx?entityType=" +
                            that.model.entityType +
                            "&parentFieldValue=" + that.supplierId,
                        contentType: false,
                        processData: false,
                        data: data
                    });

                    ajaxRequest.done(function (xhr, textStatus) {
                        numFilesImported++;
                    });
                });

                reader.readAsDataURL(file);
            });

            mada.showMessage(numFilesImported + " imported");
        }
    });
})();
