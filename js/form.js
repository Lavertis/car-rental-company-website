$(document).ready(function () {
    $("#car-photo").hide();
    const carModelSelect = $("#car-model");

    let cars = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "cars/data/cars.json",
        'dataType': "json",
        'success': function (data) {
            cars = data;
        }
    });

    const carFromUrl = getSelectedCarFromUrl();

    if (carFromUrl) {
        carModelSelect.val(carFromUrl);
        showSelectedCarPhoto(cars);
    }

    carModelSelect.change(function () {
        showSelectedCarPhoto(cars)
    })
});

function showSelectedCarPhoto(cars) {
    const selectedCar = $("#car-model").val();
    const photoPath = cars[selectedCar]["photo-path"];
    const finalPath = `cars/images/small/${photoPath}`;
    $("#car-photo").show().prop('src', finalPath);
}

function getSelectedCarFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('car');
}