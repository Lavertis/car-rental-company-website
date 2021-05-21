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
            setSelectedCarFromUrlParam(cars);
        })
        .catch((error) => console.log(error));

    initializeLocalStorage();
    initializeDataPickers();

    $("#car-model").change(function () {
        showSelectedCarPhoto(cars);
        showCarPrice(cars);
    })

    $("#rentBtn").click(saveRentToLocalStorage);
});

function initializeLocalStorage() {
    if (!localStorage.hasOwnProperty("rentedCars"))
        localStorage.setItem("rentedCars", JSON.stringify([]));
}

function initializeDataPickers() {
    const minDate = getTodayDateAsStr(1);
    $("#date-start").prop("min", minDate);
    $("#date-end").prop("min", minDate);
}

function setSelectedCarFromUrlParam(cars) {
    const carFromUrl = getCarFromUrl();
    const carModelSelect = $("#car-model");
    if (carFromUrl) {
        carModelSelect.val(carFromUrl);
        showSelectedCarPhoto(cars);
        showCarPrice(cars);
    }
}

function saveRentToLocalStorage() {
    if (!isFormValid())
        return false;

    let rentedCars = JSON.parse(localStorage.getItem("rentedCars"));
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
    $("form-status").html("&nbsp");
    if (!isCarSelected()) return false;
    if (!isPickupTypeSelected()) return false;
    if (!isDateCorrect()) return false;
    if (!isNameCorrect()) return false;
    if (!isSurnameCorrect()) return false;
    return isPhoneCorrect();
}

function isCarSelected() {
    const carKey = $("#car-model").val();
    if (carKey === null) {
        $("#form-status").html("Wybierz samochód");
        return false;
    }
    return true;
}

function isPickupTypeSelected() {
    if (!isAnyRadioChecked("pickup-type")) {
        $("#form-status").html("Wybierz sposób odbioru pojazdu")
        return false;
    }
    return true;
}

function isDateCorrect() {
    const today = getTodayDateAsStr();
    const startDate = $("#date-start").val();
    const endDate = $("#date-end").val();

    if (startDate === "") {
        $("#form-status").html("Wybierz datę rozpoczęcia wynajmu");
        return false;
    } else if (Date.parse(startDate) <= Date.parse(today)) {
        $("#form-status").html("Możesz rozpocząć wynajem dopiero od jutra");
        return false;
    }

    if (endDate === "") {
        $("#form-status").html("Wybierz datę zakończenia wynajmu")
        return false;
    } else if (Date.parse(endDate) < Date.parse(startDate)) {
        $("#form-status").html("Data zakończenia wynajmu nie może być przed datą rozpoczęcia");
        return false;
    }
    return true;
}

function isNameCorrect() {
    const name = $("#name").val();
    const regex = new RegExp("\\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+");
    if (name === "") {
        $("#form-status").html("Pole z imieniem nie może być puste");
        return false;
    } else if (!regex.test(name)) {
        $("#form-status").html("Wprowadzone imię jest niepoprawne");
        return false;
    }
    return true;
}

function isSurnameCorrect() {
    const surname = $("#surname").val();
    const regex = new RegExp("^[A-ZŁŚ][a-ząęółśżźćń]{1,20}(-[A-ZŁŚ][a-ząęółśżźćń]{1,20}){0,2}$");
    if (surname === "") {
        $("#form-status").html("Pole z nazwiskiem nie może być puste");
        return false;
    } else if (!regex.test(surname)) {
        $("#form-status").html("Wprowadzone nazwisko jest niepoprawne");
        return false;
    }
    return true;
}


function isPhoneCorrect() {
    const phone = $("#phone").val();
    const regex = new RegExp("^[1-9][0-9]{8}$");
    if (phone === "") {
        $("#form-status").html("Pole z telefonem nie może być puste");
        return false;
    } else if (!regex.test(phone)) {
        $("#form-status").html("Wprowadzony numer telefonu jest niepoprawny");
        return false;
    }
    return true;
}

function getTodayDateAsStr(addDays = 0) {
    const today = new Date();
    today.setDate(today.getDate() + addDays);
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    return yyyy + '-' + mm + '-' + dd
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