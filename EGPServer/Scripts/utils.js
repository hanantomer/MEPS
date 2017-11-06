mada.initMap = function(container) {

    var mapElementList = container.find("div[name=map]");

    $.each(mapElementList, function (i, mapElement) {
        map = new google.maps.Map(mapElement, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8
        });
    });
}


mada.getHtmlFromFile = function (fileName) {
    var html;
    $.ajax({
        url: fileName,
        async: false,
        success: function (e) {
            html = e;
        }
    });
    return html;
}

mada.showWarning = function (txt, title, callback) {
    bootbox.dialog({
        message: txt,
        title: title,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: callback
            },
            danger: {
                label: "Cancel",
                className: "btn-danger"
            }
        }
    });
}

mada.populateViewByModel = function (li, model) {

    $.each(model.attributes, function (e, i) {

        $(li).find("[data-field='"  + e + "']").val(model.get(e));

    })
}