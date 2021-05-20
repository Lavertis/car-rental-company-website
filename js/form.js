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

    $("#car-model").change(function () {
        const selectedCar = $("#car-model").val();
        const photoPath = cars[selectedCar]["photo-path"];
        const finalPath = `cars/images/small/${photoPath}`;
        $("#car-photo").prop('src', finalPath);
    })
});