$(document).ready(async function () {
    new CarFleetGallery();
});

// noinspection DuplicatedCode
class CarFleetGallery {
    constructor() {
        this.carsData = [];
        this.typeToColorMap = new Map();
        this.#initializeTypeToColorMap();
        this.#fetchCarsData().then(null);
    }

    #initializeTypeToColorMap() {
        this.typeToColorMap.set("Luksusowe", "badge-dark");
        this.typeToColorMap.set("Tanie", "badge-primary");
        this.typeToColorMap.set("Rodzinne", "badge-warning text-white");
        this.typeToColorMap.set("Sportowe", "badge-danger");
        this.typeToColorMap.set("Elektryczne", "badge-success");
        this.typeToColorMap.set("Małe", "badge-info");
    }

    async #fetchCarsData() {
        await fetch("http://localhost:63342/pai-project/cars/data/cars.json")
            .then(response => {
                if (response.status !== 200)
                    return Promise.reject('Request failed');
                return response.json();
            })
            .then((json) => {
                this.carsData = json;
                this.createCarFleetGallery();
                baguetteBox.run('.cars-gallery', {
                    noScrollbars: true,
                });
            })
            .catch((error) => console.log(error));
    }

    // noinspection JSMethodCanBeStatic
    createCarFleetGallery() {
        let data = "";
        for (const key of Object.keys(this.carsData)) {
            const photoPath = this.carsData[key]["photo-path"];
            const name = this.carsData[key]["name"];
            const description = this.carsData[key]["description"];
            const transmission = this.carsData[key]["transmission"];
            const type = this.carsData[key]["type"];
            const badgeColor = this.typeToColorMap.get(type);

            data += `<div class="col-xl-3 col-lg-4 col-md-6 mb-4">`;
            data += `<div class="bg-white rounded shadow-sm">`;
            data += `<a class="lightbox" href="cars/images/medium/${photoPath}" data-caption="<div class='caption-text'>${name}</div>">`;
            data += `<img alt="${name}" class="img-fluid card-img-top" src="cars/images/small/${photoPath}"></a>`;
            data += `<div class="p-4">`;
            data += `<h5><a class="text-dark" href="formularz.html?car=${key}">${name}</a></h5>`;
            data += `<p class="small text-muted mb-0">${description}</p>`;
            data += `<div class="d-flex align-items-center justify-content-between rounded-pill bg-light px-3 py-2 mt-4">`;
            data += `<p class="small mb-0"><i class="fa fa-picture-o mr-2"></i>`;
            data += `<span class="font-weight-bold">${transmission}</span></p>`;
            data += `<div class="badge ${badgeColor} px-3 rounded-pill font-weight-normal">${type}</div>`;
            data += `</div></div></div></div>`;
        }

        $("#gallery").html(data);
    }
}