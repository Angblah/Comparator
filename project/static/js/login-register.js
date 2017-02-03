$(function() {
  $('button#loginButton').bind('click', function() {
    $.getJSON('/login', {
      loginUsername: $('input[name="loginUsername"]').val(),
      loginPassword: $('input[name="loginPassword"]').val()
    }, function(data) {
    if (data.redirect) {
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
    if (data.redirect) {
        window.location.href = data.redirect;
    }
    if (data.nullEmail) {
        $("#nullEmailResult").text(data.nullEmail);
        $("#invalidCredRegisterNullEmailDiv").show();
    }
    if (data.nullUsername) {
        $("#nullUsernameResult").text(data.nullUsername);
        $("#invalidCredRegisterNullUsernameDiv").show();
    }
    if (data.nullPassword) {
        $("#nullPasswordResult").text(data.nullPassword);
        $("#invalidCredRegisterNullPasswordDiv").show();
    }
    if (data.nullPasswordConfirm) {
        $("#nullPasswordConfirmResult").text(data.nullPasswordConfirm);
        $("#invalidCredRegisterNullPasswordConfirmDiv").show();
    }
    if (data.errorEmail) {
        $("#emailResult").text(data.errorEmail);
        $("#invalidCredRegisterEmailDiv").show();
    }
    else if (data.errorUsername) {
        $("#usernameResult").text(data.errorUsername);
        $("#invalidCredRegisterUsernameDiv").show();
    }
    else if (data.errorEmailUsername) {
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
    if (data.error) {
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