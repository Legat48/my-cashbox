// класс для доотправки данных на сервер, атол и лояльность
const postman = new function() {
  this.loyalityOrder = function() {
    if(!onlineSystem) {
      clearTimeout(delayPostmanLoyalityOrder)
      delayPostmanLoyalityOrder = setTimeout(postman.loyalityOrder, 121111) // повторная попытка отправки через 2 минуты
      return;
    }
    let ans, q; // готовим запросы
    let ordersTableArr = []; //массив для создания чека
    let ordersArr = []; //чек который полетит на сервер
    try {
      // запрос чека готового к отправке на сервер
      q = `SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status in (1, 2, 3) and accumClientPoints in (1, 2) and recordedLoyalty = 0)`
      // logger(`запрос отправщика в систему лояльности ${q}`)
      ans = db.query(q);
      for( let i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }
      ordersTableArr.forEach((e) => {
        let order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient);
        // создали чек
        ordersArr.push(order);
      })
      const param = new LoyaltyRequest(ordersArr[0]); // создание объекта транзакции
      logger(`Отправка на лояльность для накопления баллов ${JSON.stringify(param)}`);
      // товары из базы данных берутся в транзакции
      return new Promise(function(resolve, reject){
        ieFetch({
          method : 'POST',
          url: `https://loyalclient.apptor.tech/integration/cw/transaction/create`,
          headerApikey:  "apikey",
          key: "a808d35874bfb2b3ab492ec5ed23486dff0025e40527d2f677bc7e954e3c0a23",
          headerType: "Content-Type",
          type: "application/json",
          send: JSON.stringify(param),
        })
        .then((json) => {
          logger(`Ответ на лояльность для накопления баллов ${JSON.stringify(json)}`)
          let ans = JSON.parse(json);
          if (ans.success === true) {
            //пришел успешный ответ - записали статус 3
            popup('баллы записаны')
            q = `UPDATE orders SET recordedLoyalty = 1 WHERE id = ${Number(ordersArr[0].id)}`;
            try {
              db.query(q);
              // вызываем себя снова
              clearTimeout(delayPostmanLoyalityOrder)
              delayPostmanLoyalityOrder = setTimeout(postman.loyalityOrder, 7530)
            } catch (e) {
              logger(`Ошибка при записи чека в отправщике на лояльность ${e.message} чек ${JSON.stringify(ordersArr[0])} ответ ${json}`)

            }
          }
          return;
        }).catch((e) => {
          logger(`Ошибка на лояльность для накопления баллов ${JSON.stringify(e)}`);
          clearTimeout(delayPostmanLoyalityOrder)
          delayPostmanLoyalityOrder = setTimeout(postman.loyalityOrder, 7530);
          return;
        })
      })
	  } catch (e) {
      try {
        db.conn.close()
      } catch (error) {

      }
      clearTimeout(delayPostmanLoyalityOrder)
      delayPostmanLoyalityOrder = setTimeout(postman.loyalityOrder, 27530);
      // alert("Ошибка отправки чеков на сервер \n"+e.message);
      return false;
	  }
  }
  // отправщик на сервер чеков
  this.serverOrder = function() {
    if(!onlineSystem) {
      clearTimeout(delayPostmanServerOrder)
      delayPostmanServerOrder = setTimeout(postman.serverOrder, 123456)
      return;
    }
    let ans, q; // готовим запросы
    let ordersTableArr = []; //массив для создания чека
    let ordersArr = []; //чек который полетит на сервер
    try {
      // запрос чека готового к отправке на сервер
      q = `SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status in (-2 , 2))`
      // logger(`запрос отправщик на сервер чеков ${q}`)
      ans = db.query(q);
      for( let i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }
      ordersTableArr.forEach((e) => {
        let order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient);
        // создали чек
        ordersArr.push(order);
      })

      try {
        q = `SELECT id, idProd, idOrder, name, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum FROM orderItem WHERE idOrder = ${Number(ordersArr[0].id)}`
        logger(` в отправщике ,по чеку идем за продуктами ${q}`)
        let productAns;
        try {
          productAns = db.query(q);
        } catch(e){
          db.conn.close();
          q = `UPDATE orders SET status = 6 WHERE id = ${Number(ordersArr[0].id)}`;
          logger(`Ошибка взятия товаров по чеку, ответ ${productAns} чек ${Number(ordersArr[0].id)} чек будет сброшен ${q}`);
          db.query(q);
          clearTimeout(delayPostmanServerOrder);
          delayPostmanServerOrder = setTimeout(postman.serverOrder, 13937);
          return
        }
      } catch (e) {
        try {
          db.conn.close();
        } catch (error) {

        }
        logger(`Ошибка взятия товаров по чеку, ответ ${productAns} чек ${Number(ordersArr[0].id)} чек не будет сброшен`);
      }
      const param = new Transaction(ordersArr[0]); // создание объекта транзакции
      // товары из базы данных берутся в транзакции
      logger(` Отправка транзации по адресу : https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain} в теле: ${JSON.stringify(param)}`)
      return new Promise(function(resolve, reject){
        ieFetch({
          method : 'POST',
          url: `https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain}`,
          headerType: "Content-Type",
          type: "application/json",
          send: JSON.stringify(param),
        })
        .then((json) => {
          let ans = JSON.parse(json);
          if (ans.type === 'success') {
            //пришел успешный ответ - записали статус 3
            popup(`Чек номер ${Number(ordersArr[0].id)} записан на сервере`);
            if (ordersArr[0].status == 2) {
              q = `UPDATE orders SET status = 3 WHERE id = ${Number(ordersArr[0].id)}`;
              try {
                db.query(q);
              } catch (e) {
                popup('Ошибка в postman>serverOrder'+e.message);
              }
            } else if (ordersArr[0].status == -2 ){
              q = `UPDATE orders SET status = 4 WHERE id = ${Number(ordersArr[0].id)}`;
              try {
                db.query(q);
              } catch (e) {
                popup('ошибка апдейта после записи атола'+  e.message);
                logger('ошибка апдейта после записи атола'+  e.message);
              }
            }
            try {
              db.query(q);
            } catch (e) {
              popup('Ошибка в postman>serverOrder'+e.message)
            }
            // вызываем себя снова
            clearTimeout(delayPostmanServerOrder)
            delayPostmanServerOrder = setTimeout(postman.serverOrder, 13937);
          }
          return;
        }).catch((e) => {
          logger(`Ошибка транзакции${JSON.stringify(e)}`);
          clearTimeout(delayPostmanServerOrder);
          delayPostmanServerOrder = setTimeout(postman.serverOrder, 13937);
          return;
        });
      });
	  } catch (e) {
      try {
        db.conn.close()
      } catch (error) {

      }
      clearTimeout(delayPostmanServerOrder);
      delayPostmanServerOrder = setTimeout(postman.serverOrder, 13937);
      return false;
	  }
  }
  // отмена чека
  this.serverOrderCancel = function() {
    // popup('функция отмены чека запустилась')
    if(!onlineSystem) {
      clearTimeout(delayPostmanServerOrderCancel)
      delayPostmanServerOrderCancel = setTimeout(postman.serverOrderCancel, 7377)
      return;
    }
    let ans, q; // готовим запросы
    let ordersTableArr = []; //массив для создания чека
    let ordersArr = [] //чек который полетит на сервер
    try {
      // запрос чека готового к отправке на сервер
      q = `SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status = 4)`
      // logger(`запрос отправщик отмены чека ${q}`);
      ans = db.query(q);
      // alert(` not my ответ на чек который подойдет на отправку${JSON.stringify(ans)}`)
      for( let i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }
      ordersTableArr.forEach((e) => {
        let order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient);
        // создали чек
        ordersArr.push(order);
      })
      return new Promise(function(resolve, reject){
        ieFetch({
          method : 'GET',
          url: `https://cwflow.apiloc.ru/api/terminal/refunds/create_uniqid?token=${ordersArr[0].tokenPoint}&transaction=${ordersArr[0].id}${ordersArr[0].hashcode}`,
          headerType: "Content-Type",
          type: "application/json",
          send: 'data',
        })
        .then((json) => {
          let ans = JSON.parse(json);
          if (ans.type === 'success') {
            //пришел успешный ответ - записали статус 5
            popup(`Отмена чека ${Number(ordersArr[0].id)} записана`);
            q = `UPDATE orders SET status = 5 WHERE id = ${Number(ordersArr[0].id)}`;
            db.query(q);
            // вызываем себя снова
            clearTimeout(delayPostmanServerOrderCancel)
            delayPostmanServerOrderCancel = setTimeout(postman.serverOrderCancel, 27377);
          } else {
            let msg = ans.data.msg
            if(msg === 'Транзакция не найдена.') {
              telegramNote('Транзакция не найдена:'+ordersArr[0].id+ordersArr[0].hashcode+'/'+ordersArr[0].date, '1385389369')
              q = `UPDATE orders SET status = 5 WHERE id = ${Number(ordersArr[0].id)}`;
              db.query(q);
            }
          }
          return;
        }).catch((e) => {
          clearTimeout(delayPostmanServerOrderCancel)
          delayPostmanServerOrderCancel = setTimeout(postman.serverOrderCancel, 27377);
          return
        })
      })
	  } catch (e) {
      db.conn.close()
      clearTimeout(delayPostmanServerOrderCancel)
      delayPostmanServerOrderCancel = setTimeout(postman.serverOrderCancel, 47377);
      return false;
	  }
  };
  // отправщик на атол
  this.atolOrder = function() {
    if (useAtol && troubleAtol) {
      let order = false;
      let productArr = false;
      order = subfunc.getOrderObg(1);
      if (order) {
        productArr = subfunc.getProductArr(order);
        if (productArr) {
          popup('отправка чека на печать');
          logger(`печать чека с айди ${order.id}`)
          if (devkkm.openOrder(order, productArr)) {
            devkkm.printOrder(order, productArr)
            let q = `UPDATE orders SET status = 2 WHERE id = ${order.id}`;
            postman.displayOrder(order, productArr)
            try {
              db.query(q);
              logger(`фиксация чека с айди ${order.id}`)
              // и пробуем новый чек отправить
              clearTimeout(delayPostmanAtolOrder);
              delayPostmanAtolOrder = setTimeout(postman.atolOrder, 12777);
            } catch (e) {
              popup(`ошибка фиксации чека ${e.message} чек ${JSON.stringify(order)}`);
              logger(`ошибка фиксации чека ${e.message} чек ${JSON.stringify(order)}`);
            }
          } else {
            popup('печать чека не удалась, проверьте фискальный регистратор и перезапустите кассу(закрыть 2 окна)! ');
            clearTimeout(delayPostmanAtolOrder);
            delayPostmanAtolOrder = setTimeout(postman.atolOrder, 15777);
          }
        } else {
          popup(`Ошибка получения товаров по чеку ${order.id}. Синхронизатор чеков остановлен`);
        }
      } else {
        order = subfunc.getOrderObg(-1);
        if (order) {
          logger(`282ст печать чека с айди ${order.id}`)
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
            popup(`Ошибка получения товаров по чеку ${order.id}. Синхронизатор чеков остановлен`);
          }
        } else {
          troubleAtol = 0;
          document.querySelector('#trouble-atol-toggle').checked = false;
          telegramNote('Аварийный режим атола отключён')
          dbMethods.updateDb('settings', {value: 0}, { variable: 'troubleAtol' } );
          popup('Синхронизация остановлена, касса переведена в безаварийный режим');
        }
      }
    }
  };
  // отправщик списаний с сертификатов
  this.certificateOrder = function() {
    if(!onlineSystem) {
      clearTimeout(delayPostmanCertificateOrder)
      delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 121111) // повторная попытка отправки через 2 минуты
      return;
    }
    let ans, q; // готовим запросы
    let ordersTableArr = []; //массив для создания чека
    let ordersArr = []; //чек который полетит на сервер
    try {
      // запрос чека готового к отправке на сервер
      q = `SELECT id, time, date, offreckoning, certificate, tokenPoint, hashCode, tokenPoint, endPointsCert FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status in (1, 2, 3) and (recordedCertificate = 1 and certificate != 0))`
      // logger(`запрос отправщика в систему сертификатов ${q}`)
    try {
      ans = db.query(q);
    } catch (error) {
      db.conn.close();
      ans = [];
      clearTimeout(delayPostmanCertificateOrder)
      delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 27530);
      return
    }
      for( let i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }
      ordersTableArr.forEach((e) => {
        let order = {
          id: e.id,
          sertificate_code: e.certificate,
          sum: Number(e.offreckoning) - Number(e.endPointsCert),
          transaction: `${Number(e.id)}${e.hashcode}`,
          date: `${e.date}-${e.time}`,
          token: e.tokenPoint,
          key: 'Njim99',
          }
        ordersArr.push(order);
      })
      const param = ordersArr[0];
      if(!param) {
        clearTimeout(delayPostmanCertificateOrder)
        delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 27530);
        return
      }
      logger(`Отправка на certificateOrder ${JSON.stringify(param)}`)
      return new Promise(function(resolve, reject){
        ieFetch({
          method : 'POST',
          url: `https://bridge.cwsystem.ru/engine/kassa/sertificate/backend/remove`,
          send: JSON.stringify(param),
        })
        .then((json) => {
          let ans = JSON.parse(json);
          if (ans.type === 'error') {
            logger(`Ответ в certificateOrder ${JSON.stringify(ans)}`)
            if(ans.code == 501) {
              q = `UPDATE orders SET recordedCertificate = 2 WHERE id = ${Number(ordersArr[0].id)}`;
              db.query(q);
              // вызываем себя снова
              clearTimeout(delayPostmanCertificateOrder)
              delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 15233)
              return
            } else {
              clearTimeout(delayPostmanCertificateOrder)
              delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 15123)
            }
          } else {
            logger(`Ответ в certificateOrder ${JSON.stringify(ans)}`)
            if(ans.code == 200) {
              q = `UPDATE orders SET recordedCertificate = 2 WHERE id = ${Number(ordersArr[0].id)}`;
              db.query(q);
              clearTimeout(delayPostmanCertificateOrder)
              delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 15433)
              popup(`Баллы сертификата ${e.certificate} списаны`)
              logger(`Баллы сертификата ${e.certificate} списаны`)
            }
          }
          return;
        }).catch((e) => {
          try {
            db.conn.close()
            popup(`Ошибка при списании баллов ${e.certificate} \n ${e.message}`)
            logger(`Ошибка при списании баллов ${e.certificate} \n ${e.message}`)
          } catch (error) {

          }
          clearTimeout(delayPostmanCertificateOrder)
          delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 27530);
          return false;
        })
      })
	  } catch (e) {
      try {
        db.conn.close()
        popup(`Ошибка при списании баллов ${e.certificate} \n ${e.message}`)
        logger(`Ошибка при списании баллов ${e.certificate} \n ${e.message}`)
      } catch (error) {

      }
      clearTimeout(delayPostmanCertificateOrder)
      delayPostmanCertificateOrder = setTimeout(postman.certificateOrder, 27530);
      return false;
	  }
  }
  // отправщик чеков на кухню
  this.displayOrder = (order,productsArr) => {
    if(!useDisplayOrder) {
      return
    }

    const orderObj = {
      id: subfunc.orderIfFormat(order.id),
      point: `${pointCashbox}`,
      date: `${order.date}`,
      time: `${order.time}`,
      items : productsArr.map((i) => {
        let bulkValue = '';
        if(i.bulkuntils != 'шт') {
          bulkValue = `${i.bulkvalue || ''}${i.bulkuntils || ''}`
        }
        return {
          name: `${i.name} ${bulkValue}`,
          count: `${i.amount}`,
        }
      }),
    }
    // popup(`Отправка чека ${JSON.stringify(orderObj)} на экран кухни`);
    // logger(`Отправка чека ${JSON.stringify(orderObj)} на экран кухни`)

    return new Promise(function(resolve, reject){
      ieFetch({
        method : 'POST',
        url: `${displayAddress}?addorderinbase=1&data=${JSON.stringify(orderObj)}`,
        headerType: "Content-Type",
        type: "application/json",
      })
      .then((json) => {
        if (json) {
          popup(`Чек номер ${orderObj.id} отправлен на экран кухни`);
        }
        return;
      }).catch((e) => {
        popup(`Нет связи с экраном кухни`);
        return;
      });
    });
  }
};
