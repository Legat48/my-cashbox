"use strict";

// класс для доотправки данных на сервер, атол и лояльность
var postman = new function () {
  this.loyalityOrder = function () {
    if (!onlineSystem) {
      clearTimeout(delayPostmanLoyalityOrder);
      delayPostmanLoyalityOrder = setTimeout(postman.loyalityOrder, 121111); // повторная попытка отправки через 2 минуты

      return;
    }

    var ans, q; // готовим запросы

    var ordersTableArr = []; //массив для создания чека

    var ordersArr = []; //чек который полетит на сервер

    try {
      // запрос чека готового к отправке на сервер
      q = "SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status in (1, 2, 3) and accumClientPoints in (1, 2) and recordedLoyalty = 0)"; // logger(`запрос отправщика в систему лояльности ${q}`)

      ans = db.query(q);

      for (var i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }

      ordersTableArr.forEach(function (e) {
        var order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient); // создали чек

        ordersArr.push(order);
      });
      var param = new LoyaltyRequest(ordersArr[0]); // создание объекта транзакции

      logger("\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u043D\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0434\u043B\u044F \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F \u0431\u0430\u043B\u043B\u043E\u0432 ".concat(JSON.stringify(param))); // товары из базы данных берутся в транзакции

      return new Promise(function (resolve, reject) {
        ieFetch({
          method: 'POST',
          url: "https://loyalclient.apptor.tech/integration/cw/transaction/create",
          headerApikey: "apikey",
          key: "a808d35874bfb2b3ab492ec5ed23486dff0025e40527d2f677bc7e954e3c0a23",
          headerType: "Content-Type",
          type: "application/json",
          send: JSON.stringify(param)
        }).then(function (json) {
          logger("\u041E\u0442\u0432\u0435\u0442 \u043D\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0434\u043B\u044F \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F \u0431\u0430\u043B\u043B\u043E\u0432 ".concat(JSON.stringify(json)));
          var ans = JSON.parse(json);

          if (ans.success === true) {
            //пришел успешный ответ - записали статус 3
            popup('баллы записаны');
            q = "UPDATE orders SET recordedLoyalty = 1 WHERE id = ".concat(Number(ordersArr[0].id));

            try {
              db.query(q); // вызываем себя снова

              clearTimeout(delayPostmanLoyalityOrder);
              delayPostmanLoyalityOrder = setTimeout(postman.loyalityOrder, 7530);
            } catch (e) {
              logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u043F\u0438\u0441\u0438 \u0447\u0435\u043A\u0430 \u0432 \u043E\u0442\u043F\u0440\u0430\u0432\u0449\u0438\u043A\u0435 \u043D\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u044C ".concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(ordersArr[0]), " \u043E\u0442\u0432\u0435\u0442 ").concat(json));
            }
          }

          return;
        })["catch"](function (e) {
          logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u043D\u0430 \u043B\u043E\u044F\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0434\u043B\u044F \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F \u0431\u0430\u043B\u043B\u043E\u0432 ".concat(JSON.stringify(e)));
          clearTimeout(delayPostmanLoyalityOrder);
          delayPostmanLoyalityOrder = setTimeout(postman.loyalityOrder, 7530);
          return;
        });
      });
    } catch (e) {
      try {
        db.conn.close();
      } catch (error) {}

      clearTimeout(delayPostmanLoyalityOrder);
      delayPostmanLoyalityOrder = setTimeout(postman.loyalityOrder, 27530); // alert("Ошибка отправки чеков на сервер \n"+e.message);

      return false;
    }
  }; // отправщик на сервер чеков


  this.serverOrder = function () {
    if (!onlineSystem) {
      clearTimeout(delayPostmanServerOrder);
      delayPostmanServerOrder = setTimeout(postman.serverOrder, 123456);
      return;
    }

    var ans, q; // готовим запросы

    var ordersTableArr = []; //массив для создания чека

    var ordersArr = []; //чек который полетит на сервер

    try {
      // запрос чека готового к отправке на сервер
      q = "SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status in (-2 , 2))"; // logger(`запрос отправщик на сервер чеков ${q}`)

      ans = db.query(q);

      for (var i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }

      ordersTableArr.forEach(function (e) {
        var order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient); // создали чек

        ordersArr.push(order);
      });

      try {
        q = "SELECT id, idProd, idOrder, name, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum FROM orderItem WHERE idOrder = ".concat(Number(ordersArr[0].id));
        logger(" \u0432 \u043E\u0442\u043F\u0440\u0430\u0432\u0449\u0438\u043A\u0435 ,\u043F\u043E \u0447\u0435\u043A\u0443 \u0438\u0434\u0435\u043C \u0437\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430\u043C\u0438 ".concat(q));

        var _productAns;

        try {
          _productAns = db.query(q);
        } catch (e) {
          db.conn.close();
          q = "UPDATE orders SET status = 6 WHERE id = ".concat(Number(ordersArr[0].id));
          logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0437\u044F\u0442\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043F\u043E \u0447\u0435\u043A\u0443, \u043E\u0442\u0432\u0435\u0442 ".concat(_productAns, " \u0447\u0435\u043A ").concat(Number(ordersArr[0].id), " \u0447\u0435\u043A \u0431\u0443\u0434\u0435\u0442 \u0441\u0431\u0440\u043E\u0448\u0435\u043D ").concat(q));
          db.query(q);
          clearTimeout(delayPostmanServerOrder);
          delayPostmanServerOrder = setTimeout(postman.serverOrder, 13937);
          return;
        }
      } catch (e) {
        try {
          db.conn.close();
        } catch (error) {}

        logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0437\u044F\u0442\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043F\u043E \u0447\u0435\u043A\u0443, \u043E\u0442\u0432\u0435\u0442 ".concat(productAns, " \u0447\u0435\u043A ").concat(Number(ordersArr[0].id), " \u0447\u0435\u043A \u043D\u0435 \u0431\u0443\u0434\u0435\u0442 \u0441\u0431\u0440\u043E\u0448\u0435\u043D"));
      }

      var param = new Transaction(ordersArr[0]); // создание объекта транзакции
      // товары из базы данных берутся в транзакции

      logger(" \u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u0442\u0440\u0430\u043D\u0437\u0430\u0446\u0438\u0438 \u043F\u043E \u0430\u0434\u0440\u0435\u0441\u0443 : https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain, " \u0432 \u0442\u0435\u043B\u0435: ").concat(JSON.stringify(param)));
      return new Promise(function (resolve, reject) {
        ieFetch({
          method: 'POST',
          url: "https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain),
          headerType: "Content-Type",
          type: "application/json",
          send: JSON.stringify(param)
        }).then(function (json) {
          var ans = JSON.parse(json);

          if (ans.type === 'success') {
            //пришел успешный ответ - записали статус 3
            popup("\u0427\u0435\u043A \u043D\u043E\u043C\u0435\u0440 ".concat(Number(ordersArr[0].id), " \u0437\u0430\u043F\u0438\u0441\u0430\u043D \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435"));

            if (ordersArr[0].status == 2) {
              q = "UPDATE orders SET status = 3 WHERE id = ".concat(Number(ordersArr[0].id));

              try {
                db.query(q);
              } catch (e) {
                popup('Ошибка в postman>serverOrder' + e.message);
              }
            } else if (ordersArr[0].status == -2) {
              q = "UPDATE orders SET status = 4 WHERE id = ".concat(Number(ordersArr[0].id));

              try {
                db.query(q);
              } catch (e) {
                popup('ошибка апдейта после записи атола' + e.message);
                logger('ошибка апдейта после записи атола' + e.message);
              }
            }

            try {
              db.query(q);
            } catch (e) {
              popup('Ошибка в postman>serverOrder' + e.message);
            } // вызываем себя снова


            clearTimeout(delayPostmanServerOrder);
            delayPostmanServerOrder = setTimeout(postman.serverOrder, 13937);
          }

          return;
        })["catch"](function (e) {
          logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438".concat(JSON.stringify(e)));
          clearTimeout(delayPostmanServerOrder);
          delayPostmanServerOrder = setTimeout(postman.serverOrder, 13937);
          return;
        });
      });
    } catch (e) {
      try {
        db.conn.close();
      } catch (error) {}

      clearTimeout(delayPostmanServerOrder);
      delayPostmanServerOrder = setTimeout(postman.serverOrder, 13937);
      return false;
    }
  }; // отмена чека


  this.serverOrderCancel = function () {
    // popup('функция отмены чека запустилась')
    if (!onlineSystem) {
      clearTimeout(delayPostmanServerOrderCancel);
      delayPostmanServerOrderCancel = setTimeout(postman.serverOrderCancel, 7377);
      return;
    }

    var ans, q; // готовим запросы

    var ordersTableArr = []; //массив для создания чека

    var ordersArr = []; //чек который полетит на сервер

    try {
      // запрос чека готового к отправке на сервер
      q = "SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status = 4)"; // logger(`запрос отправщик отмены чека ${q}`);

      ans = db.query(q); // alert(` not my ответ на чек который подойдет на отправку${JSON.stringify(ans)}`)

      for (var i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }

      ordersTableArr.forEach(function (e) {
        var order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient); // создали чек

        ordersArr.push(order);
      });
      return new Promise(function (resolve, reject) {
        ieFetch({
          method: 'GET',
          url: "https://cwflow.apiloc.ru/api/terminal/refunds/create_uniqid?token=".concat(ordersArr[0].tokenPoint, "&transaction=").concat(ordersArr[0].id).concat(ordersArr[0].hashcode),
          headerType: "Content-Type",
          type: "application/json",
          send: 'data'
        }).then(function (json) {
          var ans = JSON.parse(json);

          if (ans.type === 'success') {
            //пришел успешный ответ - записали статус 5
            popup("\u041E\u0442\u043C\u0435\u043D\u0430 \u0447\u0435\u043A\u0430 ".concat(Number(ordersArr[0].id), " \u0437\u0430\u043F\u0438\u0441\u0430\u043D\u0430"));
            q = "UPDATE orders SET status = 5 WHERE id = ".concat(Number(ordersArr[0].id));
            db.query(q); // вызываем себя снова

            clearTimeout(delayPostmanServerOrderCancel);
            delayPostmanServerOrderCancel = setTimeout(postman.serverOrderCancel, 27377);
          } else {
            var msg = ans.data.msg;

            if (msg === 'Транзакция не найдена.') {
              telegramNote('Транзакция не найдена:' + ordersArr[0].id + ordersArr[0].hashcode + '/' + ordersArr[0].date, '1385389369');
              q = "UPDATE orders SET status = 5 WHERE id = ".concat(Number(ordersArr[0].id));
              db.query(q);
            }
          }

          return;
        })["catch"](function (e) {
          clearTimeout(delayPostmanServerOrderCancel);
          delayPostmanServerOrderCancel = setTimeout(postman.serverOrderCancel, 27377);
          return;
        });
      });
    } catch (e) {
      db.conn.close();
      clearTimeout(delayPostmanServerOrderCancel);
      delayPostmanServerOrderCancel = setTimeout(postman.serverOrderCancel, 47377);
      return false;
    }
  }; // отправщик на атол


  this.atolOrder = function () {
    if (useAtol && troubleAtol) {
      var order = false;
      var productArr = false;
      order = subfunc.getOrderObg(1);

      if (order) {
        productArr = subfunc.getProductArr(order);

        if (productArr) {
          popup('отправка чека на печать');
          logger("\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 \u0441 \u0430\u0439\u0434\u0438 ".concat(order.id));

          if (devkkm.openOrder(order, productArr)) {
            devkkm.printOrder(order, productArr);
            var q = "UPDATE orders SET status = 2 WHERE id = ".concat(order.id);
            postman.displayOrder(order, productArr);

            try {
              db.query(q);
              logger("\u0444\u0438\u043A\u0441\u0430\u0446\u0438\u044F \u0447\u0435\u043A\u0430 \u0441 \u0430\u0439\u0434\u0438 ".concat(order.id)); // и пробуем новый чек отправить

              clearTimeout(delayPostmanAtolOrder);
              delayPostmanAtolOrder = setTimeout(postman.atolOrder, 12777);
            } catch (e) {
              popup("\u043E\u0448\u0438\u0431\u043A\u0430 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u0438 \u0447\u0435\u043A\u0430 ".concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(order)));
              logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u0438 \u0447\u0435\u043A\u0430 ".concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(order)));
            }
          } else {
            popup('печать чека не удалась, проверьте фискальный регистратор и перезапустите кассу(закрыть 2 окна)! ');
            clearTimeout(delayPostmanAtolOrder);
            delayPostmanAtolOrder = setTimeout(postman.atolOrder, 15777);
          }
        } else {
          popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043F\u043E \u0447\u0435\u043A\u0443 ".concat(order.id, ". \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0442\u043E\u0440 \u0447\u0435\u043A\u043E\u0432 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D"));
        }
      } else {
        order = subfunc.getOrderObg(-1);

        if (order) {
          logger("282\u0441\u0442 \u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 \u0441 \u0430\u0439\u0434\u0438 ".concat(order.id));
          productArr = subfunc.getProductArr(order);

          if (productArr) {
            popup('отправка чека на печать возврата');

            if (devkkm.printReturtOrder(order, productArr)) {
              clearTimeout(delayPostmanAtolOrder);
              delayPostmanAtolOrder = setTimeout(postman.atolOrder, 12777);
            } else {
              popup('печать возврата чека не удалась, проверьте фискальный регистратор!');
              clearTimeout(delayPostmanAtolOrder);
              delayPostmanAtolOrder = setTimeout(postman.atolOrder, 15777);
            }
          } else {
            popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043F\u043E \u0447\u0435\u043A\u0443 ".concat(order.id, ". \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0442\u043E\u0440 \u0447\u0435\u043A\u043E\u0432 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D"));
          }
        } else {
          troubleAtol = 0;
          document.querySelector('#trouble-atol-toggle').checked = false;
          telegramNote('Аварийный режим атола отключён');
          dbMethods.updateDb('settings', {
            value: 0
          }, {
            variable: 'troubleAtol'
          });
          popup('Синхронизация остановлена, касса переведена в безаварийный режим');
        }
      }
    }
  }; // отправщик списаний с сертификатов


  this.certificateOrder = function () {
    if (!onlineSystem) {
      clearTimeout(delayPostmanCertificateOrder);
      delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 121111); // повторная попытка отправки через 2 минуты

      return;
    }

    var ans, q; // готовим запросы

    var ordersTableArr = []; //массив для создания чека

    var ordersArr = []; //чек который полетит на сервер

    try {
      // запрос чека готового к отправке на сервер
      q = "SELECT id, time, date, offreckoning, certificate, tokenPoint, hashCode, tokenPoint, endPointsCert FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status in (1, 2, 3) and (recordedCertificate = 1 and certificate != 0))"; // logger(`запрос отправщика в систему сертификатов ${q}`)

      try {
        ans = db.query(q);
      } catch (error) {
        db.conn.close();
        ans = [];
        clearTimeout(delayPostmanCertificateOrder);
        delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 27530);
        return;
      }

      for (var i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }

      ordersTableArr.forEach(function (e) {
        var order = {
          id: e.id,
          sertificate_code: e.certificate,
          sum: Number(e.offreckoning) - Number(e.endPointsCert),
          transaction: "".concat(Number(e.id)).concat(e.hashcode),
          date: "".concat(e.date, "-").concat(e.time),
          token: e.tokenPoint,
          key: 'Njim99'
        };
        ordersArr.push(order);
      });
      var param = ordersArr[0];

      if (!param) {
        clearTimeout(delayPostmanCertificateOrder);
        delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 27530);
        return;
      }

      logger("\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u043D\u0430 certificateOrder ".concat(JSON.stringify(param)));
      return new Promise(function (resolve, reject) {
        ieFetch({
          method: 'POST',
          url: "https://bridge.cwsystem.ru/engine/kassa/sertificate/backend/remove",
          send: JSON.stringify(param)
        }).then(function (json) {
          var ans = JSON.parse(json);

          if (ans.type === 'error') {
            logger("\u041E\u0442\u0432\u0435\u0442 \u0432 certificateOrder ".concat(JSON.stringify(ans)));

            if (ans.code == 501) {
              q = "UPDATE orders SET recordedCertificate = 2 WHERE id = ".concat(Number(ordersArr[0].id));
              db.query(q); // вызываем себя снова

              clearTimeout(delayPostmanCertificateOrder);
              delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 15233);
              return;
            } else {
              clearTimeout(delayPostmanCertificateOrder);
              delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 15123);
            }
          } else {
            logger("\u041E\u0442\u0432\u0435\u0442 \u0432 certificateOrder ".concat(JSON.stringify(ans)));

            if (ans.code == 200) {
              q = "UPDATE orders SET recordedCertificate = 2 WHERE id = ".concat(Number(ordersArr[0].id));
              db.query(q);
              clearTimeout(delayPostmanCertificateOrder);
              delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 15433);
              popup("\u0411\u0430\u043B\u043B\u044B \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0430 ".concat(e.certificate, " \u0441\u043F\u0438\u0441\u0430\u043D\u044B"));
              logger("\u0411\u0430\u043B\u043B\u044B \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0430 ".concat(e.certificate, " \u0441\u043F\u0438\u0441\u0430\u043D\u044B"));
            }
          }

          return;
        })["catch"](function (e) {
          try {
            db.conn.close();
            popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0438 \u0431\u0430\u043B\u043B\u043E\u0432 ".concat(e.certificate, " \n ").concat(e.message));
            logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0438 \u0431\u0430\u043B\u043B\u043E\u0432 ".concat(e.certificate, " \n ").concat(e.message));
          } catch (error) {}

          clearTimeout(delayPostmanCertificateOrder);
          delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 27530);
          return false;
        });
      });
    } catch (e) {
      try {
        db.conn.close();
        popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0438 \u0431\u0430\u043B\u043B\u043E\u0432 ".concat(e.certificate, " \n ").concat(e.message));
        logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0438 \u0431\u0430\u043B\u043B\u043E\u0432 ".concat(e.certificate, " \n ").concat(e.message));
      } catch (error) {}

      clearTimeout(delayPostmanCertificateOrder);
      delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 27530);
      return false;
    }
  }; // отправщик чеков на кухню


  this.displayOrder = function (order, productsArr) {
    if (!useDisplayOrder) {
      return;
    }

    var orderObj = {
      id: subfunc.orderIfFormat(order.id),
      point: "".concat(pointCashbox),
      date: "".concat(order.date),
      time: "".concat(order.time),
      items: productsArr.map(function (i) {
        var bulkValue = '';

        if (i.bulkuntils != 'шт') {
          bulkValue = "".concat(i.bulkvalue || '').concat(i.bulkuntils || '');
        }

        return {
          name: "".concat(i.name, " ").concat(bulkValue),
          count: "".concat(i.amount)
        };
      })
    }; // popup(`Отправка чека ${JSON.stringify(orderObj)} на экран кухни`);
    // logger(`Отправка чека ${JSON.stringify(orderObj)} на экран кухни`)

    return new Promise(function (resolve, reject) {
      ieFetch({
        method: 'POST',
        url: "".concat(displayAddress, "?addorderinbase=1&data=").concat(JSON.stringify(orderObj)),
        headerType: "Content-Type",
        type: "application/json"
      }).then(function (json) {
        if (json) {
          popup("\u0427\u0435\u043A \u043D\u043E\u043C\u0435\u0440 ".concat(orderObj.id, " \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u043D\u0430 \u044D\u043A\u0440\u0430\u043D \u043A\u0443\u0445\u043D\u0438"));
        }

        return;
      })["catch"](function (e) {
        popup("\u041D\u0435\u0442 \u0441\u0432\u044F\u0437\u0438 \u0441 \u044D\u043A\u0440\u0430\u043D\u043E\u043C \u043A\u0443\u0445\u043D\u0438");
        return;
      });
    });
  };
}();