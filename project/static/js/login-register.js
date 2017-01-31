$(function() {
  $('button#loginButton').bind('click', function() {
    $.getJSON('/login', {
      loginUsername: $('input[name="loginUsername"]').val(),
      loginPassword: $('input[name="loginPassword"]').val()
    }, function(data) {
    if (data.redirect == "profile") {
        window.location.href = "../profile";
    }
    else {
        $("#result").text(data.error);
        $("#invalidCredLoginDiv").show();
    }
    });
    return false;
  });
});

$(function() {
  $('button#registerButton').bind('click', function() {
    $.getJSON('/add_user', {
      registerEmail: $('input[name="registerEmail"]').val(),
      registerUsername: $('input[name="registerUsername"]').val(),
      registerPassword: $('input[name="registerPassword"]').val(),
      registerPasswordConfirm: $('input[name="registerPasswordConfirm"]').val()
    }, function(data) {
    if (data.redirect == "profile") {
        window.location.href = data.redirect;
    }
    if (data.nullEmail == "An email is required.") {
        $("#nullEmailResult").text(data.nullEmail);
        $("#invalidCredRegisterNullEmailDiv").show();
    }
    if (data.nullUsername == "A username is required.") {
        $("#nullUsernameResult").text(data.nullUsername);
        $("#invalidCredRegisterNullUsernameDiv").show();
    }
    if (data.nullPassword == "A password is required.") {
        $("#nullPasswordResult").text(data.nullPassword);
        $("#invalidCredRegisterNullPasswordDiv").show();
    }
    if (data.nullPasswordConfirm == "Please confirm your password.") {
        $("#nullPasswordConfirmResult").text(data.nullPasswordConfirm);
        $("#invalidCredRegisterNullPasswordConfirmDiv").show();
    }
    if (data.errorEmail == "The email is already registered with an account.") {
        $("#emailResult").text(data.errorEmail);
        $("#invalidCredRegisterEmailDiv").show();
    }
    else if (data.errorUsername == "The username is already registered with an account.") {
        $("#usernameResult").text(data.errorUsername);
        $("#invalidCredRegisterUsernameDiv").show();
    }
    else if (data.errorEmailUsername == "The email and username are already registered with an account.") {
        $("#emailUsernameResult").text(data.errorEmailUsername);
        $("#invalidCredRegisterEmailUsernameDiv").show();
    }
    });
    return false;
  });
});

$(function() {
  $('button#forgotPasswordButton').bind('click', function() {
    $.getJSON('/reset_password', {
      emailOrUsername: $('input[name="emailOrUsername"]').val()
    }, function(data) {
    if (data.error == "We couldn't find an associated email address.") {
        $("#forgotPasswordResultError").text(data.error);
        $("#invalidCredForgotPasswordErrorDiv").show();
    }
    else {
        $("#forgotPasswordResultSuccess").text(data.success);
        $("#invalidCredForgotPasswordSuccessDiv").show();

    }
    });
    return false;
  });
});