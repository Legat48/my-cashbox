"use strict";

// бОльшая часть обработчиков на кнопки
// обработчик ввода клиента
clientInput.addEventListener('input', function (e) {
  // валидация поля(не даем ввести больше 11 символов если не вписывали +)
  if (clientInput.value > 11 && clientInput.value[0] != '+') {
    clientInput.value = clientInput.value.slice(0, 11);
  } // валидация поля(не даем ввести больше 12 символов если с +)


  if (clientInput.value > 12 && clientInput.value[0] == '+') {
    clientInput.value = clientInput.value.slice(0, 12);
  }
}); // обработчик клика клиента

clientBtn.addEventListener('click', function (e) {
  var search = clientInput.value; // валидация ввода(что бы всегда было +7 в начале)

  if (search[0] === '9' && search.length == 10) {
    search = '+7' + search.slice(0);
  }

  if (search[0] === '8' && search.length == 11) {
    search = '+7' + search.slice(1);
  } // если ввод больше 5(от 6 начинается QR код)


  if (search.length > 5) {
    preloader.preloader('body');
    keyboardClose();
    cashbackWrap.classList.remove('client__cashback_active');
    cardValue.classList.remove('client__value_write-off');
    cardValue.classList.remove('client__value_accumulate');
    btnWriteOff.classList.remove('imperfection');
    setting.globalVariables(); // отправляем запрос в базу данных по клиенту

    send.getInfoClient(search).then(function (e) {
      preloader.preloader('body'); // обновляем глобальный объект

      client = new Client(e.name, e.phone, e.level.type, e.level.percent, e.email, Number(e.balance));

      if (client.type === 'discount') {
        // если клиент скидочный
        // создаем новую скидку в таблице
        db.query("INSERT into discounts (time_from,time_to,weekdays,discount,temp,techcards_id) values (0,2400,'0123456',".concat(Number(client.percent), ",1,-1)"));
        update.saleObg(); // обновляем глобальные скидки
        //записываем клиента

        var q = "UPDATE orders SET idClient = '".concat(e.phone, "',clientPoints = ").concat(Number(e.balance), ", initiallyPoints = ").concat(Number(e.balance), ", nameClient = '").concat(client.name, "' WHERE id = ").concat(idOrderGlobal);

        if (client.email) {
          q = "UPDATE orders SET idClient = '".concat(e.phone, "',clientPoints = ").concat(Number(e.balance), ", initiallyPoints = ").concat(Number(e.balance), ", email = '").concat(e.email, "', nameClient = '").concat(client.name, "' WHERE id = ").concat(idOrderGlobal);
        }

        try {
          db.query(q);
        } catch (error) {
          db.conn.close();
          logger('Ошибка в getInfoClient' + error.message);
        } //обновляем глобальный чек


        ordersArr[0].idClient = client.phone;
        ordersArr[0].accumClientPoints = 0;
        ordersArr[0].clientPoints = 0;
        ordersArr[0].nameClient = client.name;

        if (client.email) {
          ordersArr[0].email = client.email;
        } //визуальное отображение


        clientWrap.classList.add('client');

        if (!clientWrap.matches('.header__card_apply')) {
          clientWrap.classList.add('header__card_apply');
        }

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
      } // обработка клиента с кэшбэком


      if (client.type === 'cashback') {
        var btnClientArr = document.querySelectorAll('.client__btn');
        btnClientArr.forEach(function (j) {
          j.style.display = 'block';
        });
        clientWrap.classList.add('client');

        if (!clientWrap.matches('.header__card_apply')) {
          clientWrap.classList.add('header__card_apply');
        }

        clientWrap.classList.add('client_cashback');

        var _info = clientWrap.querySelector('.client__info');

        if (client.name.length > 0) {
          _info.textContent = client.name;
        }

        _info.style.display = 'none'; // приравнивание глобальной переменной к полученным данным

        balanceFinal = client.balance;

        var _value = clientWrap.querySelector('.client__value');

        _value.textContent = "\u0411\u0430\u043B\u043B\u043E\u0432:  ".concat(client.balance);
        btnClientArr.forEach(function (j) {
          // обработка кликов на кнопки
          j.addEventListener('click', function (e) {
            if (e.target.id === 'client-btn-accumulate') {
              statusСashback = 1;
              globalCashback = Math.floor(100 - Number(client.percent) * 100) / 100;

              var _q = "UPDATE orders SET idClient = '".concat(client.phone, "',globalCashback = ").concat(Number(globalCashback), ",clientPoints = ").concat(Number(client.balance), ", initiallyPoints = ").concat(Number(client.balance), ", accumClientPoints = 1, nameClient = '").concat(client.name, "' WHERE id = ").concat(idOrderGlobal);

              if (client.email) {
                _q = "UPDATE orders SET idClient = '".concat(client.phone, "',globalCashback = ").concat(Number(globalCashback), ",clientPoints = ").concat(Number(client.balance), ", initiallyPoints = ").concat(Number(client.balance), ", accumClientPoints = 1 ,email = '").concat(client.email, "', nameClient = '").concat(client.name, "' WHERE id = ").concat(idOrderGlobal);
              }

              try {
                db.query(_q);
              } catch (e) {
                db.conn.close();
                logger('Ошибка в getInfoClient' + e.message);
              }

              ordersArr[0].idClient = client.phone;
              ordersArr[0].accumClientPoints = 1;
              ordersArr[0].clientPoints = Number(client.balance);
              ordersArr[0].nameClient = client.name;

              if (client.email) {
                ordersArr[0].email = client.email;
              }
            } else {
              statusСashback = 2;

              var _q2 = "UPDATE orders SET idClient = '".concat(client.phone, "',clientPoints = ").concat(Number(client.balance), ", initiallyPoints = ").concat(Number(client.balance), ", accumClientPoints = 2, nameClient = '").concat(client.name, "' WHERE id = ").concat(idOrderGlobal);

              if (client.email) {
                _q2 = "UPDATE orders SET idClient = '".concat(client.phone, "',clientPoints = ").concat(Number(client.balance), ", initiallyPoints = ").concat(Number(client.balance), ", accumClientPoints = 2, email = '").concat(client.email, "', nameClient = '").concat(client.name, "' WHERE id = ").concat(idOrderGlobal);
              }

              try {
                db.query(_q2);
              } catch (e) {
                db.conn.close();
                logger('Ошибка в getInfoClient' + e.message);
              }

              ordersArr[0].idClient = client.phone;
              ordersArr[0].accumClientPoints = 2;
              ordersArr[0].clientPoints = Number(client.balance);
              ordersArr[0].nameClient = client.name;

              if (client.email) {
                ordersArr[0].email = client.email;
              }
            }

            btnClientArr.forEach(function (j) {
              j.style.display = 'none';
            });
            _info.style.display = 'flex';
            cashbackWrap.classList.add('client__cashback_active'); // добавление прелоадера с отменой

            orderCalc.renderReceipt();
          });
        });
      }
    });
  }
}); // сброс клиента

