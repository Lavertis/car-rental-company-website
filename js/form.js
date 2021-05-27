$(document).ready(function () {
    initializeLocalStorage();
    initializeDataPickers();
    const rentForm = new RentForm();
    addCallbacksToButtons(rentForm);
});

function initializeLocalStorage() {
    if (!localStorage.hasOwnProperty("rentedCars"))
        localStorage.setItem("rentedCars", JSON.stringify([]));
}

function initializeDataPickers() {
    const minDate = DateEx.getTodayDateAsStr(1);
    $("#date-start").prop("min", minDate);
    $("#date-end").prop("min", minDate);
}

function addCallbacksToButtons(rentForm) {
    $("input, select").change(function () {
        rentForm.clearFormStatus();
    })

    $("#car-model").change(function () {
        rentForm.showSelectedCarPhoto();
        rentForm.showCarPrice();
    });

    $("#date-start").change(function () {
        $("#date-end").prop("min", $(this).val());
    });

    $("#date-end").change(function () {
        $("#date-start").prop("max", $(this).val());
    });

    $("#rentBtn").click(function () {
        rentForm.clearFormStatus();
        rentForm.getValuesFromInputFields();
        if (!rentForm.isFormValid())
            return false;
        const finalPrice = rentForm.getFinalPrice();
        $("#modal-body").html(`Do zapłaty: ${finalPrice} PLN`);
        $('#confirmationModal').modal('show');
    });

    $("#confirmBtn").click(function () {
        rentForm.saveRentToLocalStorage();
    });
}

class RentForm {
    constructor() {
        this.carsData = [];
        this.extraFeeMap = new Map();
        this.validator = new Validator();
        this.formStatus = $("#form-status");
        this.carSelected = "";
        this.insurance = [];
        this.pickupType = ";"
        this.startDate = "";
        this.endDate = "";
        this.name = "";
        this.surname = "";
        this.phone = "";
        this.fetchCarsData();
        this.initializeExtraFeeMap();
    }

    fetchCarsData() {
        fetch("http://localhost:63342/pai-project/cars/data/cars.json")
            .then(response => {
                if (response.status !== 200)
                    return Promise.reject('Request failed');
                return response.json();
            })
            .then((json) => {
                this.carsData = json;
                this.setSelectedCarFromUrlParam();
            })
            .catch((error) => console.log(error));
    }

    initializeExtraFeeMap() {
        this.extraFeeMap.set("address-delivery-pickup", 20);
        this.extraFeeMap.set("self-pickup", 0);
        this.extraFeeMap.set("tyres-insurance", 5);
        this.extraFeeMap.set("windows-insurance", 5);
        this.extraFeeMap.set("theft-insurance", 10);
    }

    getValuesFromInputFields() {
        this.carSelected = $(`#car-model`).val();
        this.insurance = this.getCheckedCheckboxesValues("insurance");
        this.pickupType = this.getCheckedRadioValue("pickup-type");
        this.startDate = $("#date-start").val();
        this.endDate = $("#date-end").val();
        this.name = $("#name").val();
        this.surname = $("#surname").val();
        this.phone = $("#phone").val();
    }

    setSelectedCarFromUrlParam() {
        const carFromUrl = this.getParamFromUrl('car');
        const carModelSelect = $("#car-model");
        if (carFromUrl) {
            carModelSelect.val(carFromUrl);
            this.carSelected = carFromUrl;
            this.showSelectedCarPhoto();
            this.showCarPrice();
        }
    }

    getParamFromUrl(param) {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get(param);
    }

    clearFormStatus() {
        $("#form-status").html("&nbsp");
    }

    getFinalPrice() {
        let extraFees = 0;
        this.insurance.forEach(value => extraFees += this.extraFeeMap.get(value));
        extraFees += this.extraFeeMap.get(this.pickupType);
        const differenceInDays = DateEx.getDifferenceInDays(this.startDate, this.endDate);
        const carDailyPrice = this.carsData[this.carSelected]["price"];
        return differenceInDays * carDailyPrice + extraFees;
    }

    saveRentToLocalStorage() {
        let rentedCars = JSON.parse(localStorage.getItem("rentedCars"));
        let rent = {};
        let insurance = [];
        this.getCheckedCheckboxesValues("insurance").forEach(value => insurance.push(value));
        rent.carName = $("#car-model").val();
        rent.insurance = insurance;
        rent.pickup = this.getCheckedRadioValue("pickup-type");
        rent.startDate = $("#date-start").val();
        rent.endDate = $("#date-end").val();
        rent.name = $("#name").val();
        rent.surname = $("#surname").val();
        rent.phone = $("#phone").val();
        rent.price = this.getFinalPrice();
        rentedCars.push(rent);
        localStorage.setItem("rentedCars", JSON.stringify(rentedCars));
    }

    showSelectedCarPhoto() {
        this.carSelected = $(`#car-model`).val();
        const photoPath = this.carsData[this.carSelected]["photo-path"];
        const finalPath = `cars/images/small/${photoPath}`;
        $("#car-photo").removeAttr("hidden").prop('src', finalPath);
    }

    showCarPrice() {
        const price = this.carsData[this.carSelected]["price"];
        $("#price").html(`${price} PLN`);
    }

