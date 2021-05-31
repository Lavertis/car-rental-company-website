$(document).ready(function () {
    // Only for debug
    if (!localStorage.hasOwnProperty("rentedCars"))
        insertSampleDataToLocalStorage();
    else if (JSON.parse(localStorage.getItem("rentedCars")).length < 2)
        insertSampleDataToLocalStorage();
    // End only for debug

    new RentHistory();
});

function addDeleteButtonsCallbacks(rentHistory) {
    $(".deleteBtn").each(function (index, obj) {
        obj.addEventListener("click", function () {
            if (window.confirm("Czy na pewno chcesz usunąć?")) {
                rentHistory.removeFromLocalStorage(index);
                rentHistory.fetchCarsData();
            }
        });
    })
}

class RentHistory {
    constructor() {
        this.carsData = [];
        this.rentedCars = [];
        this.idToStringMap = new Map();
        this.initializeRentedCars();
        this.initializeIdToStringMap();
        this.fetchCarsData();
    }

    initializeRentedCars() {
        if (localStorage.hasOwnProperty("rentedCars"))
            this.rentedCars = JSON.parse(localStorage.getItem("rentedCars"));
    }

    initializeIdToStringMap() {
        this.idToStringMap.set("address-delivery-pickup", "Dostawa pod adres");
        this.idToStringMap.set("self-pickup", "Osobisty");
        this.idToStringMap.set("tyres-insurance", "opony");
        this.idToStringMap.set("windows-insurance", "okna");
        this.idToStringMap.set("theft-insurance", "kradzież");
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
                this.createRentHistory();
            })
            .catch((error) => console.log(error));
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
            card += `<tr><td>Numer telefonu</td><td>${rent.phone.replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3")}</td></tr>`;
            card += `<tr><td>Koszt</td><td>${rent.price} PLN</td></tr>`;
            card += `</table>`;
            card += `</div>`;
            card += `<div class="card-footer d-flex justify-content-between mx-2 bg-white">`;
            card += `<ul class="list-inline my-auto">`;

            for (let j = 0; j < rent.stars; j++)
                card += `<li class="list-inline-item m-0"><i class="fa fa-star text-razzmatazz" style="cursor: pointer;"></i></li>`;
            for (let j = rent.stars; j < 5; j++)
                card += `<li class="list-inline-item m-0"><i class="fa fa-star text-dark" style="cursor: pointer;"></i></li>`;

            card += `</ul>`;
            card += `<button class="btn btn-primary btn-warning text-white deleteBtn">Usuń</button>`;
            card += `</div></div></div>`;
        }

        $("#rent-history-cards").html(card);
        addDeleteButtonsCallbacks(this);
        addChangeStarRatingButtonsCallbacks(this);
    }

    changeStarRating(itemId, stars) {
        this.rentedCars[itemId].stars = stars;
        localStorage.setItem("rentedCars", JSON.stringify(this.rentedCars));
        this.createRentHistory();
    }
}

function addChangeStarRatingButtonsCallbacks(rentHistory) {
    const stars = $(".list-inline-item");
    stars.each(function (index) {
        $(this).on("click", () => rentHistory.changeStarRating(Math.floor(index / 5), index % 5 + 1))
    })
}

function insertSampleDataToLocalStorage() {
    let rentedCars = [];
    let rent1 = {
        "carName": "peugeot-308", "insurance": ["tyres-insurance", "windows-insurance", "theft-insurance"],
        "pickup": "address-delivery-pickup", "startDate": "2021-08-10", "endDate": "2021-08-15", "name": "John",
        "surname": "Johnson", "phone": "365985412", "price": 1200, "stars": 0
    };
    let rent2 = {
        "carName": "ford-focus", "insurance": [], "pickup": "self-pickup",
        "startDate": "2021-06-12", "endDate": "2021-06-14", "name": "Salome", "surname": "Simoes",
        "phone": "586321458", "price": 600, "stars": 0
    };
    rentedCars.push(rent1);
    rentedCars.push(rent2);
    localStorage.setItem("rentedCars", JSON.stringify(rentedCars));
}