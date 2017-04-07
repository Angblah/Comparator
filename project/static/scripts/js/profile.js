 $( "#btnchange" ).click(function() {
$( "div.second" ).replaceWith( "<h2>New heading</h2>" );
})

// returns true if password
function validatePassword(password, confirm) {

    if (password != confirm) {
        return false;
    } else {
        return true;
    }
};

function showMessage(label, message) {
    $('#' + label).text(message);
    $('#' + label + 'Div').show();
}

$(function() {
    $('#newPassword').add('#confirmPassword').on('focusout', function() {
        if (validatePassword($('#newPassword').val(), $('#confirmPassword').val())) {
            $("#passwordErrorDiv").hide();
        } else {
            showMessage('passwordError', 'Passwords must match');
        }
    });
});

$(function() {
  $('button#submitButton').bind('click', function() {


    var newUsername = $('#newUsername').val();
    var newEmail = $('#newEmail').val();
    var newPassword = $('#newPassword').val();
    var confirmPassword = $('#confirmPassword').val();

    if (!validatePassword(newPassword, confirmPassword)) {
        showMessage('passwordError', 'Passwords must match');
        return false;
    } else {
        $("#passwordErrorDiv").hide();
    }

    // at least one field must be filled out
    if (!newUsername && !newEmail && !newPassword) {
        $("#overallErrorDiv").show();
        return false;
    } else {
        $("#overallErrorDiv").hide();
    }


    $.getJSON('/profile_form', {
        newUsername: newUsername,
        newEmail: newEmail,
        newPassword: newPassword
    }, function(data) {
        if (!data.error) {
            $("#successDiv").show();
        } else {
            $("#successDiv").hide();
        }
        if (data.username_error) {
            showMessage('usernameError', data.username_error);
        } else {
            $("#usernameErrorDiv").hide();
        }
        if (data.email_error) {
            showMessage("#emailError", data.email_error);
        } else {
            $("#emailErrorDiv").hide();
        }
    });
    return false;
  });
});