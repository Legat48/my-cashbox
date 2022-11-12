"use strict";

// класс для работы с запросами и отправкой данных
var send = new function () {
  // получить данные клиента
  this.getInfoClient = function (search) {
    return new Promise(function (resolve, reject) {
      var clientInput = document.querySelector('#client-card-input');
      var json = {};
      json.search = search;
      json.country = subdomain;
      json.point = pointCashbox;
      ieFetch({
        method: 'POST',
        url: "https://loyalclient.apptor.tech/integration/cw/client/search",
        headerApikey: "apikey",
        key: "a808d35874bfb2b3ab492ec5ed23486dff0025e40527d2f677bc7e954e3c0a23",
        headerType: "Content-Type",
        type: "application/json",
        send: JSON.stringify(json)
      }).then(function (json) {
        var clientInfoArr = document.querySelectorAll('.client__info');

        if (clientInfoArr.length > 0) {
          clientInfoArr.forEach(function (clientInfoItem) {
            clientInfoItem.textContent = 'Клиент';
          });
        }

        logger("\u041E\u0442\u0432\u0435\u0442 \u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \u043A\u043B\u0438\u0435\u043D\u0442\u0430: \u0417\u0430\u043F\u0440\u043E\u0441 \u043F\u043E : ".concat(search, " \u043E\u0442\u0432\u0435\u0442: ").concat(json));

        if (JSON.parse(json).success) {
          clientInput.value = '';
          var ans = JSON.parse(json).data;
          resolve(ans);
          return ans;
        } else {
          clientInput.value = '';
          popup('Неверный номер или код');
          resolve(undefined);
          return undefined;
        }
      })["catch"](function (e) {
        clientInput.value = '';
        popup("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0435, \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u043D\u0435\u0442 \u0441\u0432\u044F\u0437\u0438");
        logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0435 ".concat(e.message));
        resolve(undefined);
        return undefined;
      });
    });
  }; // Оплата QR кодом


  this.cashlessQRcode = function () {
    if (onlineSystem) {
      var time = subfunc.getTime();
      var rs = subfunc.random();
      var trans = "".concat(idOrderGlobal).concat(rs).concat(time.unix, "s").concat(useAtol).concat(useTerminal).concat(troubleAtol);
      var data = {};
      data['answer_url'] = "http://inside.erpka.online/sbp/?p=".concat(pointCashbox, "&trans=").concat(trans);
      data.cost = Number(ordersArr[0].orderSumFinal); // сумма которую должен оплатить клиент
      // data.duration = 600 //не обязательный параметр который указывает время жизни существования операции на кассе в секундах.

      data.items = []; //  список покупок, который будет отображаться у клиента

      productArr.forEach(function (e) {
        var product = {};
        product.title = e.name; // название позиции

        product.amount = e.amount; //  количество позиций

        product.price = e.priceFinal; // цена одной позиции

        data.items.push(product);
      });
      logger("\u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C \u043D\u0430 \u0430\u0434\u0440\u0435\u0441 qr \u043E\u043F\u043B\u0430\u0442\u044B \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438".concat(JSON.stringify(data))); // создание операции

      ieFetch({
        method: 'POST',
        url: "https://newpayb2b.pro/api/s1/operation/create",
        headerApikey: "api-key",
        key: keyQR,
        headerUserToken: "user-token",
        token: tokenQR,
        headerType: "Content-Type",
        type: "application/json",
        send: JSON.stringify(data)
      }).then(function (json) {
        var answ = JSON.parse(json);
        saleToken = answ['sale_token'];
        ordersArr[0].qrtoken = answ['sale_token']; // кнопка проверки оплаты

        if (answ.code === 1) {
          var handleError = function handleError(message) {
            // обработчик ошибки
            popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0438 QR \u043A\u043E\u0434\u0430: ".concat(message));
          };

          // если операция создана
          preloader.preloaderQRcode();
          var xmlhttp = getXmlHttp();
          xmlhttp.open("POST", "http://inside.erpka.online/sbp/get.php?p=".concat(pointCashbox, "&trans=").concat(trans), true);

          xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState != 4) return;
            clearTimeout(timeout); // очистить таймаут при наступлении readyState 4

            if (xmlhttp.status == 200) {
              // alert(JSON.stringify(servAnsw))
              var servAnsw = JSON.parse(xmlhttp.responseText);

              if (servAnsw.answer == 'error') {
                preloader.preloaderOff();
                return;
              }

              if (saleToken == servAnsw['sale_token'].replace(/\n/g, '') && "".concat(servAnsw.result) === 'true') {
                ordersArr[0].chtype = 2;
                preloader.preloaderOff();
                btnQRcode.classList.add('ready-payment');
                clientInput.setAttribute("disabled", "disabled");
                clientBtn.setAttribute("disabled", "disabled");
                promocodeInput.setAttribute("disabled", "disabled");
                promocodeWrap.setAttribute("disabled", "disabled");
                ordersArr[0].status = 1;
                popup("\u041E\u043F\u043B\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 QR \u043A\u043E\u0434\u043E\u043C ".concat(ordersArr[0].id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
                logger("\u041E\u043F\u043B\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 QR \u043A\u043E\u0434\u043E\u043C ".concat(ordersArr[0].id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));

                if (entry.ordersFixation(ordersArr[0], 1)) {
                  if (useAtol === 1 && !troubleAtol) {
                    // если используется атол и не аварийный режим
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

                          ;
                        }

                        ;
                      }
                    } else {
                      popup("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
                      logger("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0443!"));
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

                  ;
                } else {
                  popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B QR \u043A\u043E\u0434\u043E\u043C  \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                  logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B QR \u043A\u043E\u0434\u043E\u043C  \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(ordersArr[0]), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(productArr)));
                }
              } else {
                preloader.preloaderOff();
              }
            } else {
              handleError(xmlhttp.statusText); // вызвать обработчик ошибки с текстом ответа
            }
          };

          xmlhttp.send("a=5&b=4"); // Таймаут 600 секунд

          var timeout = setTimeout(function () {
            xmlhttp.abort();
            handleError("Time over");
          }, 600000);
        } else {
          // ошибка запроса
          popup("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430: ".concat(answ.error));
          logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430: ".concat(answ.error, " ").concat(JSON.stringify(answ), " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
          preloader.preloaderOff();
        } // кнопка проверки оплаты


        document.querySelector('.preloader__btn_verify').addEventListener('click', function () {
          logger("\u043D\u0430\u0436\u0430\u0442\u0430 \u043A\u043E\u043F\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043E\u043F\u043B\u0430\u0442\u044B, ID \u0447\u0435\u043A\u0430 ".concat(idOrderGlobal)); // закрытие операции оплаты QRcode

          var url = "https://newpayb2b.pro/operation/result?sale_token=".concat(saleToken);
          ieFetch({
            method: 'GET',
            url: url,
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
              if (ans.status === 0) {
                popup('Операция еще не оплачена');
              } else if (ans.status === 1 && "".concat(ans.result) === 'true') {
                popup('Операция оплачена и подтверждена банком');

                try {
                  ordersArr[0].chtype = 2;
                  preloader.preloaderOff();
                  btnQRcode.classList.add('ready-payment');
                  clientInput.setAttribute("disabled", "disabled");
                  clientBtn.setAttribute("disabled", "disabled");
                  promocodeInput.setAttribute("disabled", "disabled");
                  promocodeWrap.setAttribute("disabled", "disabled");
                  ordersArr[0].status = 1;
                  popup("\u041E\u043F\u043B\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 QR \u043A\u043E\u0434\u043E\u043C ".concat(ordersArr[0].id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
                  logger("\u041E\u043F\u043B\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 QR \u043A\u043E\u0434\u043E\u043C ".concat(ordersArr[0].id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));

                  if (entry.ordersFixation(ordersArr[0], 1)) {
                    if (useAtol === 1 && !troubleAtol) {
                      // если используется атол и не аварийный режим
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

                          ;
                        }

                        ;
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

                    ;
                  } else {
                    popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B QR \u043A\u043E\u0434\u043E\u043C  \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                    logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B QR \u043A\u043E\u0434\u043E\u043C  \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(ordersArr[0]), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(productArr)));
                  }
                } catch (e) {
                  logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 ".concat(e.message));
                }

                return;
              } else if (ans.status === 1 && "".concat(ans.result) === 'false') {
                preloader.preloaderOff();
                popup('Операция отменена клиентом');
                logger("\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u044F \u043F\u043E \u0447\u0435\u043A\u0443 ".concat(ordersArr[0].id, " \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u043C"));
              }
            } else {
              popup('Ошибка проверки оплаты QR кодом');
              logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043E\u043F\u043B\u0430\u0442\u044B QR \u043A\u043E\u0434\u043E\u043C: ".concat(ans.error));
            }
          })["catch"](function (e) {
            logger("\u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u043D\u0430 \u0421\u041F\u0411: ".concat(JSON.stringify(data), " \n\n            \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438\u0448\u043B\u0430 ").concat(JSON.stringify(e)));
          });
        });
      })["catch"](function (e) {
        logger("\u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u043D\u0430 \u0421\u041F\u0411: ".concat(JSON.stringify(data), "\n        \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438\u0448\u043B\u0430 ").concat(JSON.stringify(e)));
      });
    } else {
      popup('Соединение с сервером потерено, оплата QR кодом невозможна');
    }
  };

  this.cancelQRcode = function (idOrder, btn) {
    var order = subfunc.getOrderObg(7, idOrder);
    var productArr = subfunc.getProductArr(order);
    logger("keyQR ".concat(keyQR, " tokenQR ").concat(tokenQR, " "));

    if (onlineSystem) {
      var data = {};
      data.sale_token = order.qrtoken;
      data.cost = Number(order.orderSumFinal); // сумма которую должен оплатить клиент

      data['answer_url'] = "http://inside.erpka.online/sbp/?p=".concat(pointCashbox, "&trans=").concat(order.qrtoken); //  адрес url куда отправлять сообщение о результатах платежа (не обязательный параметр если не требуется можно опустить)
      // создание операции

      ieFetch({
        method: 'POST',
        url: "https://newpayb2b.pro/api/s1/operation/return",
        headerApikey: "api-key",
        key: keyQR,
        headerUserToken: "user-token",
        token: tokenQR,
        headerType: "Content-Type",
        type: "application/json",
        send: JSON.stringify(data)
      }).then(function (json) {
        var answ = JSON.parse(json);

        if (answ.code === 1) {
          // если операция создана
          btn.classList.add('ready-payment');
          btn.textContent = 'Ден. возв.';
          order.status = -1;
          popup("\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u0447\u0435\u043A\u0430 ".concat(order.id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
          logger("\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u0447\u0435\u043A\u0430 ".concat(order.id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
          var q = "UPDATE orders SET status = -1 WHERE id = ".concat(Number(order.id));

          try {
            db.query(q);

            if (useAtol && !troubleAtol) {
              // если используется атол
              if (devkkm.printReturtOrder(order, productArr)) {
                popup("\u0427\u0435\u043A ".concat(order.id, " \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0442\u043C\u0435\u043D\u0435\u043D"));
                btn.textContent = 'Отменен';
                btn.setAttribute("disabled", "disabled");
              } else {
                popup("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                logger("\u041F\u0435\u0447\u0430\u0442\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
                troubleAtolCounter += 1;

                if (troubleAtolCounter == 2) {
                  devkkm.init();
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
                  btn.textContent = 'Отменен';
                  btn.setAttribute("disabled", "disabled");
                }

                ;
              }
            } else if (useAtol === 1 && troubleAtol) {
              popup('Печать чеков невозможна, проверьте работу фискальника и выключите аварийный режим');
              btn.textContent = 'Отменен';
              btn.setAttribute("disabled", "disabled");
            } else {
              var _q = "UPDATE orders SET status = -2 WHERE id = ".concat(Number(order.id));

              try {
                db.query(_q);
                btn.textContent = 'Отменен';
                btn.setAttribute("disabled", "disabled");
              } catch (e) {
                logger("\u0447\u0435\u043A ".concat(Number(order.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C, \u0447\u0435\u043A ").concat(JSON.stringify(order), " \u0442\u043E\u0432\u0430\u0440\u044B ").concat(JSON.stringify(productArr), " \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message));
                popup("\u0447\u0435\u043A ".concat(Number(order.id), " \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C"));
              }
            }

            ;
          } catch (e) {
            popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B ".concat(order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
            logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u0442\u043C\u0435\u043D\u044B ".concat(order.id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(order), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(productArr)));
          }
        }
      })["catch"](function (e) {
        logger("\u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u043D\u0430 \u0421\u041F\u0411: ".concat(JSON.stringify(data), "\n        \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438\u0448\u043B\u0430 ").concat(JSON.stringify(e)));
      });
    }
  }; //оплата на терминале


  this.cashlessTerminal = function () {
    sbbank.sum = ordersArr[0].orderSumFinal; //на сбер отправляем общую сумму чека

    sbbank.statusWaiting = 1; // открываем статус на ожидание оплаты

    preloader.preloaderTerminal(); // вызов функции оплаты

    try {
      sbbank.paymentBank();

      while (sbbank.statusWaiting > 0) {} //ожидание статуса оплаты


      preloader.preloaderOff();

      if (sbbank.res == 0) {
        //если оплата прошла
        btnCashNon.classList.add('ready-payment');
        clientInput.setAttribute("disabled", "disabled");
        clientBtn.setAttribute("disabled", "disabled");
        promocodeInput.setAttribute("disabled", "disabled");
        promocodeWrap.setAttribute("disabled", "disabled");
        ordersArr[0].status = 1;
        popup("\u041E\u043F\u043B\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));
        logger("\u041E\u043F\u043B\u0430\u0442\u0430 \u0447\u0435\u043A\u0430 ".concat(ordersArr[0].id, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E"));

        if (entry.ordersFixation(ordersArr[0], 1)) {
          if (useAtol && !troubleAtol) {
            // если используется атол
            if (devkkm.openOrder(ordersArr[0], productArr)) {
              if (entry.ordersFixation(ordersArr[0], 2)) {
                // фиксируем чек\
                devkkm.bankSlip(sbbank.cheque, devkkm.printOrder(ordersArr[0], productArr)); // банковский слип

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

          ;
        } else {
          popup("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C"));
          logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043E\u043F\u043B\u0430\u0442\u044B ".concat(ordersArr[0].id, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0447\u0435\u043A ").concat(JSON.stringify(ordersArr[0]), " \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u043D\u0435\u043C ").concat(JSON.stringify(productArr)));
        }
      } else {
        popup('Оплата остановлена!', true);
        preloader.fiscalErrorNote('Оплата остановлена!');
      }
    } catch (e) {
      popup('Оплата остановлена! Возникли проблемы в функции оплаты');
      logger("\u041E\u043F\u043B\u0430\u0442\u0430 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430! \u0412\u043E\u0437\u043D\u0438\u043A\u043B\u0438 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043E\u043F\u043B\u0430\u0442\u044B ".concat(e.message));
      preloader.fiscalErrorNote('Оплата остановлена!');

      try {
        devkkm.init();
      } catch (error) {}

      preloader.preloaderOff();
    }
  };
}();