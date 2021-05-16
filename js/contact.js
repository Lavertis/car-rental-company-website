function validateForm() {
    document.getElementById('form-status').setAttribute('style', 'color: red');

    const name = document.getElementById('name').value;
    if (name === "") {
        document.getElementById('form-status').innerHTML = "Pole z imieniem nie może być puste";
        return false;
    }

    const email = document.getElementById('email').value;
    if (email === "") {
        document.getElementById('form-status').innerHTML = "Pole z e-mailem nie może być puste";
        return false;
    } else {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(email)) {
            document.getElementById('form-status').innerHTML = "Niepoprawny e-mail";
            return false;
        }
    }

    const subject = document.getElementById('subject').value;
    if (subject === "") {
        document.getElementById('form-status').innerHTML = "Pole z tematem nie może być puste";
        return false;
    }

    const message = document.getElementById('message').value;
    if (message === "") {
        document.getElementById('form-status').innerHTML = "Pole z wiadomością nie może być puste";
        return false;
    }

    document.getElementById('form-status').innerHTML = "Wysłano";
    document.getElementById('form-status').setAttribute('style', 'color: green');
}