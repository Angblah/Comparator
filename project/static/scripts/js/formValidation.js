// Make sure the password meets requirements and other validation
// Length: 6 min 
$(function() {
    $('#registerPassword').on('focusout', function(e) {
        var registerPassword = $('#registerPassword').val();
        var passwordConfirm = $('#registerPasswordConfirm').val();
        
        if (registerPassword.length < 6) {
            setGroupInvalid("passwordField", "Password length must be greater than 6 characters.");
        } else {
            setGroupGood("passwordField");
        }
        checkNull("registerPassword", "passwordField");
        checkFormValid("registerForm", "registerButton");
    });
});

// Make sure the pass confirmation matches the password
$(function() {
    $('#registerPasswordConfirm').on('focusout', function(e) {
        var registerPassword = $('#registerPassword').val();
        var passwordConfirm = $('#registerPasswordConfirm').val();
        
        if (registerPassword !== passwordConfirm) {
            setGroupInvalid("passwordField", "Passwords do not match.");
            setGroupInvalid("confirmPassField");
        } else {
            if (registerPassword.length < 6) {
                setGroupInvalid("passwordField", "Password length must be at least 6 characters.");
                setGroupInvalid("confirmPassField");
            } else {
                setGroupGood("passwordField");
                setGroupGood("confirmPassField");
            }
        }
        checkNull("registerPassword", "passwordField");
        checkNull("registerPasswordConfirm", "confirmPassField");
        checkFormValid("registerForm", "registerButton");
    });
});

// Check username is alphanumeric and other validation for field
// Alpha-numeric With ._ Length: 2-25 (For PJ)
$(function() {
    $('#registerUsername').on('focusout', function(e) {
        var username = $('#registerUsername').val();
        var charRegex = new RegExp("^[A-Z0-9]*$", 'i');

        if (!charRegex.test(username)) {
            setGroupInvalid("usernameField", "Username can only contain alphanumeric characters.");
        } else if (username.length > 25 || username.length < 2) {
            setGroupInvalid("usernameField", "Username length must be between 2-25 characters.");
        } else {
            setGroupGood("usernameField");
        }
        checkNull("registerUsername", "usernameField");
        checkFormValid("registerForm", "registerButton");
    }); 
});

// Check for valid emails and other validation for field
$(function() {
    $('#registerEmail').on('focusout', function(e) {
        var email = $('#registerEmail').val();
        var emailRegex = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/, 'i');

        if (!emailRegex.test(email)) {
            setGroupInvalid("emailField", "Email has invalid formatting.");
        } else {
            setGroupGood("emailField");
        }
        checkNull("registerEmail", "emailField");
        checkFormValid("registerForm", "registerButton");
    }); 
});

// Check the fields before making a register call to database
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

// Clear the signup form when exiting modal
$(function() {
    $('#closeSignUp').on('click', function(e) {
        clearForm("registerForm", "registerButton");
    });
});


// Checks if input is null, and calls setGroupInvalid if so.
function checkNull(inputID, formGroup) {
    var value = $("#" + inputID).val();
    if (!value) {      
        setGroupInvalid(formGroup, "Field is empty.");
        return false;
    }
    return true;
}

// Does DOM modifications to form group to make valid
function setGroupGood(formGroup) {
    $('#' + formGroup + 'helpBlock').remove();
    $('#' + formGroup + 'icon').remove();

    $("#" + formGroup).append("<span class='glyphicon glyphicon-ok form-control-feedback' id='" + formGroup +
        "icon' aria-hidden='true'></span>");
    $("#" + formGroup).removeClass("has-error");
    $("#" + formGroup).addClass("has-success");
}

// Does DOM modifications to form group to make invalid, Error message optional
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

// Iterates through form groups to check if form is valid, sets submitButton to disabled
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

// Function to clear the form of indicators
function clearForm(form, submitButton) {
    $('#' + form + ' *').filter('.form-group').each(function(){
        $('#' + this.id + 'helpBlock').remove();
        $('#' + this.id + 'icon').remove();
        $("#" + this.id).removeClass("has-error")
        $("#" + this.id).removeClass("has-success")
    });

    $('#' + form + " #" + submitButton).removeAttr('disabled');
}