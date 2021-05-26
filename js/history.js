$(document).ready(function () {
    // Only for debug
    if (!localStorage.hasOwnProperty("rentedCars"))
        insertSampleDataToLocalStorage();
    else if (localStorage.getItem("rentedCars").length < 3)
        insertSampleDataToLocalStorage();
    // End only for debug

    new RentHistory();
});

function addDeleteButtonsCallbacks(rentHistory) {
    $(".deleteBtn").each(function (index, obj) {
        obj.addEventListener("click", function () {
            if (window.confirm("Czy na pewno chcesz usunąć?")) {
                rentHistory.removeFromLocalStorage(index);
                rentHistory.fetchCarsData().then(null);
            }
        });
    })
}

class RentHistory {
    constructor() {
        this.carsData = [];
        this.rentedCars = this.#getRentedCarsFromLocalStorage();
        this.idToStringMap = new Map();
        this.#initializeIdToStringMap();
        this.fetchCarsData().then(null);
    }

    // noinspection JSMethodCanBeStatic
    #getRentedCarsFromLocalStorage() {
        if (localStorage.hasOwnProperty("rentedCars"))
            return JSON.parse(localStorage.getItem("rentedCars"));
        else
            return [];
    }

    #initializeIdToStringMap() {
        this.idToStringMap.set("address-delivery-pickup", "Dostawa pod adres");
        this.idToStringMap.set("self-pickup", "Osobisty");
        this.idToStringMap.set("tyres-insurance", "opony");
        this.idToStringMap.set("windows-insurance", "okna");
        this.idToStringMap.set("theft-insurance", "kradzież");
    }

    async fetchCarsData() {
        let cars = null;
        await fetch("http://localhost:63342/pai-project/cars/data/cars.json")
            .then(response => {
                if (response.status !== 200)
                    return Promise.reject('Request failed');
                return response.json();
            })
            .then((json) => {
                this.carsData = json;
                this.createRentHistory();
            })
            .catch((error) => console.log(error));
        return cars;
    }

    removeFromLocalStorage(index) {
        this.rentedCars.splice(index, 1);
        localStorage.setItem("rentedCars", JSON.stringify(this.rentedCars));
    }

    createRentHistory() {
        let card = "";

        for (let i = 0; i < this.rentedCars.length; i++) {
            const rent = this.rentedCars[i];
            let insurance = "";
            rent.insurance.forEach(el => insurance += `${this.idToStringMap.get(el)}, `);
            insurance = insurance.slice(0, -2);
            if (insurance === "")
                insurance = "-";

            card += `<div class="col-xl-4 col-md-6 col-sm-12 mb-4">`;
            card += `<div class="card h-100">`;
            card += `<img alt="" class="img-fluid card-img-top" src="cars/images/small/${this.carsData[rent.carName]["photo-path"]}">`;
            card += `<div class="card-body">`;
            card += `<h5>${this.carsData[rent.carName]["name"]}</h5>`;
            card += `<table class="table card-text">`;
            card += `<tr><td>Rozpoczęcie wynajmu</td><td>${rent.startDate}</td></tr>`;
            card += `<tr><td>Zakończenie wynajmu</td><td>${rent.endDate}</td></tr>`;
            card += `<tr><td>Dodatkowe ubezpieczenie</td><td>${insurance}</td></tr>`;
            card += `<tr><td>Odbiór pojazdu</td><td>${this.idToStringMap.get(rent.pickup)}</td></tr>`;
            card += `<tr><td>Imię</td><td>${rent.name}</td></tr>`;
            card += `<tr><td>Nazwisko</td><td>${rent.surname}</td></tr>`;
            card += `<tr><td>Numer telefonu</td><td>${rent.phone}</td></tr>`;
            card += `<tr><td>Koszt</td><td>${rent.price} PLN</td></tr>`;
            card += `</table>`;
            card += `</div>`;
            card += `<div class="card-footer d-flex justify-content-between mx-2 bg-white">`;
            card += `<a class="text-decoration-none my-auto" href="#!"><ul class="list-inline my-auto">`;

            // <li class="list-inline-item m-0"><i class="fa fa-star text-success"></i></li>
            // <li class="list-inline-item m-0"><i class="fa fa-star text-success"></i></li>
            // <li class="list-inline-item m-0"><i class="fa fa-star text-success"></i></li>
            // <li class="list-inline-item m-0"><i class="fa fa-star text-success"></i></li>
            // <li class="list-inline-item m-0"><i class="fa fa-star text-success"></i></li>

            card += "</a></ul>";
            card += "<button class='btn btn-primary btn-warning text-white deleteBtn' id='deleteBtn${i}'>Usuń</button>";
            card += "</div></div></div>";
        }

        $("#rent-history-cards").html(card);
        addDeleteButtonsCallbacks(this);
    }
}

function insertSampleDataToLocalStorage() {
    let rentedCars = [];
    let rent1 = {
        "carName": "peugeot-308", "insurance": ["tyres-insurance", "windows-insurance", "theft-insurance"],
        "pickup": "address-delivery-pickup", "startDate": "2021-08-10", "endDate": "2021-08-15", "name": "John",
        "surname": "Johnson", "phone": "123-456-789", "price": 600
    };
    let rent2 = {
        "carName": "ford-focus", "insurance": ["windows-insurance"], "pickup": "self-pickup",
        "startDate": "2021-08-10", "endDate": "2021-08-15", "name": "Katarzyna", "surname": "Kozłowska",
        "phone": "999-999-999", "price": 1200
    };
    rentedCars.push(rent1);
    rentedCars.push(rent2);
    rentedCars.push(rent1);
    rentedCars.push(rent2);
    localStorage.setItem("rentedCars", JSON.stringify(rentedCars));
}