"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var subfunc = new function () {
  this.getTime = function () {
    // запись времени
    var dataObj = '0';

    if (useAtol && !troubleAtol) {
      var timeAtol = devkkm.atolTime();
      dataObj = new Date(timeAtol);

      if (timeAtol < 0) {
        dataObj = new Date();
      }
    } else {
      dataObj = new Date();
    }

    var hours = "".concat(dataObj.getHours());

    if (hours.length != 2) {
      hours = "0".concat(hours);
    }

    var minutes = "".concat(dataObj.getMinutes());

    if (minutes.length != 2) {
      minutes = "0".concat(minutes);
    }

    var day = "".concat(dataObj.getDate());

    if (day.length != 2) {
      day = "0".concat(day);
    }

    var time = "".concat(hours, ":").concat(minutes);
    var month = "".concat(dataObj.getMonth() + 1);

    if (month.length == 1) {
      month = "0".concat(month);
    }

    var date = "".concat(dataObj.getFullYear(), "-").concat(month, "-").concat(day);
    var unix = Math.floor(dataObj.getTime() / 1000);
    ordersArr[0].time = time;
    ordersArr[0].date = date;
    ordersArr[0].unix = unix;
    return {
      time: time,
      date: date,
      unix: unix
    };
  }; // рандомные символы


  this.random = function () {
    // генератор рандомных символов
    var abc = "abcdefghijklmnopqrstuvwxyz1234567890";
    var rs = "";

    while (rs.length < 8) {
      rs += abc[Math.floor(Math.random() * abc.length)];
    }

    ;
    return rs;
  }; // взять объект чека по статусу или айди


  this.getOrderObg = function (status) {
    var idOrder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var ans, q;
    var ordersTableArr = []; //массив для создания чека

    var ordersArr = []; //выбранный чек
    // запрос по айди

    var qWhere = "status = ".concat(status);

    if (idOrder) {
      qWhere = "id = ".concat(Number(idOrder));
    }

    q = "SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE ".concat(qWhere);
    logger("\u0437\u0430\u043F\u0440\u043E\u0441 \u0447\u0435\u043A\u0430 ".concat(q));

    try {
      ans = db.query(q);

      for (var i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }

      ;
      ordersTableArr.forEach(function (e) {
        var order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient); // создали чек

        ordersArr.push(order);
      });
      return ordersArr[0];
    } catch (e) {
      logger("\u0437\u0430\u043F\u0440\u043E\u0441 \u0447\u0435\u043A\u0430 ".concat(idOrder, " \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F, \u043E\u0448\u0438\u0431\u043A\u0430 ").concat(e.message, " "));

      try {
        db.conn.close();
      } catch (error) {}

      return false;
    }
  }; // взять массив товаров


  this.getProductArr = function (order) {
    try {
      var q = "SELECT id, idProd, idOrder, name, productCategory, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum FROM orderItem WHERE idOrder = ".concat(Number(order.id));
      logger("\u043F\u043E \u0447\u0435\u043A\u0443 ".concat(order.id, " \u0438\u0434\u0435\u043C \u0437\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430\u043C\u0438 ").concat(q));

      try {
        var productAns = db.query(q);
        var productArr = [];
        var productTableArr = [];

        for (var i = 0; productAns[i] != undefined; i++) {
          productTableArr.push(productAns[i]);
        }

        ;
        productTableArr.forEach(function (e) {
          var newProduct = new Product(e.id, e.idProd, e.idOrder, e.name, e.productCategory, e.bulkvalue, e.bulkuntils, e.price, e.sale, e.debitClientBonus, e.saleMaxPrice, e.interimPrice, e.offreckoningItem, e.cashbackPercent, e.amount, e.priceFinal, e.cashback, e.cashbackSum, e.productSum);
          productArr.push(newProduct);
        });
        return productArr;
      } catch (e) {
        try {
          db.conn.close();
        } catch (error) {}

        throw e.message;
      }
    } catch (e) {
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0437\u044F\u0442\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u043F\u043E \u0447\u0435\u043A\u0443, \u043E\u0442\u0432\u0435\u0442 ".concat(e.message, " \u0447\u0435\u043A ").concat(Number(order.id)));
      return false;
    }
  }; // Статистика за день


  this.getDailyStat = function (tokenWorkday) {
    var resp = false;
    var respCash = false;
    var respReturn = false;
    var respCashReturn = false;
    var respQr = false;
    var respQrReturn = false;
    var resSynh = false;
    var sum = 0,
        orders = 0,
        averageOrder = 0,
        cashSum = 0,
        condition = tokenWorkday ? "and idworkdayOffline = '".concat(tokenWorkday, "'") : "and date = '".concat(dateStrGlobal, "'"),
        conditionSynh = tokenWorkday ? "tokenWorkdayOffline = '".concat(tokenWorkday, "'") : "dateDay = '".concat(dateStrGlobal, "'"),
        synhIncomeCash = 0,
        synhRefundCash = 0,
        synhIncomeCashLess = 0,
        synhRefundCashLess = 0,
        cashLessSum = 0,
        cashSumReturn = 0,
        cashLessSumReturn = 0,
        returnSum = 0,
        qrSum = 0,
        qrReturn = 0;

    try {
      resp = db.query("SELECT sum(orderSumFinal) as 'orderSum', count(id) as 'count', avg(orderSumFinal) as 'orderSumAvg' FROM orders WHERE status in(1,2,3) ".concat(condition, " and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, ")"));
      respQr = db.query("SELECT sum(orderSumFinal) as 'orderSum' FROM orders WHERE status in(1,2,3) ".concat(condition, " and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, ") and qrtoken != 0"));
      respCash = db.query("SELECT sum(orderSumFinal) as 'orderSum' FROM orders WHERE status in(1,2,3) ".concat(condition, " and chtype = 0 and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, ")"));
    } catch (e) {
      db.conn.close();
    }

    try {
      respReturn = db.query("SELECT sum(orderSumFinal) as 'orderSum', count(id) as 'count', avg(orderSumFinal) as 'orderSumAvg' FROM orders WHERE status in(-1,-2,4,5) ".concat(condition, " and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, ")"));
      respQrReturn = db.query("SELECT sum(orderSumFinal) as 'orderSum' FROM orders WHERE status in(-1,-2,4,5) ".concat(condition, " and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, ") and qrtoken != 0"));
      respCashReturn = db.query("SELECT sum(orderSumFinal) as 'orderSum' FROM orders WHERE status in(-1,-2,4,5) ".concat(condition, " and chtype = 0 and (writeoffMode is null or writeoffMode = ").concat(writeOffGlobalStat, ")"));
    } catch (e) {
      try {
        db.conn.close();
      } catch (error) {}
    }

    try {
      resSynh = db.query("SELECT sum(synhIncomeCash) as 'synhIncomeCash', sum(synhRefundCash) as 'synhRefundCash', sum(synhIncomeCashLess) as 'synhIncomeCashLess', sum(synhRefundCashLess) as 'synhRefundCashLess' FROM workday WHERE ".concat(conditionSynh));
    } catch (error) {
      db.conn.close();
    }

    if (resp) {
      try {
        sum = resp[0].orderSum > 0 ? resp[0].orderSum : 0;
        orders = resp[0].count;
        averageOrder = resp[0].orderSum > 0 ? Math.floor(Number(resp[0].orderSumAvg)) : 0;

        if (respReturn) {
          returnSum = respReturn[0].orderSum > 0 ? Number(respReturn[0].orderSum) : 0;

          if (respCashReturn) {
            cashSumReturn = respCashReturn[0].orderSum > 0 ? Number(respCashReturn[0].orderSum) : 0;
            cashLessSumReturn = respReturn[0].orderSum > 0 ? Number(respReturn[0].orderSum) - Number(cashSumReturn) : 0;
          } else {
            cashLessSumReturn = respReturn[0].orderSum > 0 ? Number(respReturn[0].orderSum) : 0;
          }
        }

        if (respCash) {
          cashSum = respCash[0].orderSum > 0 ? respCash[0].orderSum : 0;
          cashLessSum = resp[0].orderSum > 0 ? Number(resp[0].orderSum) - Number(cashSum) : 0;
        } else {
          cashSum = 0;
        }
      } catch (error) {
        orders = 0; // кол-во чеков

        averageOrder = 0; //средний чек приход

        sum = 0; // Приход

        cashSum = 0; // приход нал

        cashLessSum = 0; // приход безнал

        returnSum = 0; // возврат

        cashSumReturn = 0, // взврат нал
        cashLessSumReturn = 0; // возврат безнал

        logger('Ошибка в getDailyStat' + error.message);
      }
    } else {
      orders = 0; // кол-во чеков

      averageOrder = 0; //средний чек приход

      sum = 0; // Приход

      cashSum = 0; // приход нал

      cashLessSum = 0; // приход безнал

      returnSum = 0; // возврат

      cashSumReturn = 0, // взврат нал
      cashLessSumReturn = 0; // возврат безнал
    }

    if (resSynh) {
      synhIncomeCash = Number(subfunc.nullToZero(resSynh[0].synhIncomeCash));
      synhRefundCash = Number(subfunc.nullToZero(resSynh[0].synhRefundCash));
      synhIncomeCashLess = Number(subfunc.nullToZero(resSynh[0].synhIncomeCashLess));
      synhRefundCashLess = Number(subfunc.nullToZero(resSynh[0].synhRefundCashLess));
    }

    if (respQr) {
      qrSum = respQr[0].orderSum > 0 ? respQr[0].orderSum : 0;
    }

    if (respQrReturn) {
      qrReturn = respQrReturn[0].orderSum > 0 ? Number(respQrReturn[0].orderSum) : 0;
    }

    logger("\u0412\u0437\u044F\u0442\u0430 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0437\u0430 ".concat(condition));
    return {
      orders: orders,
      averageOrder: averageOrder,
      sum: sum,
      cashSum: cashSum,
      cashLessSum: cashLessSum,
      qrSum: qrSum,
      qrReturn: qrReturn,
      returnSum: returnSum,
      cashSumReturn: cashSumReturn,
      cashLessSumReturn: cashLessSumReturn,
      synhIncomeCash: synhIncomeCash,
      synhRefundCash: synhRefundCash,
      synhIncomeCashLess: synhIncomeCashLess,
      synhRefundCashLess: synhRefundCashLess
    };
  };

  this.greatSynchronizer = function (order, productArr) {
    var valueCashbox = subfunc.getDailyStat().sum;
    var valueFiscal = devkkm.getRevenue().sum;
    var valueWorkday = subfunc.getDailyStat(idworkdayOffline).sum; // по смене

    logger("valueCashbox ".concat(valueCashbox, " valueFiscal ").concat(valueFiscal));

    if (valueFiscal > 0) {
      var difference = Number(valueWorkday) - Number(valueFiscal);

      if (difference < Number(order.orderSumFinal)) {
        difference = Number(valueCashbox) - Number(valueFiscal);
      }

      if (difference >= Number(order.orderSumFinal) && Number(order.orderSumFinal) < 1500) {
        if (devkkm.openOrder(order, productArr)) {
          devkkm.printOrder(order, productArr);
          logger("\u0432 greatSynchronizer \u0447\u0435\u043A ".concat(order.id, " \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F"));
        } else {
          var q = "UPDATE orders SET status = 1 WHERE id = ".concat(order.id);

          try {
            db.query(q);
            logger("\u0432 greatSynchronizer \u0447\u0435\u043A ".concat(order.id, " \u043D\u0435 \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F"));
            logger("\u0441\u0431\u0440\u043E\u0441 \u043D\u0430 \u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430 \u0441 \u0430\u0439\u0434\u0438 ".concat(order.id)); // и пробуем новый чек отправить
          } catch (e) {
            popup("\u043E\u0448\u0438\u0431\u043A\u0430 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u0438 \u0447\u0435\u043A\u0430 ".concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(order)));
            logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0444\u0438\u043A\u0441\u0430\u0446\u0438\u0438 \u0447\u0435\u043A\u0430 ".concat(e.message, " \u0447\u0435\u043A ").concat(JSON.stringify(order)));
          }
        }
      }
    }

    postman.atolOrder();
  };

  this.qualitativeSynchronizer = function (interval) {
    logger("qualitativeSynchronizer \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u043B\u0430\u0441\u044C");
    var curWorkday = dbMethods.getterDb('workday', {
      status: 0
    }, 'dateDay');
    curWorkday = curWorkday[curWorkday.length - 1];

    if (curWorkday != dateStrGlobal) {
      return;
    }

    var q = "SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE status in (1, -1)";

    try {
      ans = db.query(q);
      return false;
    } catch (e) {
      db.conn.close();

      try {
        var day = subfunc.getDailyStat();
        var fiscal = devkkm.getRevenue();
        var workday = subfunc.getDailyStat(idworkdayOffline);
        var local = workday;
        var valueWorkday = workday.sum; // по смене

        var valueCashbox = day.sum;
        var valueFiscal = fiscal.sum;

        if (valueFiscal < 0 || Number(fiscal.cashSum) < 1 && Number(fiscal.nonCashSum) < 1) {
          // филскальник вернул - 1
          return false;
        }

        var change = Number(valueWorkday) - Number(valueFiscal);
        local = workday;

        if (change < 0) {
          change = Number(valueCashbox) - Number(valueFiscal);
          local = day;
        }

        logger("qualitativeSynchronizer change = ".concat(change));

        if (change > 0) {
          // расхождение synhIncome
          var cash = 0;
          var cashLess = 0;
          cash = Number(local.cashSum) + Number(local.cashSumReturn) - Number(fiscal.cashSum);
          cashLess = Number(local.cashLessSum) + Number(local.cashLessSumReturn) - Number(fiscal.nonCashSum);
          logger("qualitativeSynchronizer cash = ".concat(cash, " (").concat(fiscal.cashSum, ") cashLess = ").concat(cashLess, " (").concat(fiscal.nonCashSum, ")"));

          if (cash > 0 && cash < 1500) {
            // кеш чек
            dbMethods.updateDb('workday', _defineProperty({}, "synhIncomeCash", cash), _defineProperty({}, "tokenWorkdayOffline", idworkdayOffline));

            try {
              devkkm.checkState(); //проверка состояния смены
            } catch (e) {
              // какая то ошибка на статусе чека
              return;
            }

            devkkm.Fptr.setParam(1021, '');
            devkkm.Fptr.setParam(1203, '');
            devkkm.Fptr.operatorLogin();
            devkkm.Fptr.setParam(1008, 'orders@coffeeway.ru');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, devkkm.Fptr.LIBFPTR_RT_SELL);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, true);
            devkkm.Fptr.openReceipt();
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_COMMODITY_NAME, 'prodCash');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_PRICE, Number(cash));
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_QUANTITY, 1);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_TAX_TYPE, devkkm.Fptr.LIBFPTR_TAX_NO);
            devkkm.Fptr.registration();
            devkkm.chekClosedOrder(0);
            logger("qualitativeSynchronizer \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F cash = ".concat(cash, " "));
            telegramNote("qualitativeSynchronizer \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F cash = ".concat(cash, " "), '1385389369');
          }

          if (cashLess > 0 && cash < 1500) {
            // безнал чек
            dbMethods.updateDb('workday', _defineProperty({}, "synhIncomeCashLess", cashLess), _defineProperty({}, "tokenWorkdayOffline", idworkdayOffline));

            try {
              devkkm.checkState(); //проверка состояния смены
            } catch (e) {
              // какая то ошибка на статусе чека
              return;
            }

            devkkm.Fptr.setParam(1021, '');
            devkkm.Fptr.setParam(1203, '');
            devkkm.Fptr.operatorLogin();
            devkkm.Fptr.setParam(1008, 'orders@coffeeway.ru');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, devkkm.Fptr.LIBFPTR_RT_SELL);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, true);
            devkkm.Fptr.openReceipt();
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_COMMODITY_NAME, 'prodCash');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_PRICE, Number(cashLess));
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_QUANTITY, 1);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_TAX_TYPE, devkkm.Fptr.LIBFPTR_TAX_NO);
            devkkm.Fptr.registration();
            devkkm.chekClosedOrder(1);
            logger("qualitativeSynchronizer \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F cashLess = ".concat(cashLess, " "));
            telegramNote("qualitativeSynchronizer \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F cashLess = ".concat(cashLess, " "), '1385389369');
          }
        } else if (change < -1) {
          // расхождение synhrefund
          var _cash = 0;
          var _cashLess = 0;
          _cash = Number(fiscal.cashSum) - (Number(local.cashSum) + Number(local.cashSumReturn));
          _cashLess = Number(fiscal.nonCashSum) - (Number(local.cashLessSum) + Number(local.cashLessSumReturn));
          logger("qualitativeSynchronizer(synhrefund) cash = ".concat(_cash, " cashLess = ").concat(_cashLess));

          if (_cash > 0 && _cash < 1500) {
            // кеш чек
            dbMethods.updateDb('workday', _defineProperty({}, "synhRefundCash", _cash), _defineProperty({}, "tokenWorkdayOffline", idworkdayOffline));

            try {
              devkkm.checkState(); //проверка состояния смены
            } catch (e) {
              // какая то ошибка на статусе чека
              return;
            }

            devkkm.Fptr.setParam(1021, '');
            devkkm.Fptr.setParam(1203, '');
            devkkm.Fptr.operatorLogin();
            devkkm.Fptr.setParam(1008, 'orders@coffeeway.ru');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, devkkm.Fptr.LIBFPTR_RT_SELL_RETURN);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, true);
            devkkm.Fptr.openReceipt();
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_COMMODITY_NAME, 'prodCash');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_PRICE, Number(_cash));
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_QUANTITY, 1);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_TAX_TYPE, devkkm.Fptr.LIBFPTR_TAX_NO);
            devkkm.Fptr.registration();
            devkkm.chekClosedOrder(0);
            logger("qualitativeSynchronizer(synhrefund) \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F cash = ".concat(_cash, " "));
            telegramNote("qualitativeSynchronizer(synhrefund) \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F cash = ".concat(_cash, " "), '1385389369');
          }

          if (_cashLess > 0 && _cashLess < 1500) {
            // безнал чек
            dbMethods.updateDb('workday', _defineProperty({}, "synhRefundCashLess", _cashLess), _defineProperty({}, "tokenWorkdayOffline", idworkdayOffline));

            try {
              devkkm.checkState(); //проверка состояния смены
            } catch (e) {
              // какая то ошибка на статусе чека
              return;
            }

            devkkm.Fptr.setParam(1021, '');
            devkkm.Fptr.setParam(1203, '');
            devkkm.Fptr.operatorLogin();
            devkkm.Fptr.setParam(1008, 'orders@coffeeway.ru');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, devkkm.Fptr.LIBFPTR_RT_SELL_RETURN);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, true);
            devkkm.Fptr.openReceipt();
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_COMMODITY_NAME, 'prodCash');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_PRICE, Number(_cashLess));
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_QUANTITY, 1);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_TAX_TYPE, devkkm.Fptr.LIBFPTR_TAX_NO);
            devkkm.Fptr.registration();
            devkkm.chekClosedOrder(1);
            logger("qualitativeSynchronizer(synhrefund) \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F cashLess = ".concat(_cashLess, " "));
            telegramNote("qualitativeSynchronizer(synhrefund) \u043F\u0440\u043E\u043F\u0435\u0447\u0430\u0442\u0430\u043B\u0441\u044F cashLess = ".concat(_cashLess, " "), '1385389369');
          }
        }
      } catch (e) {
        logger("qualitativeSynchronizer \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F ".concat(e.message));
      }
    }
  };

  this.nullToZero = function (x) {
    var a = 0;
    if (x != 'null') return x;
    return a;
  };

  this.orderIfFormat = function (idOrder) {
    var id = "".concat(idOrder);

    if (id.length < 3) {
      if (id.length < 2) {
        id = '00' + id;
      } else {
        id = '0' + id;
      }
    }

    return id.slice(-3);
  };
}();