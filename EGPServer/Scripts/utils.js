mada.registerFileSelect = function ($el, setSelectedFies)
{
    $el.on('change', ':file', function () {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

        if (setSelectedFies) {
            setSelectedFies(input.get(0).files);
        }

        input.trigger('fileselect', [numFiles, label]);
    });

    $el.find(':file').on('fileselect', function (event, numFiles, label) {

        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;

        if (input.length) {
            input.val(log);
        } else {
            if (log) alert(log);
        }
    });
}

mada.showReferenceTable = function ($el, data, onSelectCallback, isModal) {

    var table = $el.find('table').DataTable({
        "sDom": "",
        "aaData": data,
        "columnDefs": [
        {
            "targets": [0],
            "visible": false
        }],
        "columns": [
            { "data": "attributes.id" },
            { "data": "attributes.Name" }
        ]
    });

    table.on('click', 'tr', function (e, dt, type, indexes) {
        var rowData = table.row(e.currentTarget).data();

        if (onSelectCallback) {
            onSelectCallback(rowData.id);
        }

        if (isModal) {
            $($el).modal('toggle');
        }
    });

}

mada.assert = function (condition) {
    if (!condition) {
        alert("assertion failed")
    }
}

mada.validatecoordinates = function ($el) {

    if (!$el.val())
        return false;

    var lat_lon_arr = $el.val().split(",");

    if (lat_lon_arr.length != 2) {
        //                    e.currentTarget.setCustomValidity("Invalid coordinates format, should be:[latitude,longitude]");
        return false;
    }

    var lat_regex = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
    var lon_regex = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;

    var validLat = lat_regex.test(lat_lon_arr[0].trim());
    var validLon = lon_regex.test(lat_lon_arr[1].trim());

    if (!validLat) {
        //                  lat_lon.setCustomValidity("invalid latitude");
        return false;
    }

    if (!validLon) {
        //                    lat_lon.setCustomValidity("invalid longitude");
        return false;
    }

    //              lat_lon.setCustomValidity("");
    return true;
}

mada.initMap = function (el, clickCallback, lat, lng) {

    map = new google.maps.Map(el, {
        center: {
            lat: lat, lng: lng
        },
        zoom: 8
    });

    var marker = new google.maps.Marker({
        position: {
            lat: -34.397, lng: 150.644
        },
        map: map,
        draggable: false,
        title: ''
    });

    map.addListener('click', function (e) {

        marker.setPosition(e.latLng);
        if (clickCallback)
            clickCallback(e.latLng);
    });

    return map;
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

mada.showMessage = function (txt, title, callback) {
    bootbox.dialog({
        message: txt,
        title: title,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: callback
            }
        }
    });
}

mada.populateViewByModel = function (li, model) {

    $.each(model.attributes, function (e, i) {

        var elm = $(li).find("[data-field='" + e + "']");

        if (elm.is('input')) {
            elm.val(model.get(e));
        }
    });
}