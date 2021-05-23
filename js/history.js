import {fetchCarsData} from './data.js';

$(document).ready(async function () {
    localStorage.setItem("rentedCars", JSON.stringify([]));
    insertSampleDataToLocalStorage();
    await createRentHistory();
});

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

    for (const rent of rentedCars) {
        let insurance = "";
        rent.insurance.forEach(el => insurance += `${idToStringMap.get(el)}, `);
        if (insurance === "")
            insurance = "-";
        else
            insurance = insurance.slice(0, -2);

        card += `<div class="col-xl-4 col-lg-5 col-md-6 col-sm-12 mb-4 mx-auto">
            <div class="bg-white rounded shadow-sm">
                <img alt="" class="img-fluid card-img-top" src="cars/images/small/${carsData[rent.carName]["photo-path"]}">
                <div class="p-4">
                    <h5>${carsData[rent.carName]["name"]}</h5>
                    <table class="table small mx-0 px-0">
                        <tr>
                            <td class="px-1">Rozpoczęcie wynajmu</td>
                            <td >${rent.startDate}</td>
                        </tr>
                        <tr>
                            <td class="px-1">Zakończenie wynajmu</td>
                            <td>${rent.endDate}</td>
                        </tr>
                        <tr>
                            <td>Dodatkowe ubezpieczenie</td>
                            <td>${insurance}</td>
                        </tr>
                        <tr>
                            <td>Odbiór pojazdu</td>
                            <td>${idToStringMap.get(rent.pickup)}</td>
                        </tr>
                        <tr>
                            <td>Imię</td>
                            <td>${rent.name}</td>
                        </tr>
                        <tr>
                            <td>Nazwisko</td>
                            <td>${rent.surname}</td>
                        </tr>
                        <tr>
                            <td>Numer telefonu</td>
                            <td>${rent.phone}</td>
                        </tr>
                        <tr>
                            <td>Koszt</td>
                            <td>${rent.price} PLN</td>
                        </tr>
                    </table>
                    
                    <div class="d-flex align-items-center justify-content-between mx-2 h-100">
                    <ul class="list-inline my-auto">
                        <li class="list-inline-item m-0"><a href="#!"><i class="fa fa-star text-success"></i></a>
                        </li>
                        <li class="list-inline-item m-0"><a href="#!"><i class="fa fa-star text-success"></i></a>
                        </li>
                        <li class="list-inline-item m-0"><a href="#!"><i class="fa fa-star text-success"></i></a>
                        </li>
                        <li class="list-inline-item m-0"><a href="#!"><i class="fa fa-star text-success"></i></a>
                        </li>
                        <li class="list-inline-item m-0"><a href="#!"><i class="fa fa-star text-success"></i></a>
                        </li>
                    </ul>
                    
                    <button class="btn btn-primary" data-target="#confirmationModal" data-toggle="modal" id="deleteBtn"
                    type="button">Usuń</button>
                    </div>
                    
                    
                    <!-- The Modal -->
                    <div class="modal fade" id="deleteModal">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <!-- Modal Header -->
                                <div class="modal-header">
                                    <h4 class="modal-title">Potwierdzenie</h4>
                                    <button class="close" data-dismiss="modal" type="button">&times;</button>
                                </div>
                                <!-- Modal body -->
                                <div class="modal-body" id="modal-body"></div>
                                <!-- Modal footer -->
                                <div class="modal-footer">
                                    <button class="btn btn-danger" data-dismiss="modal" id="cancelBtn" type="button">
                                    Anuluj
                                    </button>
                                    <button class="btn btn-success" data-dismiss="modal" id="confirmBtn" type="button">
                                    Potwierdź
                                    </button>
                                </div>
                
                            </div>
                        </div>
                    </div>
                    <!-- The Modal -->
                    
                </div>
            </div>
        </div>`;
    }

    $("#rent-history-cards").html(card + card);
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