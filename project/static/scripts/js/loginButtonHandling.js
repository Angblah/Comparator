$(function() {
  $('button#loginButton').bind('click', function() {
    $.getJSON('/login', {
      loginUsername: $('input[name="loginUsername"]').val(),
      loginPassword: $('input[name="loginPassword"]').val()
    }, function(data) {
    if (data.redirect) {
        window.location.href = "../myDashboard";
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