clientWrap.addEventListener('click', function (e) {
  e.preventDefault();

  if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
    if (clientWrap.matches('.header__card_apply') && !e.target.closest('#client-btn-accumulate') && !e.target.closest('#client-btn-write-off')) {
      preloader.cancelConfirmClient();
    }
  } else {
    popup('Сбросить клиента в оплаченном чеке невозможно');
  }
}); // сброс промокода

promocodeWrap.addEventListener('click', function (e) {
  e.preventDefault();

  if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
    if (promocodeWrap.matches('.header__card_apply')) {
      preloader.cancelConfirmCashback();
    }
  } else {
    popup('Сбросить промокод в оплаченном чеке невозможно');
  }
}); // ввод промокода/сертификата

promocodeBtn.addEventListener('click', function (e) {
  if (promocodeInput.value > 0) {
    preloader.preloader('body');
    keyboardClose();
    setting.globalVariables();
    var code = promocodeInput.value;
    logger("\u0417\u0430\u043F\u0440\u043E\u0441 \u043F\u043E \u043F\u0440\u043E\u043C\u043E\u043A\u043E\u0434\u0443 tokenPoint ".concat(tokenPoint, " subdomain ").concat(subdomain, " code ").concat(code));
    checkPromo(tokenPoint, subdomain, code).then(function (e) {
      preloader.preloaderOff();

      if (e.hasOwnProperty('certificate')) {
        try {
          var q = "UPDATE orders SET offreckoning = ".concat(Number(e.offreckoning), ", endPointsCert = ").concat(Number(e.offreckoning), ", certificate = ").concat(Number(e.certificate), ", recordedCertificate = 1 WHERE id = ").concat(idOrderGlobal);

          try {
            db.query(q);
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
            throw 'Ошибка в checkProm';
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

      orderCalc.renderReceipt();
    })["catch"](function (e) {
      preloader.preloaderOff();
      popup('Промокод не верный');
    });
  }
}); // сверка итогов

btnBankReconciliation.addEventListener('click', function (e) {
  if (useTerminal) {
    sbbank.reconciliation();
  }
}); // оплата безналом

btnCashNon.addEventListener('click', function () {
  logger("\u043D\u0430\u0436\u0430\u043B\u0438 \u043A\u043D\u043E\u043F\u043A\u0443 \u043E\u043F\u043B\u0430\u0442\u044B \u0431\u0435\u0437\u043D\u0430\u043B\u043E\u043C  \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 id ".concat(idOrderGlobal, " \u0441\u0442\u0430\u0442\u0443\u0441 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0430 ").concat(useTerminal, " \u0441\u0442\u0430\u0442\u0443\u0441 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u0438\u043A\u0430 ").concat(useAtol));

  if (productArr.length > 0 && !btnQRcode.classList.contains('ready-payment')) {
    // если товары есть в чете
    if (!btnCashNon.classList.contains('ready-payment') && !(ordersArr[0].chtype == 1 && ordersArr[0].status == 1)) {
      if (entry.productArrFixation(ordersArr[0])) {
        ordersArr[0].chtype = 1; // значение для атола

        if (useTerminal) {
          send.cashlessTerminal(); //отправляем на терминал
          // делаем отправку на терминал (остальный вызов функций находится там)
        } else if (useAtol && !troubleAtol) {
          // если используется атол
          if (devkkm.openOrder(ordersArr[0], productArr)) {
            if (entry.ordersFixation(ordersArr[0], 2)) {
              // фиксируем чек\
              devkkm.printOrder(ordersArr[0], productArr);
              del.tempSale(); // чистим скидки

              idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

              update.idOrder(); // вызов нового чека
            } else {
              popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              troubleAtolCounter += 1;

              if (troubleAtolCounter === 2) {
                devkkm.init();
              }

              if (troubleAtolCounter === 3) {
                btnCashNon.classList.add('trouble');
              }

              if (troubleAtolCounter > 3) {
                troubleAtol = 1;
                document.querySelector('#trouble-atol-toggle').checked = true;
                telegramNote('Аварийный режим атола включён');
                dbMethods.updateDb('settings', {
                  value: 1
                }, {
                  variable: 'troubleAtol'
                });
                popup('Перевод кассы в режим аварийной работы фискального регистратора');
                postman.atolOrder();
                troubleAtolCounter = 0;

                if (entry.ordersFixation(ordersArr[0], 1)) {
                  // фиксируем чек\
                  del.tempSale(); // чистим скидки

                  idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

                  update.idOrder(); // вызов нового чека
                } else {
                  popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                  logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                }

                ;
              }

              ;
            }
          } else {
            popup("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
            logger("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
            troubleAtolCounter += 1;

            if (troubleAtolCounter === 2) {
              devkkm.init();
            }

            if (troubleAtolCounter === 3) {
              btnCashNon.classList.add('trouble');
            }

            if (troubleAtolCounter > 3) {
              troubleAtol = 1;
              document.querySelector('#trouble-atol-toggle').checked = true;
              telegramNote('Аварийный режим атола включён');
              dbMethods.updateDb('settings', {
                value: 1
              }, {
                variable: 'troubleAtol'
              });
              popup('Перевод кассы в режим аварийной работы фискального регистратора');
              postman.atolOrder();
              troubleAtolCounter = 0;

              if (entry.ordersFixation(ordersArr[0], 1)) {
                // фиксируем чек\
                del.tempSale(); // чистим скидки

                idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

                update.idOrder(); // вызов нового чека
              } else {
                popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              }

              ;
            }

            ;
          }
        } else if (useAtol && troubleAtol) {
          if (entry.ordersFixation(ordersArr[0], 1)) {
            // фиксируем чек\
            del.tempSale(); // чистим скидки

            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

            update.idOrder(); // вызов нового чека
          } else {
            popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          }
        } else {
          if (entry.ordersFixation(ordersArr[0], 2)) {
            // фиксируем чек\
            del.tempSale(); // чистим скидки

            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

            update.idOrder(); // вызов нового чека
          } else {
            popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          }
        }
      } else {
        popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u0447\u0435\u043A\u0435 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443"));
        logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u0447\u0435\u043A\u0435 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443"));
      }
    } else if (btnCashNon.classList.contains('ready-payment')) {
      if (entry.ordersFixation(ordersArr[0], 1)) {
        if (useAtol && !troubleAtol) {
          // если используется атол
          if (devkkm.openOrder(ordersArr[0], productArr)) {
            if (entry.ordersFixation(ordersArr[0], 2)) {
              // фиксируем чек\
              devkkm.printOrder(ordersArr[0], productArr);
              del.tempSale(); // чистим скидки

              idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

              update.idOrder(); // вызов нового чека
            } else {
              popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            }
          } else {
            popup("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
            logger("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
            troubleAtolCounter += 1;

            if (troubleAtolCounter === 2) {
              devkkm.init();
            }

            if (troubleAtolCounter === 3) {
              btnCashNon.classList.add('trouble');
            }

            if (troubleAtolCounter > 4) {
              troubleAtol = 1;
              document.querySelector('#trouble-atol-toggle').checked = true;
              telegramNote('Аварийный режим атола включён');
              dbMethods.updateDb('settings', {
                value: 1
              }, {
                variable: 'troubleAtol'
              });
              popup('Перевод кассы в режим аварийной работы фискального регистратора');
              postman.atolOrder();
              troubleAtolCounter = 0;

              if (entry.ordersFixation(ordersArr[0], 1)) {
                // фиксируем чек\
                del.tempSale(); // чистим скидки

                idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

                update.idOrder(); // вызов нового чека
              } else {
                popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              }

              ;
            }

            ;
          }
        } else if (useAtol && troubleAtol) {
          del.tempSale(); // чистим скидки

          idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

          update.idOrder(); // вызов нового чека
        } else {
          if (entry.ordersFixation(ordersArr[0], 2)) {
            // фиксируем чек\
            del.tempSale(); // чистим скидки

            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

            update.idOrder(); // вызов нового чека
          } else {
            popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          }
        }
      } else {
        popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
        logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(ordersArr[0]), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(productArr)));
      }
    }
  } else if (btnQRcode.classList.contains('ready-payment')) {
    popup('чек оплачен QR кодом');
  }
}); // оплата QRcod

btnQRcode.addEventListener('click', function () {
  logger("\u043D\u0430\u0436\u0430\u043B\u0438 \u043A\u043D\u043E\u043F\u043A\u0443 \u043E\u043F\u043B\u0430\u0442\u044B qr \u043A\u043E\u0434\u043E\u043C \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 id ".concat(idOrderGlobal, " \u0441\u0442\u0430\u0442\u0443\u0441 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0430 ").concat(useTerminal, " \u0441\u0442\u0430\u0442\u0443\u0441 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u0438\u043A\u0430 ").concat(useAtol));

  if (productArr.length > 0 && useQRcode && !btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
    // если товары есть в чеке
    if (entry.productArrFixation(ordersArr[0])) {
      send.cashlessQRcode(); //отправляем на оплату qr кодом
    } // фиксируем товары в базе данных

  } else if (btnQRcode.classList.contains('ready-payment')) {
    if (entry.ordersFixation(ordersArr[0], 1)) {
      if (useAtol === 1 && !troubleAtol) {
        // если используется атол
        if (devkkm.openOrder(ordersArr[0], productArr)) {
          if (entry.ordersFixation(ordersArr[0], 2)) {
            // фиксируем чек\
            devkkm.printOrder(ordersArr[0], productArr);
            del.tempSale(); // чистим скидки

            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

            update.idOrder(); // вызов нового чека
          } else {
            popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          }
        } else {
          popup("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
          logger("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
          troubleAtolCounter += 1;

          if (troubleAtolCounter === 2) {
            devkkm.init();
          }

          if (troubleAtolCounter === 3) {
            btnQRcode.classList.add('trouble');
          }

          if (troubleAtolCounter > 3) {
            troubleAtol = 1;
            document.querySelector('#trouble-atol-toggle').checked = true;
            telegramNote('Аварийный режим атола включён');
            dbMethods.updateDb('settings', {
              value: 1
            }, {
              variable: 'troubleAtol'
            });
            popup('Перевод кассы в режим аварийной работы фискального регистратора');
            postman.atolOrder();
            troubleAtolCounter = 0;

            if (entry.ordersFixation(ordersArr[0], 1)) {
              // фиксируем чек\
              del.tempSale(); // чистим скидки

              idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

              update.idOrder(); // вызов нового чека
            } else {
              popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            }
          }
        }
      } else if (useAtol === 1 && troubleAtol) {
        del.tempSale(); // чистим скидки

        idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

        update.idOrder(); // вызов нового чека
      } else {
        if (entry.ordersFixation(ordersArr[0], 2)) {
          // фиксируем чек\
          del.tempSale(); // чистим скидки

          idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

          update.idOrder(); // вызов нового чека
        } else {
          popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
        }
      }
    } else {
      popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
      logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(ordersArr[0]), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(productArr)));
    }
  } else if (btnCashNon.classList.contains('ready-payment')) {
    popup('чек оплачен безналичными');
  }

  ;
}); // оплата налом

btnCash.addEventListener('click', function () {
  interfaceApp.focusReset();
  logger("\u043D\u0430\u0436\u0430\u043B\u0438 \u043A\u043D\u043E\u043F\u043A\u0443 \u043E\u043F\u043B\u0430\u0442\u044B \u043D\u0430\u043B\u043E\u043C \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 id ".concat(idOrderGlobal, " \u0441\u0442\u0430\u0442\u0443\u0441 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0430 ").concat(useTerminal, " \u0441\u0442\u0430\u0442\u0443\u0441 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u0438\u043A\u0430 ").concat(useAtol));

  if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment') && productArr.length > 0) {
    ordersArr[0].chtype = 0;
    ordersArr[0].status = 1;

    if (btnCash.classList.contains('ready-payment')) {
      if (entry.productArrFixation(ordersArr[0])) {
        if (useAtol === 1 && !troubleAtol) {
          // если используется атол
          if (devkkm.openOrder(ordersArr[0], productArr)) {
            if (entry.ordersFixation(ordersArr[0], 2)) {
              // фиксируем чек\
              devkkm.printOrder(ordersArr[0], productArr);
              del.tempSale(); // чистим скидки

              idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

              update.idOrder(); // вызов нового чека
            } else {
              popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            }
          } else {
            popup("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
            logger("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
            troubleAtolCounter += 1;

            if (troubleAtolCounter === 2) {
              devkkm.init();
            }

            if (troubleAtolCounter === 3) {
              btnCash.classList.add('trouble');
            }

            if (troubleAtolCounter > 3) {
              troubleAtol = 1;
              document.querySelector('#trouble-atol-toggle').checked = true;
              telegramNote('Аварийный режим атола включён');
              dbMethods.updateDb('settings', {
                value: 1
              }, {
                variable: 'troubleAtol'
              });
              popup('Перевод кассы в режим аварийной работы фискального регистратора');
              postman.atolOrder();
              troubleAtolCounter = 0;

              if (entry.ordersFixation(ordersArr[0], 1)) {
                // фиксируем чек\
                del.tempSale(); // чистим скидки

                idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

                update.idOrder(); // вызов нового чека
              } else {
                popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
              }

              ;
            }
          }
        } else if (useAtol === 1 && troubleAtol) {
          if (entry.ordersFixation(ordersArr[0], 1)) {
            // фиксируем чек\
            del.tempSale(); // чистим скидки

            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

            update.idOrder(); // вызов нового чека
          } else {
            popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          }
        } else {
          if (entry.ordersFixation(ordersArr[0], 2)) {
            // фиксируем чек\
            del.tempSale(); // чистим скидки

            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

            update.idOrder(); // вызов нового чека
          } else {
            popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          }
        }
      } else {
        popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u0447\u0435\u043A\u0435 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443"));
        logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u0447\u0435\u043A\u0435 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C, \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443"));
      }
    }
  } else if (btnCashNon.classList.contains('ready-payment')) {
    popup('Товар оплачен безналом');
  } else if (btnQRcode.classList.contains('ready-payment')) {
    popup('Товар оплачен безналом');
  }
}); //X отчет

btnReportX.addEventListener('click', function () {
  if (useAtol === 1) {
    // если используется атол
    try {
      devkkm.printWorcdayInfo();
      devkkm.ReportX();
    } catch (error) {
      popup(error.message);

      try {
        devkkm.init();
      } catch (error) {}
    }
  }
}); //печать последнего чека

btnLastOrder.addEventListener('click', function () {
  if (useAtol === 1) {
    // если используется атол
    try {
      devkkm.lastOrder();
    } catch (error) {
      popup(error.message);

      try {
        devkkm.init();
      } catch (error) {}
    }
  }
}); // обновление меню

btnUpdate.addEventListener('click', function () {
  preloader.preloader('body');

  try {
    setting.updateMenu(tokenPoint, subdomain);
  } catch (error) {
    popup('Ошибка при обновлении меню');

    try {
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
      menuApp.renderList('category', menuApp.load('menuDb', null));
      preloader.preloaderOff();
    } catch (error) {
      preloader.preloaderOff();
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u043C\u0435\u043D\u044E + ".concat(error.message));
    }
  }
}); // обновление меню

reloadMenu.addEventListener('click', function () {
  preloader.preloader('body');

  try {
    setting.updateMenu(tokenPoint, subdomain);
  } catch (error) {
    popup('Ошибка при обновлении меню');

    try {
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
      menuApp.renderList('category', menuApp.load('menuDb', null));
      preloader.preloaderOff();
    } catch (error) {
      preloader.preloaderOff();
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0438 \u043C\u0435\u043D\u044E + ".concat(error.message));
    }
  }
}); // Очистить чек

clearOrderBtn.addEventListener('click', function () {
  if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
    del.order();
  } else {
    popup('очистить оплаченный чек невозможно');
  }
});
var closeWorkDayBtn = document.querySelector('#menu-btn-exit');
closeWorkDayBtn.addEventListener('click', function () {
  if (useChecklist) {
    checklist.render(2, true);
  }

  closeWorkDayClick();
});
closeWorkDayPinBtn.addEventListener('click', function () {
  closeWorkDayClick();
});
var btnDayNext = document.querySelector('.formed-orders__navbar-btn_next');
var btnDayPrev = document.querySelector('.formed-orders__navbar-btn_prev');
var btnOrderStatLimit = document.querySelector('.formed-orders__limit');
btnOrderStatLimit.addEventListener('click', function () {
  orderRenderLimit = 999;
  interfaceApp.renderOrderByDay(dateStrGlobal);
});

function navBtnClick(event) {
  event.preventDefault();
  var incr = 0,
      q = '',
      ans = '';

  if (event.target.classList.contains('formed-orders__navbar-btn_next')) {
    incr = 1;
  } else {
    incr = -1;
  }

  try {
    var dArr = dateStrGlobalTemp.split('-');
    var d = new Date(Number(dArr[0]), Number(dArr[1]) - 1, Number(dArr[2]));
    d.setDate(d.getDate() + incr);
    dateStrGlobalTemp = d.getFullYear() + '-' + AddLeftG(d.getMonth() + 1, '0', 2) + '-' + AddLeftG(d.getDate(), '0', 2);

    try {
      q = "SELECT id FROM orders WHERE date = '".concat(dateStrGlobalTemp, "'");
      ans = db.query(q);
      interfaceApp.renderOrderByDay(dateStrGlobalTemp);

      if (dateStrGlobal === dateStrGlobalTemp) {
        btnDayNext.setAttribute('disabled', 'disabled');
      } else {
        btnDayNext.removeAttribute('disabled');
      }
    } catch (error) {
      try {
        db.conn.close();
      } catch (error) {}

      popup('Данные за предыдущий день архивированы');
    }
  } catch (error) {}
}

btnDayNext.addEventListener('click', navBtnClick);
btnDayPrev.addEventListener('click', navBtnClick);
var iframeComtainer = document.querySelector('.iframe-container');
var suppliesBtn = document.querySelector('#supplies');
suppliesBtn.addEventListener('click', function () {
  var iframeList = document.querySelectorAll('.iframe-container__item');

  if (iframeList.length > 0) {
    iframeComtainer.classList.remove('iframe-container_active');
    iframeList.forEach(function (item) {
      item.remove();
    });
  }

  var iframe = document.createElement("iframe");
  iframeComtainer.classList.add('iframe-container_active');
  iframe.classList.add('iframe-container__item');
  iframe.setAttribute('title', 'pickcha');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

  iframe.onload = function () {
    iframeComtainer.classList.add('iframe-container_active');
  };

  iframe.onerror = function () {
    popup('Ошибка загрузки окна поставок', true);
  };

  iframe.src = "http://bridge.cwsystem.ru/engine/?class=API&method=makeorderface&key=".concat(suppliesKey, "&pp=").concat(parntnerId, "&p=").concat(pointCashbox);
  logger('Открытие поставок:' + iframe.src); // iframe.src = 'http://bridge.cwsystem.ru/engine/?class=API&method=makeorderface&key=63574b7dc89ae33b0598b81b49c1c336&pp=1&p=336'

  iframeComtainer.appendChild(iframe);
}); // кнопка поставок

var suppliesBtnReturn = document.querySelector('.iframe-container__btn');
suppliesBtnReturn.addEventListener('click', function (e) {
  iframeComtainer.classList.remove('iframe-container_active');
  var iframeList = document.querySelectorAll('.iframe-container__item');

  if (iframeList.length > 0) {
    iframeList.forEach(function (item) {
      item.remove();
      iframeComtainer.classList.remove('iframe-container_active');
    });
  }
});
btnWriteoff.addEventListener('click', function () {
  logger("\u041D\u0430\u0436\u0430\u043B\u0438 \u043A\u043D\u043E\u043F\u043A\u0443 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0430\u0439\u0434\u0438 \u0447\u0435\u043A\u0430 id ".concat(idOrderGlobal));

  if (entry.ordersFixation(ordersArr[0], 2)) {
    // фиксируем чек\
    del.tempSale(); // чистим скидки

    idOrderGlobal = undefined; // удаляем глобал и обновляем страницу

    update.idOrder(); // вызов нового чека
  } else {
    popup("\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
    logger("\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
  }
});