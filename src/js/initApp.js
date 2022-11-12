

function initapp() {
  const welcome = document.querySelector('.welcome')
  const login = document.querySelector('.login')
  const pin = document.querySelector('.pin')
  const cashbox = document.querySelector('.cashbox')

  let tokenPoint = dbMethods.getterDb('settings', {variable: 'tokenPoint'}, 'value')[0];
  let barista = dbMethods.getterDb('settings', {variable: 'barista'}, 'value')[0];
  if(`${tokenPoint}` === 'null') {
    cashbox.style.display = 'none'
    welcome.style.display = '-ms-flexbox'
    login.style.display = '-ms-flexbox'
    pin.style.display = 'none'
    setting.setDefauilSetting()
    return
  }

  if(`${barista}` === 'null') {
    cashbox.style.display = 'none'
    welcome.style.display = '-ms-flexbox'
    login.style.display = 'none'
    pin.style.display = '-ms-flexbox'
    return;
  }

  cashbox.style.display = '-ms-grid'
  welcome.style.display = 'none'
  login.style.display = 'none'
  pin.style.display = 'none'
}
initapp();
