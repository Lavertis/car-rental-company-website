$(document).ready(function () {
    fetch("http://localhost:63342/pai-project/data/index.json")
        .then(response => {
            if (response.status !== 200)
                return Promise.reject('Request failed');
            return response.json();
        })
        .then((json) => {
            $('#info').html(json['info']);
            $('#news').html(json['news']);
            $('#history').html(json['history']);
        })
        .catch((error) => console.log(error));
});