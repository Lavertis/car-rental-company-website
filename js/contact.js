$(document).ready(function () {
    const contactForm = new ContactForm();

    $("#btnSubmit").click(function () {
        contactForm.getValuesFromInputFields();
        const isFormValid = contactForm.validateForm();
        if (isFormValid)
            return contactForm.sendForm();
    });
});

class ContactForm {
    constructor() {
        this.form = $('#contact-form');
        this.formStatus = $('#form-status');
        this.validator = new Validator();
        this.name = "";
        this.email = "";
        this.subject = "";
        this.message = "";
    }

    getValuesFromInputFields() {
        this.name = $('#name').val();
        this.email = $('#email').val();
        this.subject = $('#subject').val();
        this.message = $('#message').val();
    }

    validateForm() {
        if (this.validator.isNameCorrect(this.name) === Validator.Status.EMPTY) {
            this.formStatus.html("Pole z imieniem nie może być puste");
            return false;
        }
        const isEmailCorrect = this.validator.isEmailCorrect(this.email);
        if (isEmailCorrect === Validator.Status.EMPTY) {
            this.formStatus.html("Pole z e-mailem nie może być puste");
            return false;
        } else if (isEmailCorrect === Validator.Status.REGEX_MISMATCH) {
            this.formStatus.html("Niepoprawny e-mail");
            return false;
        }
        if (this.validator.isSubjectCorrect(this.subject) === Validator.Status.EMPTY) {
            this.formStatus.html("Pole z tematem nie może być puste");
            return false;
        }
        if (this.validator.isMessageCorrect(this.message) === Validator.Status.EMPTY) {
            this.formStatus.html("Pole z wiadomością nie może być puste");
            return false;
        }
        this.formStatus.html("");
        return true;
    }

    sendForm() {
        const send = window.confirm("Czy na pewno chcesz wysłać wiadomość?");
        if (send) {
            const subject = $('#subject').val();
            const message = $('#message').val();
            window.location.href = `mailto:rafal.kuzmiczuk@pollub.edu.pl?subject=${subject}&body=${message}`;
            this.form.trigger('reset');
            $('form-control').val("");
            return true
        }
        return false;
    }
}

class Validator {
    static Status = {
        VALID: 1,
        EMPTY: 2,
        REGEX_MISMATCH: 3
    }

    constructor() {
        this.emailRegex = new RegExp(`^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$`);
    }

    isEmpty(text) {
        if (text === "")
            return Validator.Status.EMPTY;
        return Validator.Status.VALID;
    }

    isNameCorrect(name) {
        return this.isEmpty(name);
    }

    isEmailCorrect(email) {
        if (this.isEmpty(email) === Validator.Status.EMPTY)
            return Validator.Status.EMPTY;
        if (!this.emailRegex.test(email))
            return Validator.Status.REGEX_MISMATCH;
        return Validator.Status.VALID;
    }

    isSubjectCorrect(subject) {
        return this.isEmpty(subject);
    }

    isMessageCorrect(message) {
        return this.isEmpty(message);
    }
}