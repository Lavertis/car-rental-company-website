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
    $("#date-start").prop("min", minDate).removeAttr("max");
    $("#date-end").prop("min", minDate).removeAttr("max");
}

function addCallbacksToButtons(rentForm) {
    $("input, select").change(function () {
        rentForm.clearFormStatus();
    })

    $("#car-model").change(function () {
        rentForm.showSelectedCarPhoto();
        rentForm.showCarPrice();
        $("#car-photo").show();
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
        rentForm.resetForm();
    });
}

class RentItem {
    constructor() {
        this.carName = "";
        this.insurance = [];
        this.pickup = ""
        this.startDate = "";
        this.endDate = "";
        this.name = "";
        this.surname = "";
        this.phone = "";
        this.price = 0;
        this.stars = 0;
    }
}

class RentForm {
    constructor() {
        this.carsData = [];
        this.extraFeeMap = new Map();
        this.validator = new Validator();
        this.form = $("#rent-form");
        this.formStatus = $("#form-status");
        this.rentItem = new RentItem();
        this.fetchCarsData();
        this.initializeExtraFeeMap();
    }

    fetchCarsData() {
        fetch("cars/data/cars.json")
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
        this.rentItem.carName = $(`#car-model`).val();
        this.rentItem.insurance = this.getCheckedCheckboxesValues("insurance");
        this.rentItem.pickup = this.getCheckedRadioValue("pickup-type");
        this.rentItem.startDate = $("#date-start").val();
        this.rentItem.endDate = $("#date-end").val();
        this.rentItem.name = $("#name").val();
        this.rentItem.surname = $("#surname").val();
        this.rentItem.phone = $("#phone").val();
    }

    setSelectedCarFromUrlParam() {
        const carFromUrl = this.getParamFromUrl('car');
        const carModelSelect = $("#car-model");
        if (carFromUrl) {
            carModelSelect.val(carFromUrl);
            this.rentItem.carName = carFromUrl;
            this.showSelectedCarPhoto();
            this.showCarPrice();
        }
    }

    getParamFromUrl(param) {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get(param);
    }

    resetForm() {
        this.form.trigger("reset");
        $("#price").html("");
        $("#car-photo").hide();
        initializeDataPickers();
    }

    clearFormStatus() {
        $("#form-status").html("&nbsp;");
    }

    getFinalPrice() {
        let extraFees = 0;
        this.rentItem.insurance.forEach(value => extraFees += this.extraFeeMap.get(value));
        extraFees += this.extraFeeMap.get(this.rentItem.pickup);
        const differenceInDays = DateEx.getDifferenceInDays(this.rentItem.startDate, this.rentItem.endDate);
        const carDailyPrice = this.carsData[this.carName]["price"];
        this.rentItem.price = differenceInDays * carDailyPrice + extraFees;
        return this.rentItem.price;
    }

    saveRentToLocalStorage() {
        let rentedCars = JSON.parse(localStorage.getItem("rentedCars"));
        rentedCars.unshift(this.rentItem);
        localStorage.setItem("rentedCars", JSON.stringify(rentedCars));
    }

    showSelectedCarPhoto() {
        this.carName = $(`#car-model`).val();
        const photoPath = this.carsData[this.carName]["photo-path"];
        const finalPath = `cars/images/small/${photoPath}`;
        $("#car-photo").removeAttr("hidden").prop('src', finalPath);
    }

    showCarPrice() {
        const price = this.carsData[this.carName]["price"];
        $("#price").html(`${price} PLN`);
    }

    isFormValid() {
        const carSelectedStatus = this.validator.isOptionSelected(this.carName);
        if (carSelectedStatus === Validator.Status.NOT_SELECTED) {
            $("#form-status").html("Wybierz samochód");
            return false;
        }

        const pickupStatus = this.validator.isAnyRadioChecked("pickup-type");
        if (pickupStatus === Validator.Status.CHECKED_NONE) {
            this.formStatus.html("Wybierz sposób odbioru pojazdu");
            return false;
        }

        const startDateStatus = this.validator.isDateCorrect(this.rentItem.startDate);
        if (startDateStatus === Validator.Status.EMPTY) {
            this.formStatus.html("Wybierz datę rozpoczęcia wynajmu");
            return false;
        }

        const endDateStatus = this.validator.isDateCorrect(this.rentItem.endDate);
        if (endDateStatus === Validator.Status.EMPTY) {
            this.formStatus.html("Wybierz datę zakończenia wynajmu");
            return false;
        }

        const nameStatus = this.validator.isNameCorrect(this.rentItem.name);
        switch (nameStatus) {
            case Validator.Status.EMPTY:
                this.formStatus.html("Pole z imieniem nie może być puste");
                return false;
            case Validator.Status.REGEX_MISMATCH:
                this.formStatus.html("Wprowadzone imię jest niepoprawne");
                return false;
        }

        const surnameStatus = this.validator.isSurnameCorrect(this.rentItem.surname);
        switch (surnameStatus) {
            case Validator.Status.EMPTY:
                this.formStatus.html("Pole z nazwiskiem nie może być puste");
                return false;
            case Validator.Status.REGEX_MISMATCH:
                this.formStatus.html("Wprowadzone nazwisko jest niepoprawne");
                return false;
        }

        const phoneStatus = this.validator.isPhoneCorrect(this.rentItem.phone);
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
        console.log(selectedValue);
        if (selectedValue === undefined)
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