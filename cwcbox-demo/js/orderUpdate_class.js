"use strict";

var update = new function Update() {
  // Обновление глобального идентификатора чека
  this.idOrder = function () {
    //переключение столов реализуется от олобального стола
    // alert(`функция Update.idOrder`)
    var q;
    var ans = false;

    try {
      // делаем запрос в таблицу, и ищем там чек который не сформирован (статус 0)
      q = "SELECT id FROM orders WHERE status = 0 and currentTable = ".concat(currentTable);
      ans = db.query(q);
    } catch (e) {
      db.conn.close();

      if (!troubleAtol && useAtol) {
        q = "SELECT id FROM orders WHERE status = 1 and currentTable = ".concat(currentTable, " and chtype in (1,2)");

        try {
          ans = db.query(q);
        } catch (e) {
          db.conn.close();
        }
      } // если такого чека нет, то создаем новый чек со статусом 0


      if (!ans) {
        try {
          // потрем глобальые переменные для нового чека
          productArr = [];

          var _clientWrap = document.querySelector('.header__card_client');

          btnCashNon.classList.remove('ready-payment');
          btnQRcode.classList.remove('ready-payment');
          btnCash.classList.remove('trouble');
          btnQRcode.classList.remove('trouble');
          btnCashNon.classList.remove('trouble');

          _clientWrap.classList.remove('client');

          _clientWrap.classList.remove('client_discount');

          _clientWrap.classList.remove('client_cashback');

          cashbackWrap.classList.remove('client__cashback_active');
          cardValue.classList.remove('client__value_write-off');
          cardValue.classList.remove('client__value_accumulate');

          var _promocodeWrap = document.querySelector('.header__card_promocode');

          _promocodeWrap.classList.remove('promocode');

          clientInput.removeAttribute("disabled");
          clientBtn.removeAttribute("disabled");
          promocodeInput.removeAttribute("disabled");

          _promocodeWrap.removeAttribute("disabled");

          promotion_code = '';
          client = undefined;
          var cardApplyArr = document.querySelectorAll('.header__card_apply');

          if (cardApplyArr.length > 0) {
            cardApplyArr.forEach(function (i) {
              i.classList.remove('header__card_apply');
            });
          }

          inputHeaderArr.forEach(function (e) {
            e.value = '';
          });
          statusСashback = 0; // 0- карты нет

          globalCashback = 0; // общий кэшбек

          balanceFinal = 0; // остаток или накопление баллов клиента

          valueSurrender = 0;
          /*размер сдачи*/

          valueStock = 0;
          /*получено наличных*/

          orderSumFinal = 0; // сумма чека

          promotion_code = ''; //промокод

          ordersArr = []; // глобальный чек

          productArr = []; // текущие товары в чеке

          saleObg = []; // массив скидок

          client = {}; //глобальный объект клиента

          outputValuePaymentArr.forEach(function (e) {
            e.textContent = '0';
          });
          outputValueStockArr.forEach(function (e) {
            e.textContent = 'Получено';
          });
          outputValueSurrenderArr.forEach(function (e) {
            e.textContent = 'Сдача';
          });

          while (wrapReceipt.firstChild) {
            wrapReceipt.removeChild(wrapReceipt.firstChild);
          }

          var resId = '',
              ansId = 0;

          try {
            resId = "SELECT id FROM workday WHERE tokenWorkdayOffline = '".concat(idworkdayOffline, "'");
            ansId = db.query(resId);
          } catch (error) {
            db.conn.close();
            ansId = [{
              id: 1
            }];
          } // создание новоего чека


          q = "INSERT INTO orders (status, currentTable, fiscalPrint, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, email, barista, offreckoning, idworkdayOffline, idworkdayOnline, tokenPoint, initiallyPoints, recordedLoyalty, qrtoken, certificate, endPointsCert, workdayId, recordedCertificate, nameClient) VALUES (0,".concat(currentTable, ",").concat(fiscalPrint, ",0,0,'0',0,0,0,'").concat(mailPoint, "','").concat(barista, "',0,'").concat(idworkdayOffline, "','").concat(idworkdayOnline, "','").concat(tokenPoint, "',0,0,'0',0,0,'").concat(ansId[0].id, "',0, ' ');");
          db.query(q); //берем айди нового чека из таблицы

          q = "SELECT id FROM orders WHERE status = 0 and currentTable = ".concat(currentTable); // alert(JSON.stringify(q))

          ans = db.query(q);
        } catch (e) {
          db.conn.close();
          popup('ошибка внутри функции обновления глобального чека' + e.message);
          logger('ошибка внутри функции обновления глобального чека' + e.message);
        }
      }
    } // обновляет айди чека


    idOrderGlobal = ans[0].id;
    this.orders();
  }; // обновление глобального чека


  this.productArr = function () {
    // alert(`функция Update.productArr`)
    if (idOrderGlobal == undefined) {
      this.idOrder();
    }

    var ans, q;
    var productTableArr = []; //массив для пересбора товаров

    productArr = []; // очищаем глобальный массив

    try {
      q = "SELECT id, idProd, idOrder, name, productCategory, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum FROM orderItem WHERE idOrder = ".concat(idOrderGlobal);
      ans = db.query(q);

      for (var i = 0; ans[i] != undefined; i++) {
        productTableArr.push(ans[i]);
      } // по пришедшим данным заполняем глобальный массив товаров


      productTableArr.forEach(function (e) {
        var newProduct = new Product(e.id, e.idProd, e.idOrder, e.name, e.productCategory, e.bulkvalue, e.bulkuntils, e.price, e.sale, e.debitClientBonus, e.saleMaxPrice, e.interimPrice, e.offreckoningItem, e.cashbackPercent, e.amount, e.priceFinal, e.cashback, e.cashbackSum, e.productSum);
        productArr.push(newProduct);
      }); // alert(JSON.stringify(productArr))
    } catch (e) {
      try {
        db.conn.close();
      } catch (error) {} // alert(`ошибка внутри функции обновления массива товаров ${e.message}`)

    }
  }; // обновление глобального чека, если ничего не передать обновит текущий, иначе смотрим внутри функции


  this.orders = function () {
    // запускаем отправки на сервер
    // alert(`функция Update.orders`)
    if (idOrderGlobal == undefined) {
      this.idOrder();
    }

    var ans, q;
    var ordersTableArr = []; //массив для создания чека
    // переписывание глобальной переменной чека

    try {
      q = "SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = ".concat(idOrderGlobal);
      ans = db.query(q);

      for (var i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }

      ordersArr = [];
      ordersTableArr.forEach(function (e) {
        var order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient);
        ordersArr.push(order);
      });
      var btnClientArr = document.querySelectorAll('.client__btn'); // если есть клиент с накоплением баллов

      if (ordersArr[0].status == 0 && ordersArr[0].idClient > 0 && ordersArr[0].accumClientPoints == 1) {
        statusСashback = 1;
        globalCashback = Number(ordersArr[0].globalCashback);
        balanceFinal = Number(ordersArr[0].clientPoints);
        clientWrap.classList.add('client');
        clientWrap.classList.add('header__card_apply');
        clientWrap.classList.add('client_cashback');
        btnClientArr.forEach(function (j) {
          j.style.display = 'none';
        });
        var value = clientWrap.querySelector('.client__value');
        value.textContent = "\u0411\u0430\u043B\u043B\u043E\u0432:  ".concat(ordersArr[0].clientPoints);
        cashbackWrap.classList.add('client__cashback_active');
      } else if (ordersArr[0].status == 0 && ordersArr[0].idClient > 0 && ordersArr[0].accumClientPoints == 2) {
        statusСashback = 2;
        balanceFinal = Number(ordersArr[0].clientPoints);
        clientWrap.classList.add('client');
        clientWrap.classList.add('header__card_apply');
        clientWrap.classList.add('client_cashback');
        btnClientArr.forEach(function (j) {
          j.style.display = 'none';
        });

        var _value = clientWrap.querySelector('.client__value');

        _value.textContent = "\u0411\u0430\u043B\u043B\u043E\u0432:  ".concat(ordersArr[0].clientPoints); // info.style.display = 'flex'

        cashbackWrap.classList.add('client__cashback_active');
      } else if (ordersArr[0].status == 0 && ordersArr[0].idClient > 0 && ordersArr[0].accumClientPoints == 0) {
        clientWrap.classList.add('client');
        clientWrap.classList.add('header__card_apply');
        clientWrap.classList.add('client_discount');
        btnClientArr.forEach(function (j) {
          j.style.display = 'none';
        });

        var _value2 = clientWrap.querySelector('.client__value_discount');

        _value2.textContent = "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u043B\u0438 \u0441\u043A\u0438\u0434\u043A\u0443";
      }

      if (ordersArr[0].status == 0 && (ordersArr[0].certificate > 0 || ordersArr[0].promo > 0)) {
        var code = ordersArr[0].certificate > 0 ? ordersArr[0].certificate : ordersArr[0].promo;
        logger("\u0417\u0430\u043F\u0440\u043E\u0441 \u043F\u043E \u043F\u0440\u043E\u043C\u043E\u043A\u043E\u0434\u0443 tokenPoint ".concat(tokenPoint, " subdomain ").concat(subdomain, " code ").concat(code));
        checkPromo(tokenPoint, subdomain, code).then(function (e) {
          preloader.preloaderOff();

          if (e.hasOwnProperty('certificate')) {
            try {
              var _q = "UPDATE orders SET offreckoning = ".concat(Number(e.offreckoning), ", endPointsCert = ").concat(Number(e.offreckoning), ", certificate = ").concat(Number(e.certificate), ", recordedCertificate = 1 WHERE id = ").concat(idOrderGlobal);

              try {
                db.query(_q);
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
          popup('Промокод не верный');
        });
      }

      if (ordersArr[0].status == 1 && ordersArr[0].chtype == 1) {
        btnCashNon.classList.add('ready-payment');
        clientInput.setAttribute("disabled", "disabled");
        clientBtn.setAttribute("disabled", "disabled");
        promocodeInput.setAttribute("disabled", "disabled");
        promocodeWrap.setAttribute("disabled", "disabled");
      }

      ;

      if (ordersArr[0].status == 1 && ordersArr[0].chtype == 2) {
        btnQRcode.classList.add('ready-payment');
        clientInput.setAttribute("disabled", "disabled");
        clientBtn.setAttribute("disabled", "disabled");
        promocodeInput.setAttribute("disabled", "disabled");
        promocodeWrap.setAttribute("disabled", "disabled");
      }

      ;
    } catch (e) {
      try {
        db.conn.close();
      } catch (error) {}

      popup("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0447\u0435\u043A\u0430 \u0438\u0437 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445 \u043F\u0440\u0438 ".concat(e.message)); // db.conn.close()
    }
  }; // функция обновления массива скидок. Вызываем при клике на новый товар для перезаписи по айдишникам


  this.saleObg = function () {
    var ans, q;
    var queryArr = '';
    var time = new Date(); // берем текущий час для скидки

    var minutes = "".concat(time.getMinutes());

    if (minutes.length == 1) {
      minutes = "0".concat(minutes);
    }

    var timeRange = Number("".concat(time.getHours()).concat(minutes));
    productArr.forEach(function (item) {
      if (!queryArr) {
        queryArr = "".concat(item.idProd);
      } else {
        queryArr = "".concat(queryArr, ",").concat(item.idProd);
      }
    });
    queryArr = "(".concat(queryArr, ", -1)");
    q = "SELECT techcards_id, MIN(discount) as disc from discounts where weekdays like '%".concat(weekDay, "%' and time_from <= ").concat(Number(timeRange), " and time_to >= ").concat(Number(timeRange), " AND (techcards_id in ").concat(queryArr, ") group by techcards_id");

    try {
      ans = db.query(q);
    } catch (e) {
      db.conn.close();
    }

    var saleObgArr = []; // преобразование ответа в массив

    if (ans) {
      for (var i = 0; ans[i] != undefined; i++) {
        var sale = new Sale(ans[i].techcards_id, ans[i].disc);
        saleObgArr.push(sale);
      }

      saleObg = {};
      saleObgArr.forEach(function (e) {
        saleObg[e.techcards_id] = e.discount;
      });

      if (saleObg[-1]) {
        productArr.forEach(function (e) {
          e.sale = saleObg[-1];
        });
      }

      productArr.forEach(function (e) {
        if (saleObg[e.idProd] && e.sale > saleObg[e.idProd]) {
          e.sale = saleObg[e.idProd];
        }
      });
    }
  };
}();