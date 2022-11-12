const subfunc = new function() {
  this.getTime = function() {
    // запись времени
    let dataObj = '0';
    if(useAtol && !troubleAtol) {
      let timeAtol = devkkm.atolTime();
      dataObj = new Date(timeAtol);
      if (timeAtol < 0) {
       dataObj = new Date();
      }
    } else {
      dataObj = new Date();
    }
    let hours = `${dataObj.getHours()}`;
    if(hours.length != 2) {
      hours = `0${hours}`;
    }
    let minutes = `${dataObj.getMinutes()}`;
    if(minutes.length != 2) {
      minutes = `0${minutes}`;
    }
    let day = `${dataObj.getDate()}`;
    if(day.length != 2) {
      day = `0${day}`;
    }
    let time = `${hours}:${minutes}`;
    let month = `${dataObj.getMonth()+1}`;
    if (month.length == 1) {
      month = `0${month}`;
    }
    let date = `${dataObj.getFullYear()}-${month}-${day}`;
    let unix = Math.floor(dataObj.getTime()/1000);

    ordersArr[0].time = time;
    ordersArr[0].date = date;
    ordersArr[0].unix = unix;
    return {time:time, date:date, unix:unix};
  };
  // рандомные символы
  this.random = function() {
    // генератор рандомных символов
    const abc = "abcdefghijklmnopqrstuvwxyz1234567890";
    let rs = "";
    while (rs.length < 8) {
      rs += abc[Math.floor(Math.random() * abc.length)];
    };
    return rs;
  };
  // взять объект чека по статусу или айди
  this.getOrderObg = function(status, idOrder = false) {
    let ans, q;
    let ordersTableArr = []; //массив для создания чека
    let ordersArr = []; //выбранный чек
    // запрос по айди
    let qWhere = `status = ${status}`;
    if (idOrder) {
      qWhere = `id = ${Number(idOrder)}`;
    }
    q = `SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE ${qWhere}`;
    logger(`запрос чека ${q}`);
    try {
      ans = db.query(q);
      for( let i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      };
      ordersTableArr.forEach((e) => {
        let order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient);
        // создали чек
        ordersArr.push(order);
      });
    return ordersArr[0];
    } catch (e) {
      logger(`запрос чека ${idOrder} не удался, ошибка ${e.message} `);
      try {
        db.conn.close()
      } catch (error) {

      }
      return false;
    }
  };
  // взять массив товаров
  this.getProductArr = function(order) {
    try {
      let q = `SELECT id, idProd, idOrder, name, productCategory, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum FROM orderItem WHERE idOrder = ${Number(order.id)}`;
      logger(`по чеку ${order.id} идем за продуктами ${q}`);
      try {
        let productAns = db.query(q);
        let productArr = [];
        let productTableArr = [];
        for( let i = 0; productAns[i] != undefined; i++) {
          productTableArr.push(productAns[i]);
        };
        productTableArr.forEach((e) => {
          let newProduct = new Product(e.id, e.idProd, e.idOrder, e.name, e.productCategory, e.bulkvalue, e.bulkuntils, e.price, e.sale, e.debitClientBonus, e.saleMaxPrice, e.interimPrice, e.offreckoningItem, e.cashbackPercent, e.amount, e.priceFinal, e.cashback, e.cashbackSum, e.productSum);
          productArr.push(newProduct);
        });
        return productArr;
      } catch(e){
        try {
          db.conn.close()
        } catch (error) {

        }
        throw e.message
      }
    } catch (e) {
      logger(`Ошибка взятия товаров по чеку, ответ ${e.message} чек ${Number(order.id)}`);
      return false;
    }
  }
  // Статистика за день
  this.getDailyStat = function(tokenWorkday) {
    let resp = false;
    let respCash = false;
    let respReturn = false;
    let respCashReturn = false;
    let respQr = false;
    let respQrReturn = false;
    let resSynh = false;
    let sum = 0, orders = 0, averageOrder = 0, cashSum = 0, condition = tokenWorkday ? `and idworkdayOffline = '${tokenWorkday}'`: `and date = '${dateStrGlobal}'`,
    conditionSynh = tokenWorkday ? `tokenWorkdayOffline = '${tokenWorkday}'`: `dateDay = '${dateStrGlobal}'`, synhIncomeCash = 0, synhRefundCash = 0, synhIncomeCashLess = 0,
    synhRefundCashLess = 0, cashLessSum = 0, cashSumReturn = 0, cashLessSumReturn = 0, returnSum = 0, qrSum = 0, qrReturn = 0;

    try {
      resp = db.query(`SELECT sum(orderSumFinal) as 'orderSum', count(id) as 'count', avg(orderSumFinal) as 'orderSumAvg' FROM orders WHERE status in(1,2,3) ${condition} and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat})`);
      respQr = db.query(`SELECT sum(orderSumFinal) as 'orderSum' FROM orders WHERE status in(1,2,3) ${condition} and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat}) and qrtoken != 0`);
      respCash = db.query(`SELECT sum(orderSumFinal) as 'orderSum' FROM orders WHERE status in(1,2,3) ${condition} and chtype = 0 and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat})`)
    } catch (e) {
      db.conn.close();
    }
    try {
      respReturn = db.query(`SELECT sum(orderSumFinal) as 'orderSum', count(id) as 'count', avg(orderSumFinal) as 'orderSumAvg' FROM orders WHERE status in(-1,-2,4,5) ${condition} and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat})`);
      respQrReturn = db.query(`SELECT sum(orderSumFinal) as 'orderSum' FROM orders WHERE status in(-1,-2,4,5) ${condition} and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat}) and qrtoken != 0`);
      respCashReturn = db.query(`SELECT sum(orderSumFinal) as 'orderSum' FROM orders WHERE status in(-1,-2,4,5) ${condition} and chtype = 0 and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat})`)
    } catch (e) {
      try {
        db.conn.close();
      } catch (error) {

      }
    }
    try {
      resSynh = db.query(`SELECT sum(synhIncomeCash) as 'synhIncomeCash', sum(synhRefundCash) as 'synhRefundCash', sum(synhIncomeCashLess) as 'synhIncomeCashLess', sum(synhRefundCashLess) as 'synhRefundCashLess' FROM workday WHERE ${conditionSynh}`)
    } catch (error) {
      db.conn.close();
    }
    if(resp) {
      try {
        sum = resp[0].orderSum > 0 ? resp[0].orderSum : 0;
        orders = resp[0].count;
        averageOrder = resp[0].orderSum > 0 ? Math.floor(Number(resp[0].orderSumAvg)): 0;
        if(respReturn) {
          returnSum = respReturn[0].orderSum > 0 ? Number(respReturn[0].orderSum) : 0;
          if(respCashReturn) {
            cashSumReturn = respCashReturn[0].orderSum > 0 ? Number(respCashReturn[0].orderSum) : 0;
            cashLessSumReturn = respReturn[0].orderSum > 0 ? Number(respReturn[0].orderSum) - Number(cashSumReturn) : 0;
          } else {
            cashLessSumReturn = respReturn[0].orderSum > 0 ? Number(respReturn[0].orderSum) : 0;
          }
        }
        if(respCash) {
          cashSum = respCash[0].orderSum > 0 ? respCash[0].orderSum: 0;
          cashLessSum = resp[0].orderSum > 0 ? Number(resp[0].orderSum) - Number(cashSum) : 0;
        } else {
          cashSum = 0;
        }
        } catch (error) {
          orders = 0; // кол-во чеков
          averageOrder = 0; //средний чек приход
          sum = 0 // Приход
          cashSum = 0; // приход нал
          cashLessSum = 0 // приход безнал
          returnSum = 0 // возврат
          cashSumReturn = 0, // взврат нал
          cashLessSumReturn = 0; // возврат безнал
          logger('Ошибка в getDailyStat'+error.message);
        }
    } else {
      orders = 0; // кол-во чеков
      averageOrder = 0; //средний чек приход
      sum = 0 // Приход
      cashSum = 0; // приход нал
      cashLessSum = 0 // приход безнал
      returnSum = 0 // возврат
      cashSumReturn = 0, // взврат нал
      cashLessSumReturn = 0; // возврат безнал
    }
    if(resSynh) {
      synhIncomeCash = Number(subfunc.nullToZero(resSynh[0].synhIncomeCash));
      synhRefundCash = Number(subfunc.nullToZero(resSynh[0].synhRefundCash));
      synhIncomeCashLess = Number(subfunc.nullToZero(resSynh[0].synhIncomeCashLess));
      synhRefundCashLess = Number(subfunc.nullToZero(resSynh[0].synhRefundCashLess));
    }
    if(respQr) {
      qrSum = respQr[0].orderSum > 0 ? respQr[0].orderSum : 0;
    }
    if(respQrReturn) {
      qrReturn = respQrReturn[0].orderSum > 0 ? Number(respQrReturn[0].orderSum) : 0;
    }

    logger(`Взята статистика за ${condition}`)
    return {
      orders: orders,
      averageOrder: averageOrder,
      sum: sum,
      cashSum: cashSum,
      cashLessSum: cashLessSum,
      qrSum:qrSum,
      qrReturn:qrReturn,
      returnSum: returnSum,
      cashSumReturn: cashSumReturn,
      cashLessSumReturn: cashLessSumReturn,
      synhIncomeCash: synhIncomeCash,
      synhRefundCash: synhRefundCash,
      synhIncomeCashLess: synhIncomeCashLess,
      synhRefundCashLess: synhRefundCashLess,
    }
  }
  this.greatSynchronizer = function (order, productArr) {
    let valueCashbox = subfunc.getDailyStat().sum;
    let valueFiscal = devkkm.getRevenue().sum;
    let valueWorkday = subfunc.getDailyStat(idworkdayOffline).sum; // по смене
    logger(`valueCashbox ${valueCashbox} valueFiscal ${valueFiscal}`)
    if (valueFiscal > 0) {
      let difference = Number(valueWorkday) - Number(valueFiscal);
      if(difference < Number(order.orderSumFinal)) {
        difference = Number(valueCashbox) - Number(valueFiscal);
      }
      if (difference >= Number(order.orderSumFinal) && Number(order.orderSumFinal) < 1500) {
        if (devkkm.openOrder(order, productArr)) {
          devkkm.printOrder(order, productArr);
          logger(`в greatSynchronizer чек ${order.id} пропечатался`)
        } else {
          let q = `UPDATE orders SET status = 1 WHERE id = ${order.id}`;
          try {
            db.query(q);
            logger(`в greatSynchronizer чек ${order.id} не пропечатался`)
            logger(`сброс на печать чека с айди ${order.id}`)
            // и пробуем новый чек отправить
          } catch (e) {
            popup(`ошибка фиксации чека ${e.message} чек ${JSON.stringify(order)}`);
            logger(`ошибка фиксации чека ${e.message} чек ${JSON.stringify(order)}`);
          }
        }
      }
    }
    postman.atolOrder();
  }
  this.qualitativeSynchronizer = function (interval) {
    logger(`qualitativeSynchronizer запустилась`)
    let curWorkday = dbMethods.getterDb('workday', {status: 0}, 'dateDay')
    curWorkday = curWorkday[curWorkday.length - 1]
    if(curWorkday != dateStrGlobal) {
      return;
    }
    let q = `SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE status in (1, -1)`;
    try {
      ans = db.query(q);
      return false;
    } catch (e) {
      db.conn.close()
      try {
        let day = subfunc.getDailyStat();
        let fiscal = devkkm.getRevenue();
        let workday = subfunc.getDailyStat(idworkdayOffline);
        let local = workday;
        let valueWorkday = workday.sum; // по смене
        let valueCashbox = day.sum;
        let valueFiscal = fiscal.sum;

        if(valueFiscal < 0 || (Number(fiscal.cashSum) < 1 && Number(fiscal.nonCashSum) < 1)) { // филскальник вернул - 1
          return false;
        }
        let change = Number(valueWorkday) - Number(valueFiscal);
        local = workday;
        if (change < 0) {
          change = Number(valueCashbox) - Number(valueFiscal);
          local = day;
        }
        logger(`qualitativeSynchronizer change = ${change}`)
        if (change > 0) { // расхождение synhIncome
          let cash = 0;
          let cashLess = 0;
          cash = (Number(local.cashSum) + Number(local.cashSumReturn)) - Number(fiscal.cashSum)
          cashLess = (Number(local.cashLessSum) + Number(local.cashLessSumReturn)) - Number(fiscal.nonCashSum)
           logger(`qualitativeSynchronizer cash = ${cash} (${fiscal.cashSum}) cashLess = ${cashLess} (${fiscal.nonCashSum})`)

          if (cash > 0 && cash < 1500) { // кеш чек

            dbMethods.updateDb('workday', {[`synhIncomeCash`]: cash}, {[`tokenWorkdayOffline`]: idworkdayOffline})
            try{
              devkkm.checkState(); //проверка состояния смены
            } catch(e) {
              // какая то ошибка на статусе чека
              return
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
            devkkm.chekClosedOrder(0)
            logger(`qualitativeSynchronizer пропечатался cash = ${cash} `)
            telegramNote(`qualitativeSynchronizer пропечатался cash = ${cash} `, '1385389369')

          }
          if (cashLess > 0 && cash < 1500) { // безнал чек
            dbMethods.updateDb('workday', {[`synhIncomeCashLess`]: cashLess}, {[`tokenWorkdayOffline`]: idworkdayOffline})
            try{
              devkkm.checkState(); //проверка состояния смены
            } catch(e) {
              // какая то ошибка на статусе чека
              return
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
            devkkm.chekClosedOrder(1)
            logger(`qualitativeSynchronizer пропечатался cashLess = ${cashLess} `)
            telegramNote(`qualitativeSynchronizer пропечатался cashLess = ${cashLess} `, '1385389369')

          }
        } else if (change < -1) { // расхождение synhrefund
          let cash = 0;
          let cashLess = 0;
          cash = Number(fiscal.cashSum) - (Number(local.cashSum) + Number(local.cashSumReturn))
          cashLess = Number(fiscal.nonCashSum) - (Number(local.cashLessSum) + Number(local.cashLessSumReturn))
           logger(`qualitativeSynchronizer(synhrefund) cash = ${cash} cashLess = ${cashLess}`)
          if (cash > 0 && cash < 1500) { // кеш чек
            dbMethods.updateDb('workday', {[`synhRefundCash`]: cash}, {[`tokenWorkdayOffline`]: idworkdayOffline})
            try{
              devkkm.checkState(); //проверка состояния смены
            } catch(e) {
              // какая то ошибка на статусе чека
              return
            }
            devkkm.Fptr.setParam(1021, '');
            devkkm.Fptr.setParam(1203, '');
            devkkm.Fptr.operatorLogin();
            devkkm.Fptr.setParam(1008, 'orders@coffeeway.ru');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, devkkm.Fptr.LIBFPTR_RT_SELL_RETURN);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, true);
            devkkm.Fptr.openReceipt();
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_COMMODITY_NAME, 'prodCash');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_PRICE, Number(cash));
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_QUANTITY, 1);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_TAX_TYPE, devkkm.Fptr.LIBFPTR_TAX_NO);
            devkkm.Fptr.registration();
            devkkm.chekClosedOrder(0)
            logger(`qualitativeSynchronizer(synhrefund) пропечатался cash = ${cash} `)
            telegramNote(`qualitativeSynchronizer(synhrefund) пропечатался cash = ${cash} `, '1385389369')
          }
          if (cashLess > 0 && cashLess < 1500) { // безнал чек
            dbMethods.updateDb('workday', {[`synhRefundCashLess`]: cashLess}, {[`tokenWorkdayOffline`]: idworkdayOffline})
            try{
              devkkm.checkState(); //проверка состояния смены
            } catch(e) {
              // какая то ошибка на статусе чека
              return
            }
            devkkm.Fptr.setParam(1021, '');
            devkkm.Fptr.setParam(1203, '');
            devkkm.Fptr.operatorLogin();
            devkkm.Fptr.setParam(1008, 'orders@coffeeway.ru');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_TYPE, devkkm.Fptr.LIBFPTR_RT_SELL_RETURN);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_RECEIPT_ELECTRONICALLY, true);
            devkkm.Fptr.openReceipt();
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_COMMODITY_NAME, 'prodCash');
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_PRICE, Number(cashLess));
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_QUANTITY, 1);
            devkkm.Fptr.setParam(devkkm.Fptr.LIBFPTR_PARAM_TAX_TYPE, devkkm.Fptr.LIBFPTR_TAX_NO);
            devkkm.Fptr.registration();
            devkkm.chekClosedOrder(1)
            logger(`qualitativeSynchronizer(synhrefund) пропечатался cashLess = ${cashLess} `)
            telegramNote(`qualitativeSynchronizer(synhrefund) пропечатался cashLess = ${cashLess} `, '1385389369')
          }
        }
      } catch (e) {
        logger(`qualitativeSynchronizer не удался ${e.message}`)
      }
    }
  }
  this.nullToZero = (x) => {
    let a = 0;
    if(x != 'null') return x
    return a;
  }
  this.orderIfFormat = (idOrder) => {
    let id = `${idOrder}`
    if(id.length < 3) {
      if(id.length < 2) {
        id = '00'+id
      } else {
        id = '0'+id
      }
    }
    return id.slice(-3);
  }
};