"use strict";

function initapp() {
  var welcome = document.querySelector('.welcome');
  var login = document.querySelector('.login');
  var pin = document.querySelector('.pin');
  var cashbox = document.querySelector('.cashbox');
  var tokenPoint = dbMethods.getterDb('settings', {
    variable: 'tokenPoint'
  }, 'value')[0];
  var barista = dbMethods.getterDb('settings', {
    variable: 'barista'
  }, 'value')[0];

  if ("".concat(tokenPoint) === 'null') {
    cashbox.style.display = 'none';
    welcome.style.display = '-ms-flexbox';
    login.style.display = '-ms-flexbox';
    pin.style.display = 'none';
    setting.setDefauilSetting();
    return;
  }

  if ("".concat(barista) === 'null') {
    cashbox.style.display = 'none';
    welcome.style.display = '-ms-flexbox';
    login.style.display = 'none';
    pin.style.display = '-ms-flexbox';
    return;
  }

  cashbox.style.display = '-ms-grid';
  welcome.style.display = 'none';
  login.style.display = 'none';
  pin.style.display = 'none';
}

initapp();