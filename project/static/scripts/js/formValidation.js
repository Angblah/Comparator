$(function() {
    $('#registerPassword').on('input', function(e) {
        var registerPassword = $('#registerPassword').val();
        var passwordConfirm = $('#registerPasswordConfirm').val();
        
        if (registerPassword !== passwordConfirm) {
            setGroupInvalid("passwordField", "Passwords do not match.");
            setGroupInvalid("confirmPassField");
        } else {
            setGroupGood("passwordField");
            setGroupGood("confirmPassField");
        }
        checkNull("registerPassword", "passwordField");
        checkNull("registerPasswordConfirm", "confirmPassField");
        checkFormValid("registerForm", "registerButton");
    });
});

$(function() {
    $('#registerPasswordConfirm').on('input', function(e) {
        var registerPassword = $('#registerPassword').val();
        var passwordConfirm = $('#registerPasswordConfirm').val();
        
        if (registerPassword !== passwordConfirm) {
            setGroupInvalid("passwordField", "Passwords do not match.");
            setGroupInvalid("confirmPassField");
        } else {
            setGroupGood("passwordField");
            setGroupGood("confirmPassField");
        }
        checkNull("registerPassword", "passwordField");
        checkNull("registerPasswordConfirm", "confirmPassField");
        checkFormValid("registerForm", "registerButton");
    });
});

$(function() {
    $('#registerUsername').on('input', function(e) {
        var username = $('#registerUsername').val();
        var charRegex = new RegExp(/^[a-zA-Z0-9]+[a-zA-Z0-9._]+[a-zA-Z0-9]$/);

        if (!charRegex.test(username)) {
            setGroupInvalid("usernameField", "Username has invalid characters.");
        } else {
            setGroupGood("usernameField");
        }
        checkNull("registerUsername", "usernameField");
        checkFormValid("registerForm", "registerButton");
    }); 
});

$(function() {
    $('#registerEmail').on('input', function(e) {
        var email = $('#registerEmail').val();
        var emailRegex = new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$');

        if (!emailRegex.test(email)) {
            setGroupInvalid("emailField", "Email has invalid formatting.");
        } else {
            setGroupGood("emailField");
        }
        checkNull("registerEmail", "emailField");
        checkFormValid("registerForm", "registerButton");
    }); 
});


//TODO: Check field validation before registering
$(function() {
    $('button#registerButton').bind('click', function() {
        
        checkNull("registerEmail", "emailField")
        checkNull("registerUsername", "usernameField")
        checkNull("registerPassword", "passwordField")
        checkNull("registerPasswordConfirm", "confirmPassField")
        if (!checkFormValid("registerForm", "registerButton")) {
            return false;
        }

        $.getJSON('/add_user', {
        registerEmail: $('input[name="registerEmail"]').val(),
        registerUsername: $('input[name="registerUsername"]').val(),
        registerPassword: $('input[name="registerPassword"]').val(),
        registerPasswordConfirm: $('input[name="registerPasswordConfirm"]').val()
        }, function(data) {
        if (data.redirect) {
            window.location.href = data.redirect;
        }
        if (data.errorEmail) {
            setGroupInvalid("emailField", data.errorEmail);
        }
        else if (data.errorUsername) {
            setGroupInvalid("usernameField", data.errorUsername);
        }
        else if (data.errorEmailUsername) {
            setGroupInvalid("emailField", data.errorEmailUsername);
        }
        });
        return false;
    });
});

function checkNull(inputID, formGroup) {
    var value = $("#" + inputID).val();
    if (!value) {      
        setGroupInvalid(formGroup, "Field is empty.");
        return false;
    }
    return true;
}

function setGroupGood(formGroup) {
    $('#' + formGroup + 'helpBlock').remove();
    $('#' + formGroup + 'icon').remove();

    $("#" + formGroup).append("<span class='glyphicon glyphicon-ok form-control-feedback' id='" + formGroup +
        "icon' aria-hidden='true'></span>");
    $("#" + formGroup).removeClass("has-error");
    $("#" + formGroup).addClass("has-success");
}

function setGroupInvalid(formGroup, errorMessage) {
    $('#' + formGroup + 'helpBlock').remove();
    $('#' + formGroup + 'icon').remove();

    $("#" + formGroup).append("<span class='glyphicon glyphicon-remove form-control-feedback' id='" + formGroup +
        "icon' aria-hidden='true'></span>");
    if (errorMessage) {
        $("#" + formGroup).append("<span id='" + formGroup + "helpBlock' class='help-block'>" + errorMessage + "</span>");
    }
    $("#" + formGroup).removeClass("has-success");
    $("#" + formGroup).addClass("has-error");
}

function checkFormValid(form, submitButton) {
    var valid = true;
    $('#' + form + ' *').filter('.form-group').each(function(){
        if ($("#" + this.id).hasClass("has-error")) {
            valid = false;
        }
    });

    if (!valid) {
        $('#' + form + " #" + submitButton).attr('disabled', 'disabled');
        return false;
    } else {
        $('#' + form + " #" + submitButton).removeAttr('disabled');
        return true;
    }
}