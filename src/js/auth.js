// функционал окна авторизации
function authScreen() {
  const logInput = document.querySelector('.login-input')
  const loginForm = document.querySelector('.login__form')
  const passInput = document.querySelector('.pass-input')
  const logOut = document.querySelector('.pin__logout')
  const subdomain = document.querySelector('.subdomain')
  const passView = document.querySelector('.login__password-control');
  const passViewIcon = passView.querySelector('.login__view')
  const passNoViewIcon = passView.querySelector('.login__view_no-view')
  const subdomainItemsNodeList = subdomain.querySelectorAll('.subdomain__item')
  const subdomainItems = Array.prototype.slice.call(subdomainItemsNodeList)

  logInput.value = '';
  passInput.value = '';

  // переключение видимости пароля
  passView.addEventListener('click', (e) => {
    e.preventDefault();
    if (passInput.getAttribute('type') === 'password') {
      passViewIcon.classList.add('active');
      passNoViewIcon.classList.remove('active');
      passInput.setAttribute('type', 'text');
    } else {
      passViewIcon.classList.remove('active');
      passNoViewIcon.classList.add('active');
      passInput.setAttribute('type', 'password');
    }
    return false;
  });

  // выбор страны
  subdomain.addEventListener('click', (e) => {
    subdomain.classList.toggle('subdomain_active');
    e.preventDefault()
    if(e.target.closest('.subdomain__item')) {
      subdomainItems.forEach((elem) => {
        elem.classList.remove('subdomain__item_active')
      })
      e.target.closest('.subdomain__item').classList.add('subdomain__item_active');

    }
  })

// запрос авторизации и запись в базу токена точки, округления, и валюты(не используется)
function auth(login, password, subdomain = 'ru', token = '') {
  let url = `${api}api/terminal/auth/?token=${token}&subdomain=${subdomain}&login=${login}&password=${password}`
  logger(`Адрес на авторизацию ${url}`)
  return new Promise(function(resolve, reject){
    ieFetch({
      method : 'POST',
      url: api + "api/terminal/auth/?"+`token=${token}&subdomain=${subdomain}&login=${login}&password=${password}`
    })
    .then((json) => {
      let res = JSON.parse(json);
      if (!res) reject('Пустой ответ в auth');
      // alert(JSON.stringify(res))
      if(res.type === 'error') {
        reject(res.data.msg)
        return;
      }
      if(res.type === 'success') {
        try {
        roundPrice = Number(res.data.round_price)
        tokenPoint = Number(res.data.token)
        tokenQR = res.data.sbp_token; //токен точки для оплаты QR кодом
        keyQR = res.data.sbp_token; // ключ точки для оплаты QR кодом
        dbMethods.updateDb('settings', {value: res.data.token}, {variable: 'tokenPoint'});
        dbMethods.updateDb('settings', {value: res.data.currency}, {variable: 'currency'}); //валюта
        dbMethods.updateDb('settings', {value: res.data.round_price}, {variable: 'roundPrice'});
        dbMethods.updateDb('settings', {value: res.data.sbp_token}, {variable: 'tokenQR'});
        dbMethods.updateDb('settings', {value: res.data.sbp_key}, {variable: 'keyQR'});
        resolve(res.data)
        } catch (error) {
          reject('Ошибка при обновлении  таблицы настроек')
        }
      }
    })
    .catch((e) => {
      reject('Сетевая ошибка в auth\n' + `${JSON.stringify(e)}`)

    })
  })
}

  // обработка формы
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(logInput.value && passInput.value) {
      const subdomainActive = document.querySelector('.subdomain__item_active');
      const subdomainValue = subdomainActive.querySelector('.btn').textContent.trim();
      dbMethods.updateDb('settings', {value: subdomainValue}, {variable: 'subdomain'});
      // авторизация
      preloader.preloader('body');
      auth(logInput.value, passInput.value, subdomainValue)
      .then((result) =>{
        setting.updateMenu(result.token, subdomainValue)
        getPointInfo(result.token, subdomainValue)
        .then((result) => {
          preloader.preloaderOff()
          initapp();
        })
        .catch((error) => {
          preloader.preloaderOff()
          logger('Ошибка в getPointInfo \n'+error);
        });

      })
      .catch((error) => {
        popup(error)
        preloader.preloaderOff()
        logger('Ошибка в auth \n'+error);
      });
      logInput.value = '';
      passInput.value = '';

      return true;
    }
    const errorMessage = el('div', `login__errorMessage`, `*Введите логин и пароль`)
    subdomain.appendChild(errorMessage)
  })

  // обработка кнопки сменить точку
  logOut.addEventListener('click', (e) => {
    e.preventDefault();
    let result = confirm('Вы уверены что хотите сменить точку?');
    if(result) {
      //закрыть смену
      closeWorkDayClick();
      dbMethods.updateDb('settings', {value: null}, {variable: 'tokenPoint'})
      initapp();
    }
  })
}
authScreen()
