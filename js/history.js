import {fetchCarsData} from './data.js';

$(document).ready(async function () {
    localStorage.setItem("rentedCars", JSON.stringify([]));
    insertSampleDataToLocalStorage();
    insertSampleDataToLocalStorage();
    await createRentHistory();
});

function removeFromLocalStorage(index) {
    const rentedCars = JSON.parse(localStorage.getItem("rentedCars"));
    rentedCars.splice(index, 1);
    localStorage.setItem("rentedCars", JSON.stringify(rentedCars));
}

async function createRentHistory() {
    const carsData = await fetchCarsData();
    const rentedCars = JSON.parse(localStorage.getItem("rentedCars"));
    const idToStringMap = new Map();
    idToStringMap.set("address-delivery-pickup", "Dostawa pod adres");
    idToStringMap.set("self-pickup", "Osobisty");
    idToStringMap.set("tyres-insurance", "opony");
    idToStringMap.set("windows-insurance", "okna");
    idToStringMap.set("theft-insurance", "kradzież");
    let card = "";

    for (let i = 0; i < rentedCars.length; i++) {
        const rent = rentedCars[i];
        let insurance = "";
        rent.insurance.forEach(el => insurance += `${idToStringMap.get(el)}, `);
        insurance = insurance.slice(0, -2);
        if (insurance === "")
            insurance = "-";

        card += `<div class="col-xl-4 col-lg-6 col-sm-12 mb-4">`;
        card += `<div class="card h-100">`;
        card += `<img alt="" class="img-fluid card-img-top" src="cars/images/small/${carsData[rent.carName]["photo-path"]}">`;
        card += `<div class="card-body">`;
        card += `<h5>${carsData[rent.carName]["name"]}</h5>`;
        card += `<table class="table card-text">`;
        card += `<tr><td>Rozpoczęcie wynajmu</td><td>${rent.startDate}</td></tr>`;
        card += `<tr><td>Zakończenie wynajmu</td><td>${rent.endDate}</td></tr>`;
        card += `<tr><td>Dodatkowe ubezpieczenie</td><td>${insurance}</td></tr>`;
        card += `<tr><td>Odbiór pojazdu</td><td>${idToStringMap.get(rent.pickup)}</td></tr>`;
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
    $(".deleteBtn").each(function (index, obj) {
        obj.addEventListener("click", function () {
            if (window.confirm("Czy na pewno chcesz usunąć?")) {
                removeFromLocalStorage(index);
                createRentHistory();
            }
        });
    })
}

function insertSampleDataToLocalStorage() {
    let rentedCars = JSON.parse(localStorage.getItem("rentedCars"));
    let rent = {};
    let insurance = ["tyres-insurance", "windows-insurance", "theft-insurance"];
    rent.carName = "peugeot-308"
    rent.insurance = insurance;
    rent.pickup = "address-delivery-pickup";
    rent.startDate = "2021-08-10";
    rent.endDate = "2021-08-15";
    rent.name = "John";
    rent.surname = "Johnson";
    rent.phone = "123-456-789";
    rent.price = 600;
    rentedCars.push(rent);

    let rent1 = {};
    insurance = ["windows-insurance"];
    rent1.carName = "ford-focus"
    rent1.insurance = insurance;
    rent1.pickup = "self-pickup";
    rent1.startDate = "2021-08-10";
    rent1.endDate = "2021-08-15";
    rent1.name = "Katarzyna";
    rent1.surname = "Kozłowska";
    rent1.phone = "999-999-999";
    rent1.price = 1200;
    rentedCars.push(rent1);
    localStorage.setItem("rentedCars", JSON.stringify(rentedCars));
}