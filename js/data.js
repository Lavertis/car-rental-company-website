export async function fetchCarsData() {
    let cars = null;
    await fetch("http://localhost:63342/pai-project/cars/data/cars.json")
        .then(response => {
            if (response.status !== 200)
                return Promise.reject('Request failed');
            return response.json();
        })
        .then((json) => {
            cars = json;
        })
        .catch((error) => console.log(error));
    return cars;
}