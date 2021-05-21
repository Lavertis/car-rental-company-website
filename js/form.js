$(document).ready(function () {
    let cars = null;
    fetch("http://localhost:63342/pai-project/cars/data/cars.json")
        .then(response => {
            if (response.status !== 200)
                return Promise.reject('Request failed');
            return response.json();
        })
        .then((json) => {
            cars = json;
        })
        .catch((error) => console.log(error));

    initializeLocalStorage();

    const carFromUrl = getCarFromUrl();
    const carModelSelect = $("#car-model");

    if (carFromUrl) {
        carModelSelect.val(carFromUrl);
        showSelectedCarPhoto(cars);
        showCarPrice(cars);
    }

    carModelSelect.change(function () {
        showSelectedCarPhoto(cars);
        showCarPrice(cars);
    })

    $("#rentBtn").click(saveRentToLocalStorage);
});

function initializeLocalStorage() {
    if (!localStorage.hasOwnProperty("rentedCars"))
        localStorage.setItem("rentedCars", JSON.stringify([]));
}

function saveRentToLocalStorage() {
    let rentedCars = JSON.parse(localStorage.getItem("rentedCars"));

    if (!isFormValid()) {
        alert("Form not valid");
    }

    let rent = {};
    let insurance = [];
    getCheckboxesChecked("insurance").forEach(el => insurance.push(el.val()));
    rent.carKey = $("#car-model").val();
    rent.insurance = insurance;
    rent.pickup = getRadioChecked("pickup-type").val();
    rent.startDate = $("#date-start").val();
    rent.endDate = $("#date-end").val();
    rent.name = $("#name").val();
    rent.surname = $("#surname").val();
    rent.phone = $("#phone").val();
    rentedCars.push(rent);
    localStorage.setItem("rentedCars", JSON.stringify(rentedCars));
}

function getRadioChecked(radioGroupName) {
    let radio = null;
    $(`[name='${radioGroupName}']`).each(function () {
        if (this.checked) radio = $(this);
    });
    return radio;
}

function getCheckboxesChecked(checkboxGroupName) {
    let checkedCheckboxes = [];
    $(`[name='${checkboxGroupName}']`).each(function () {
        if (this.checked) checkedCheckboxes.push($(this));
    });
    return checkedCheckboxes;
}

function isAnyRadioChecked(radioGroupName) {
    let checked = false;
    $(`[name='${radioGroupName}']`).each(function () {
        if (this.checked)
            checked = true;
    });
    return checked;
}

function isFormValid() {
    return true;
}

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