$(document).ready(function () {
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

    const carFromUrl = getCarFromUrl();
    const carModelSelect = $("#car-model");

    if (carFromUrl) {
        carModelSelect.val(carFromUrl);
        showSelectedCarPhoto(cars);
    }

    carModelSelect.change(function () {
        showSelectedCarPhoto(cars);
        showCarPrice(cars);
    })
});

function showSelectedCarPhoto(cars) {
    const selectedCar = $("#car-model").val();
    const photoPath = cars[selectedCar]["photo-path"];
    const finalPath = `cars/images/small/${photoPath}`;
    $("#car-photo").removeAttr("hidden").prop('src', finalPath);
}

function showCarPrice(cars) {
    const selectedCar = $("#car-model").val();
    const price = cars[selectedCar]["price"];
    $("#price").html(`${price} PLN`);
}

function getCarFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('car');
}