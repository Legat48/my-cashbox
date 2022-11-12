"use strict";

// функционал окна авторизации
function authScreen() {
  var logInput = document.querySelector('.login-input');
  var loginForm = document.querySelector('.login__form');
  var passInput = document.querySelector('.pass-input');
  var logOut = document.querySelector('.pin__logout');
  var subdomain = document.querySelector('.subdomain');
  var passView = document.querySelector('.login__password-control');
  var passViewIcon = passView.querySelector('.login__view');
  var passNoViewIcon = passView.querySelector('.login__view_no-view');
  var subdomainItemsNodeList = subdomain.querySelectorAll('.subdomain__item');
  var subdomainItems = Array.prototype.slice.call(subdomainItemsNodeList);
  logInput.value = '';
  passInput.value = ''; // переключение видимости пароля

  passView.addEventListener('click', function (e) {
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
  }); // выбор страны

  subdomain.addEventListener('click', function (e) {
    subdomain.classList.toggle('subdomain_active');
    e.preventDefault();

    if (e.target.closest('.subdomain__item')) {
      subdomainItems.forEach(function (elem) {
        elem.classList.remove('subdomain__item_active');
      });
      e.target.closest('.subdomain__item').classList.add('subdomain__item_active');
    }
  }); // запрос авторизации и запись в базу токена точки, округления, и валюты(не используется)

  function auth(login, password) {
    var subdomain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'ru';
    var token = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
    var url = "".concat(api, "api/terminal/auth/?token=").concat(token, "&subdomain=").concat(subdomain, "&login=").concat(login, "&password=").concat(password);
    logger("\u0410\u0434\u0440\u0435\u0441 \u043D\u0430 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E ".concat(url));
    return new Promise(function (resolve, reject) {
      ieFetch({
        method: 'POST',
        url: api + "api/terminal/auth/?" + "token=".concat(token, "&subdomain=").concat(subdomain, "&login=").concat(login, "&password=").concat(password)
      }).then(function (json) {
        var res = JSON.parse(json);
        if (!res) reject('Пустой ответ в auth'); // alert(JSON.stringify(res))

        if (res.type === 'error') {
          reject(res.data.msg);
          return;
        }

        if (res.type === 'success') {
          try {
            roundPrice = Number(res.data.round_price);
            tokenPoint = Number(res.data.token);
            tokenQR = res.data.sbp_token; //токен точки для оплаты QR кодом

            keyQR = res.data.sbp_token; // ключ точки для оплаты QR кодом

            dbMethods.updateDb('settings', {
              value: res.data.token
            }, {
              variable: 'tokenPoint'
            });
            dbMethods.updateDb('settings', {
              value: res.data.currency
            }, {
              variable: 'currency'
            }); //валюта

            dbMethods.updateDb('settings', {
              value: res.data.round_price
            }, {
              variable: 'roundPrice'
            });
            dbMethods.updateDb('settings', {
              value: res.data.sbp_token
            }, {
              variable: 'tokenQR'
            });
            dbMethods.updateDb('settings', {
              value: res.data.sbp_key
            }, {
              variable: 'keyQR'
            });
            resolve(res.data);
          } catch (error) {
            reject('Ошибка при обновлении  таблицы настроек');
          }
        }
      })["catch"](function (e) {
        reject('Сетевая ошибка в auth\n' + "".concat(JSON.stringify(e)));
      });
    });
  } // обработка формы


  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (logInput.value && passInput.value) {
      var subdomainActive = document.querySelector('.subdomain__item_active');
      var subdomainValue = subdomainActive.querySelector('.btn').textContent.trim();
      dbMethods.updateDb('settings', {
        value: subdomainValue
      }, {
        variable: 'subdomain'
      }); // авторизация

      preloader.preloader('body');
      auth(logInput.value, passInput.value, subdomainValue).then(function (result) {
        setting.updateMenu(result.token, subdomainValue);
        getPointInfo(result.token, subdomainValue).then(function (result) {
          preloader.preloaderOff();
          initapp();
        })["catch"](function (error) {
          preloader.preloaderOff();
          logger('Ошибка в getPointInfo \n' + error);
        });
      })["catch"](function (error) {
        popup(error);
        preloader.preloaderOff();
        logger('Ошибка в auth \n' + error);
      });
      logInput.value = '';
      passInput.value = '';
      return true;
    }

    var errorMessage = el('div', "login__errorMessage", "*\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043B\u043E\u0433\u0438\u043D \u0438 \u043F\u0430\u0440\u043E\u043B\u044C");
    subdomain.appendChild(errorMessage);
  }); // обработка кнопки сменить точку

  logOut.addEventListener('click', function (e) {
    e.preventDefault();
    var result = confirm('Вы уверены что хотите сменить точку?');

    if (result) {
      //закрыть смену
      closeWorkDayClick();
      dbMethods.updateDb('settings', {
        value: null
      }, {
        variable: 'tokenPoint'
      });
      initapp();
    }
  });
}

authScreen();