"use strict";

var preloader = new function () {
  // стандартная заглушка, если обжект true, в селектор передается обьект
  this.preloader = function (selector, obj) {
    var newPreloader = el('div', 'preloader', el('div', 'lds-spinner', [el('div'), el('div'), el('div'), el('div'), el('div'), el('div'), el('div'), el('div'), el('div'), el('div'), el('div'), el('div')]));

    if (obj) {
      var _loaderItem = selector.querySelector(".preloader");

      if (_loaderItem) {
        selector.removeChild(_loaderItem);
        return;
      }

      selector.appendChild(newPreloader);
      return;
    }

    var root = document.querySelector(".".concat(selector));
    var loaderItem = root.querySelector(".preloader");

    if (loaderItem) {
      root.removeChild(loaderItem);
      return;
    }

    root.appendChild(newPreloader);
  };

  this.preloaderOff = function () {
    var preloaderArr = document.querySelectorAll('.preloader');

    try {
      if (preloaderArr.length > 0) {
        preloaderArr.forEach(function (e) {
          e.remove();
        });
      }
    } catch (error) {}
  }; // заглушка прии оплате через кюаркод


  this.preloaderQRcode = function () {
    var root = document.querySelector(".body");
    var newPreloader = el('div', 'preloader', [el('div', 'preloader__content preloader__content_qr', [el('h3', 'preloader__title', ['Ожидание оплаты...']), el('div', 'preloader__btn-group', [el('button', 'preloader__btn preloader__btn_qr btn preloader__btn_verify', 'Проверить'), el('button', 'preloader__btn preloader__btn_qr btn preloader__btn_cancel', 'Отмена')])])]); // обработка клика на кнопку "отмена" закрыть окно ожидания

    newPreloader.querySelector('.preloader__btn_cancel').addEventListener('click', function () {
      // закрытие операции оплаты QRcode
      ieFetch({
        method: 'POST',
        url: "https://newpayb2b.pro/api/s1/operation/cancel",
        headerApikey: "api-key",
        key: keyQR,
        headerUserToken: "user-token",
        token: tokenQR,
        headerType: "Content-Type",
        type: "application/json",
        send: ''
      }).then(function (json) {
        var ans = JSON.parse(json);

        if (ans.code === 1) {
          // оплата отменена
          preloader.preloaderOff();
        } else {
          popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u043E\u0442\u043C\u0435\u043D\u044B \u043E\u043F\u043B\u0430\u0442\u044B QR \u043A\u043E\u0434\u043E\u043C: ".concat(JSON.stringify(ans)));
          logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u043E\u0442\u043C\u0435\u043D\u044B \u043E\u043F\u043B\u0430\u0442\u044B QR \u043A\u043E\u0434\u043E\u043C: ".concat(JSON.stringify(ans)));
        }
      })["catch"](function (e) {
        logger("\u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u043D\u0430 \u0421\u041F\u0411: ".concat(JSON.stringify(data), " \n\n        \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438\u0448\u043B\u0430 ").concat(JSON.stringify(e)));
      });
    });
    var loaderItem = root.querySelector(".preloader");

    if (loaderItem) {
      root.removeChild(loaderItem);
      return;
    }

    root.appendChild(newPreloader);
  }; // заглушка при оплате через терминал сбербанка


  this.preloaderTerminal = function () {
    var root = document.querySelector(".body");
    var newPreloader = el('div', 'preloader', [el('div', 'preloader__content preloader__content_flex', [el('span', 'preloader__text preloader__text_terminal', ['Ожидание оплаты...']), el('span', 'preloader__text preloader__text_terminal', ['Не закрывайте кассу'])])]);
    var loaderItem = root.querySelector(".preloader");

    if (loaderItem) {
      root.removeChild(loaderItem);
      return;
    }

    root.appendChild(newPreloader);
  }; // Попап на сброса поля "клиент"


  this.cancelConfirmClient = function () {
    var root = document.querySelector(".body");
    var btnText = '';
    var activeBtn = null;

    if (ordersArr[0].accumClientPoints == 1) {
      btnText = 'Переключить на списание';
    } else if (ordersArr[0].accumClientPoints == 2) {
      btnText = 'Переключить на накопление';
    }

    if (btnText.length > 0) {
      activeBtn = el('button', 'preloader__btn btn preloader__btn_change', btnText);
      activeBtn.addEventListener('click', function () {
        if (ordersArr[0].accumClientPoints == 1) {
          ordersArr[0].accumClientPoints = 2;
          statusСashback = 2;
          var q = "UPDATE orders SET  accumClientPoints = 2 WHERE id = ".concat(idOrderGlobal);

          try {
            db.query(q);
          } catch (e) {
            db.conn.close();
            logger('Ошибка в cancelConfirmClient' + e.message);
          }

          update.orders();
        } else if (ordersArr[0].accumClientPoints == 2) {
          statusСashback = 1;
          ordersArr[0].accumClientPoints = 1;

          var _q = "UPDATE orders SET  accumClientPoints = 1 WHERE id = ".concat(idOrderGlobal);

          try {
            db.query(_q);
          } catch (e) {
            db.conn.close();
            logger('Ошибка в cancelConfirmClient' + e.message);
          }

          update.orders();
        }

        preloader.preloaderOff();
        orderCalc.renderReceipt();
      });
    }

    var newPreloader = el('div', 'preloader', [el('div', 'preloader__content preloader__content_flex', [el('span', 'preloader__text', ['Сбросить данные клиента?']), el('button', 'preloader__btn btn preloader__btn_true', 'Да'), el('button', 'preloader__btn btn preloader__btn_false', 'Нет'), activeBtn])]); // сброс клиента

    newPreloader.querySelector('.preloader__btn_true').addEventListener('click', function () {
      var clientWrap = document.querySelector('.header__card_client');
      var promocodeWrap = document.querySelector('.header__card_promocode');
      clientWrap.classList.remove('header__card_apply');
      clientWrap.classList.remove('client');
      clientWrap.classList.remove('client_discount');
      clientWrap.classList.remove('client_cashback');
      client = undefined;
      ordersArr[0].idClient = '';
      ordersArr[0].accumClientPoints = 0;
      ordersArr[0].clientPoints = 0;
      ordersArr[0].email = mailPoint;
      ordersArr[0].initiallyPoints = 0;
      saleObg = {}; // обнуление скидок в массиве товаров глобальном

      productArr.forEach(function (e) {
        e.sale = 1;
      });
      var q = "UPDATE orders SET idClient = '', accumClientPoints = 0, clientPoints = 0, initiallyPoints = 0, email = '".concat(mailPoint, "' WHERE id = ").concat(idOrderGlobal);

      try {
        db.query(q);
      } catch (error) {
        db.conn.close();
      }

      del.tempSale();

      if (!onlineSystem) {
        popup('Отсутствует связь с сервером');
        return;
      }

      preloader.preloaderOff();

      if (ordersArr[0].promo > 0 || ordersArr[0].certificate > 0) {
        preloader.preloader('body');
        keyboardClose();
        setting.globalVariables();
        var code = ordersArr[0].certificate > 0 ? ordersArr[0].certificate : ordersArr[0].promo;
        logger("\u0417\u0430\u043F\u0440\u043E\u0441 \u043F\u043E \u043F\u0440\u043E\u043C\u043E\u043A\u043E\u0434\u0443 tokenPoint ".concat(tokenPoint, " subdomain ").concat(subdomain, " code ").concat(code));
        checkPromo(tokenPoint, subdomain, code).then(function (e) {
          preloader.preloaderOff();

          if (e.hasOwnProperty('certificate')) {
            try {
              var _q2 = "UPDATE orders SET offreckoning = ".concat(Number(e.offreckoning), ", endPointsCert = ").concat(Number(e.offreckoning), ", certificate = ").concat(Number(e.certificate), ", recordedCertificate = 1 WHERE id = ").concat(idOrderGlobal);

              try {
                db.query(_q2);
                cert = e.certificate;
                balanceFinalCert = e.offreckoning;
                ordersArr[0].certificate = e.certificate;
                ordersArr[0].offreckoning = e.offreckoning;
                ordersArr[0].endPointsCert = e.offreckoning;
                promocodeWrap.classList.add('certificate');
              } catch (error) {
                try {
                  db.conn.close();
                } catch (error) {}

                logger('Ошибка в checkPromo' + error.message);
                throw error.message;
              }
            } catch (error) {
              popup('Ошибка при проверке сертификата \n' + error.message + '\n');
              logger('Ошибка при проверке сертификата \n' + error.message + '\n');
              reject('Ошибка при проверке сертификата');
            }

            if (!promocodeWrap.matches('.header__card_apply')) {
              promocodeWrap.classList.add('header__card_apply');
            }

            update.saleObg();
            orderCalc.renderReceipt();
            return;
          }

          try {
            db.query("UPDATE orders SET promo = '".concat(code, "' WHERE id = ").concat(idOrderGlobal));
            promotion_code = code; //промокод

            ordersArr[0].promo = promotion_code;
          } catch (error) {
            try {
              db.conn.close();
            } catch (error) {}
          }

          promocodeWrap.classList.add('promocode');
          promoValue.textContent = "".concat(e.percent, "%");

          if (!promocodeWrap.matches('.header__card_apply')) {
            promocodeWrap.classList.add('header__card_apply');
          }

          update.saleObg();
          orderCalc.renderReceipt();
        })["catch"](function (e) {
          preloader.preloaderOff();
          popup('Промокод не верный'); // alert(JSON.stringify(e))
        });
      }

      orderCalc.renderReceipt();
    });
    newPreloader.querySelector('.preloader__btn_false').addEventListener('click', function () {
      preloader.preloaderOff();
    });
    newPreloader.addEventListener('click', function (e) {
      if (!e.target.closest('.preloader__content')) {
        preloader.preloaderOff();
      }
    });
    var loaderItem = root.querySelector(".preloader");

    if (loaderItem) {
      root.removeChild(loaderItem);
      return;
    }

    root.appendChild(newPreloader);
  }; // Попап на сброса поля "клиент"


  this.cancelConfirmCashback = function () {
    var root = document.querySelector(".body");
    var newPreloader = el('div', 'preloader', [el('div', 'preloader__content preloader__content_flex', [el('span', 'preloader__text', ['Сбросить промокод/сертификат?']), el('button', 'preloader__btn btn preloader__btn_true', 'Да'), el('button', 'preloader__btn btn preloader__btn_false', 'Нет')])]); // обработчик клика на сброс промокода

    newPreloader.querySelector('.preloader__btn_true').addEventListener('click', function () {
      var clientWrap = document.querySelector('.header__card_client');
      var promocodeWrap = document.querySelector('.header__card_promocode'); // сбрасываем визуал

      promocodeWrap.classList.remove('header__card_apply');
      promocodeWrap.classList.remove('promocode');
      promocodeWrap.classList.remove('certificate'); // сбрасываем промокод

      ordersArr[0].promo = '0';
      promotion_code = '0';
      cert = '';
      balanceFinalCert = '';
      ordersArr[0].promo = '0';
      ordersArr[0].certificate = '0';
      ordersArr[0].offreckoning = '0';
      ordersArr[0].endPointsCert = '0'; // убираем его из базы данных

      var q = "UPDATE orders SET promo = '0', offreckoning = 0, endPointsCert = 0, certificate = 0  WHERE id = ".concat(idOrderGlobal);

      try {
        db.query(q);
      } catch (e) {
        db.conn.close();
        logger('Ошибка в cancelConfirmCashback' + e.message);
      } // удаляем все временные скидки


      try {
        q = "DELETE FROM discounts WHERE temp = 1";
        db.query(q);
      } catch (e) {
        try {
          db.conn.close();
        } catch (error) {}

        logger('Ошибка в cancelConfirmCashback' + e.message);
      } // обнуление скидок в массиве товаров глобальном


      productArr.forEach(function (e) {
        e.sale = 1;
      });

      if (ordersArr[0].accumClientPoints == 0 && ordersArr[0].idClient > 0) {
        client = undefined;

        var _q3 = "UPDATE orders SET idClient = '' WHERE id = ".concat(idOrderGlobal);

        try {
          db.query(_q3);
        } catch (error) {
          db.conn.close();
          logger('Ошибка в обнулении скидок' + e.message);
        }

        send.getInfoClient(ordersArr[0].idClient).then(function (e) {
          preloader.preloader('body'); // обновляем глобальный объект

          client = new Client(e.name, e.phone, e.level.type, e.level.percent, e.email, Number(e.balance));

          try {
            db.query("INSERT into discounts (time_from,time_to,weekdays,discount,temp,techcards_id) values (0,2400,0123456,".concat(Number(client.percent), ",1,-1)"));
          } catch (error) {
            db.conn.close();
            logger('Ошибка в getInfoClient' + error.message);
          }

          update.saleObg(); // обновляем глобальные скидки
          //записываем клиента

          var q = "UPDATE orders SET idClient = '".concat(e.phone, "',clientPoints = ").concat(Number(e.balance), ", initiallyPoints = ").concat(Number(e.balance), " WHERE id = ").concat(idOrderGlobal);

          if (client.email) {
            q = "UPDATE orders SET idClient = '".concat(e.phone, "',clientPoints = ").concat(Number(e.balance), ", initiallyPoints = ").concat(Number(e.balance), ", email = '").concat(e.email, "' WHERE id = ").concat(idOrderGlobal);
          }

          try {
            db.query(q);
          } catch (error) {
            db.conn.close();
            logger('Ошибка в getInfoClient' + error.message + '\n' + q);
          } //обновляем глобальный чек


          ordersArr[0].idClient = client.phone;
          ordersArr[0].accumClientPoints = 0;
          ordersArr[0].clientPoints = 0;

          if (client.email) {
            ordersArr[0].email = client.email;
          } //визуальное отображение


          clientWrap.classList.add('client');

          if (!clientWrap.matches('.header__card_apply')) {
            clientWrap.classList.add('header__card_apply');
          }

          clientWrap.classList.add('client_discount');
          var info = clientWrap.querySelector('.client__info');

          if (client.name.length > 0) {
            info.textContent = client.name;
          }

          var value = clientWrap.querySelector('.client__value_discount');
          value.textContent = "\u0421\u043A\u0438\u0434\u043A\u0430:  ".concat(100 - Number(client.percent) * 100, "%");
          value.display = 'flex'; // перерисовываем

          orderCalc.renderReceipt();
          document.querySelector('#promocode-input').value = '';
          preloader.preloaderOff();
        });
      }

      orderCalc.renderReceipt();
      document.querySelector('#promocode-input').value = '';
      preloader.preloaderOff();
    });
    newPreloader.querySelector('.preloader__btn_false').addEventListener('click', function () {
      preloader.preloaderOff();
    });
    newPreloader.addEventListener('click', function (e) {
      if (!e.target.closest('.preloader__content')) {
        preloader.preloaderOff();
      }
    });
    var loaderItem = root.querySelector(".preloader");

    if (loaderItem) {
      root.removeChild(loaderItem);
      return;
    }

    root.appendChild(newPreloader);
  };

  this.fiscalErrorNote = function (text) {
    var root = document.querySelector(".body");
    var newPreloader = el('div', 'preloader preloader_note', [el('div', 'preloader__content preloader__content_qr', [el('h3', 'preloader__title', [text]), el('div', 'preloader__btn-group preloader__btn-group_note', [el('button', 'preloader__btn preloader__btn_qr btn preloader__btn_verify', 'Прочитано')])])]);
    newPreloader.querySelector('.preloader__btn_verify').addEventListener('click', function () {
      var loaderItem = root.querySelector(".preloader_note");

      if (loaderItem) {
        root.removeChild(loaderItem);
      }
    });
    root.appendChild(newPreloader);
  };
}();