    isFormValid() {
        const isCarSelected = this.validator.isOptionSelected(this.carSelected);
        if (isCarSelected === Validator.Status.NOT_SELECTED) {
            $("#form-status").html("Wybierz samochód");
            return false;
        }

        const isPickupTypeSelected = this.validator.isAnyRadioChecked("pickup-type");
        if (isPickupTypeSelected === Validator.Status.CHECKED_NONE) {
            this.formStatus.html("Wybierz sposób odbioru pojazdu");
            return false;
        }

        const startDateStatus = this.validator.isDateCorrect(this.startDate);
        if (startDateStatus === Validator.Status.EMPTY) {
            this.formStatus.html("Wybierz datę rozpoczęcia wynajmu");
            return false;
        }

        const endDateStatus = this.validator.isDateCorrect(this.endDate);
        if (endDateStatus === Validator.Status.EMPTY) {
            this.formStatus.html("Wybierz datę zakończenia wynajmu");
            return false;
        }

        const nameStatus = this.validator.isNameCorrect(this.name);
        switch (nameStatus) {
            case Validator.Status.EMPTY:
                this.formStatus.html("Pole z imieniem nie może być puste");
                return false;
            case Validator.Status.REGEX_MISMATCH:
                this.formStatus.html("Wprowadzone imię jest niepoprawne");
                return false;
        }

        const surnameStatus = this.validator.isSurnameCorrect(this.surname);
        switch (surnameStatus) {
            case Validator.Status.EMPTY:
                this.formStatus.html("Pole z nazwiskiem nie może być puste");
                return false;
            case Validator.Status.REGEX_MISMATCH:
                this.formStatus.html("Wprowadzone nazwisko jest niepoprawne");
                return false;
        }

        const phoneStatus = this.validator.isPhoneCorrect(this.phone);
        switch (phoneStatus) {
            case Validator.Status.EMPTY:
                this.formStatus.html("Pole z numerem telefonu nie może być puste");
                return false;
            case Validator.Status.REGEX_MISMATCH:
                this.formStatus.html("Wprowadzony numer telefonu jest niepoprawny");
                return false;
        }

        return true;
    }

    getCheckedRadioValue(radioGroupName) {
        const radioGroup = document.getElementsByName(radioGroupName);
        for (const radio of radioGroup) {
            if (radio.checked)
                return radio.value;
        }
        return null
    }

    getCheckedCheckboxesValues(checkboxGroupName) {
        let checkedCheckboxes = [];
        const checkboxGroup = document.getElementsByName(checkboxGroupName);
        for (const checkbox of checkboxGroup) {
            if (checkbox.checked) checkedCheckboxes.push(checkbox.value);
        }
        return checkedCheckboxes;
    }
}

class Validator {
    static Status = {
        VALID: 1,
        EMPTY: 2,
        REGEX_MISMATCH: 3,
        CHECKED_SOME: 4,
        CHECKED_NONE: 5,
        SELECTED: 6,
        NOT_SELECTED: 7
    }

    constructor() {
        this.nameRegex = new RegExp("\\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+");
        this.surnameRegex = new RegExp("^[A-ZŁŚ][a-ząęółśżźćń]{1,20}(-[A-ZŁŚ][a-ząęółśżźćń]{1,20}){0,2}$");
        this.phoneRegex = new RegExp("^[1-9][0-9]{8}$");
    }

    isOptionSelected(selectedValue) {
        if (selectedValue === null)
            return Validator.Status.NOT_SELECTED;
        return Validator.Status.SELECTED;
    }

    isAnyRadioChecked(radioGroupName) {
        const radioGroup = document.getElementsByName(radioGroupName);
        for (const radio of radioGroup)
            if (radio.checked)
                return Validator.Status.CHECKED_SOME;
        return Validator.Status.CHECKED_NONE;
    }

    isEmpty(text) {
        return text === "";
    }

    isDateCorrect(date) {
        if (this.isEmpty(date))
            return Validator.Status.EMPTY;
        return Validator.Status.VALID;
    }

    isNameCorrect(name) {
        if (this.isEmpty(name))
            return Validator.Status.EMPTY;
        if (!this.nameRegex.test(name))
            return Validator.Status.REGEX_MISMATCH;
        return Validator.Status.VALID;
    }

    isSurnameCorrect(surname) {
        if (this.isEmpty(surname))
            return Validator.Status.EMPTY;
        if (!this.surnameRegex.test(surname))
            return Validator.Status.REGEX_MISMATCH;
        return Validator.Status.VALID;
    }

    isPhoneCorrect(phone) {
        if (this.isEmpty(phone))
            return Validator.Status.EMPTY;
        if (!this.phoneRegex.test(phone))
            return Validator.Status.REGEX_MISMATCH;
        return Validator.Status.VALID;
    }
}

class DateEx {
    static getTodayDateAsStr(addDays = 0) {
        const today = new Date();
        today.setDate(today.getDate() + addDays);
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();
        return yyyy + '-' + mm + '-' + dd
    }

    static getDifferenceInDays(startDate, endDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const differenceInTime = endDateObj.getTime() - startDateObj.getTime();
        return Math.round(differenceInTime / (1000 * 3600 * 24)) + 1;
    }
}