$(document).ready(function () {
    fetchCarsFromFile();
});

function fetchCarsFromFile() {
    fetch("http://localhost:63342/pai-project/cars/data/cars.json")
        .then(response => {
            if (response.status !== 200)
                return Promise.reject('Request failed');
            return response.json();
        })
        .then((data) => {
            createCarGallery(data)
            baguetteBox.run('.cars-gallery', {
                noScrollbars: true,
            });
        })
        .catch((error) => console.log(error));
}

function createCarGallery(cars) {
    let typeColorMap = new Map();
    typeColorMap.set("Luksusowe", "badge-dark");
    typeColorMap.set("Tanie", "badge-primary");
    typeColorMap.set("Rodzinne", "badge-warning text-white");
    typeColorMap.set("Sportowe", "badge-danger");
    typeColorMap.set("Elektryczne", "badge-success");
    typeColorMap.set("Małe", "badge-info");

    let data = "";
    for (const key of Object.keys(cars)) {
        const photoPath = cars[key]["photo-path"];
        const name = cars[key]["name"];
        const description = cars[key]["description"];
        const transmission = cars[key]["transmission"];
        const type = cars[key]["type"];

        data += `\n<!-- Gallery item -->
                <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
                    <div class="bg-white rounded shadow-sm">
                        <a class="lightbox" href="cars/images/medium/${photoPath}" data-caption="<div class='caption-text'>${name}</div>">
                            <img alt="${name}" class="img-fluid card-img-top"
                                 src="cars/images/small/${photoPath}">
                        </a>
                        <div class="p-4">
                            <h5><a class="text-dark" href="formularz.html?car=${key}">${name}</a></h5>
                            <p class="small text-muted mb-0">${description}</p>
                            <div class="d-flex align-items-center justify-content-between rounded-pill bg-light px-3 py-2 mt-4">
                                <p class="small mb-0">
                                    <i class="fa fa-picture-o mr-2"></i>
                                    <span class="font-weight-bold">${transmission}</span>
                                </p>
                                <div class="badge ${typeColorMap.get(type)} px-3 rounded-pill font-weight-normal">${type}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- End -->\n`;
    }
    $("#gallery").html(data);
}