// api = 'http://cwsystem-free/'
// запрос информации о номере точки и вызов функции создания таблицы с работниками
function getPointInfo(token, subdomain) {
  return new Promise(function(resolve, reject){
    ieFetch({
      method : 'POST',
      url: api + "api/terminal/info/point/?"+`token=${token}&subdomain=${subdomain}`
    })
    .then((json) => {
      let res = JSON.parse(json);
      if (!res) reject('Пустой ответ в geiPoint');
      if(res.type === 'error') {
        reject(res.data.msg);
        return;
      }
      if(res.type === 'success') {
        try {
          let tableArray = dbMethods.objExpandArray(res.data);
          pointCashbox = Number(res.data.point.id);
          addressCashbox = res.data.point.address;
          // записываем в базу данных номер точки
          dbMethods.updateDb('settings', {value: res.data.point.id}, {variable: 'pointCashbox'})
          dbMethods.updateDb('settings', {value: res.data.point.address}, {variable: 'addressCashbox'})
          // удаляем таблицу с работниками если существует
          db.query(`DROP TABLE IF EXISTS employees`)
          if (!tableArray) {
            logger(`данные которые пришли по запросу /info/point/${JSON.stringify(json)}`)
            resolve(res.data)
          }
          // по массиву работников записываем барист
          tableArray.forEach((item) => {
            dbWork.addTable('employees', item)
          })
          resolve(res.data)
        } catch (error) {
          popup('Ошибка во время создания таблицы employees\n'+error.message)
          logger(`Ошибка во время создания таблицы employees${error.message}`)
          reject('Ошибка во время создания таблицы employees')
        }
      }
    })
    .catch((e) => {
      reject('Сетевая ошибка в getPointInfo\n' + `${JSON.stringify(e)}`)
    })
  })
}

// запрос на открытие смены (по вводу верного пинкода)
function openWorkDay(token, subdomain, employee, key) {
  return new Promise(function(resolve, reject){
    ieFetch({
      method : 'POST',
      url: api + "api/terminal/shift/open?"+`token=${token}&subdomain=${subdomain}&employee=${employee}&key=${key}&subdomain=${subdomain}`
    })
    .then((json) => {
      let res = JSON.parse(json);
      if (res.code == 633 && useChecklist) {
        checklist.send()
      }
      if (res.code == 634 && useChecklist) {
        checklist.render(1, true)
      }
      if (!res) reject('Пустой ответ в openWorkDay');
      if(res.type === 'error') {
        popup('Ошибка в открытии смены'+JSON.stringify(res) + key)
        reject(res.data.msg)
        return;
      }
      if(res.type === 'success') {
        try {
          resolve(res.data)
        } catch (error) {
          reject('Ошибка при запросе открытия смены')
        }
      }
    })
    .catch((e) => {
      reject('Сетевая ошибка в openWorkDay\n' + `${JSON.stringify(e)}`)
    })
  })
}

// запрос на закрытие смены
function closeWorkDay(token, subdomain, key) {
  return new Promise(function(resolve, reject){
    ieFetch({
      method : 'POST',
      url: api + "api/terminal/shift/close?"+`token=${token}&subdomain=${subdomain}&key=${key}&subdomain=${subdomain}`
    })
    .then((json) => {
      let res = JSON.parse(json);
        if (!res) reject('Пустой ответ в openWorkDay');

        if(res.type === 'error') {
          reject(res.data.msg)
          return;
        }

        if(res.type === 'success') {
          try {
          resolve(res.data)
          } catch (error) {
            reject('Ошибка при запросе открытия смены')
          }
        }
    })
    .catch((e) => {
      reject('Ошибка при закрытии смены в closeWorkDay' + `${JSON.stringify(e)}`)
    })
  })
}

// get запрос не доделан, получает информацию о смене открытой онлайн
function checkWorkDay(token, subdomain, key) {
  return new Promise(function(resolve, reject){
    ieFetch({
      method : 'POST',
      url: api + "api/terminal/checks/shift?"+`token=${token}&subdomain=${subdomain}&token=${token}&subdomain=${subdomain}&key=${key}`
    })
    .then((json) => {
      let res = JSON.parse(json);
        if (!res) reject('Пустой ответ в openWorkDay');

        if(res.type === 'error') {
          reject(res.data.msg)
          return;
        }

        if(res.type === 'success') {
          try {
          // alert(JSON.stringify(res.data))
          resolve(res.data)
          } catch (error) {
            reject('Ошибка при запросе')
          }
        }
    })
    .catch((e) => {
      reject('Сетевая ошибка в checkWorkDay\n' + `${JSON.stringify(e)}`)
    })
  })
}

 // создать таблицу скидок
function createDiscountsTable(data) {
  // alert(data)
  if (data == '') {
    try {
      db.query(`CREATE TABLE IF NOT EXISTS discounts (id Integer PRIMARY KEY AUTOINCREMENT, time_from Integer, time_to Integer, weekdays, discount, type, categories, temp, techcards_id )`);
      return;
    } catch(e) {
      popup('ошибка в создании пустой таблицы скидок');
      logger('ошибка в создании пустой таблицы скидок'+e.message);
      return;
    }
  }
  let tableArray = data;
  tableArray.forEach((item) => {
    item.weekdays = item.weekdays.join('')
    let newValue = [];
    for (const [key, value] of Object.entries(item[`technical_cards`])) {
      newValue.push({[`techcards_id`]:Number(value)});
    }
    item[`technical_cards`] = newValue
    item[`time_from`] = Number(item[`time_from`].split(':').join(''));
    if(item[`time_from`].length < 1) {
      item[`time_from`] = 0;
    }
    item[`time_to`] = Number(item[`time_to`].split(':').join(''));
    if(item[`time_to`].length < 1) {
      item[`time_to`] = 2400;
    }
    item[`discount`] = 1 - Number(item[`discount`]) / 100;
    item[`temp`] = 0;

    let newArray = dbMethods.objExpandArray(item);
    try {
      let query = '';
      newArray.forEach((e) => {
        if(query.length > 0) {
          query = `${query},(${e.time_from},${e.time_to},'${e.weekdays}',${e.discount},${e.type},${e.temp},${e.techcards_id})`
        } else {
          query = `(${e.time_from},${e.time_to},'${e.weekdays}',${e.discount},${e.type},${e.temp},${e.techcards_id})`
        }
      })
      let q = `INSERT into discounts (time_from, time_to, weekdays, discount, type, temp, techcards_id) values ${query}`
      logger(q)
      db.query(`DROP TABLE IF EXISTS discounts`)
      db.query(`CREATE TABLE IF NOT EXISTS discounts (id Integer PRIMARY KEY AUTOINCREMENT, time_from Integer, time_to Integer, weekdays, discount, type, categories, temp, techcards_id)`)
      db.query(q)
    } catch (error) {
      try {
        db.conn.close()
      } catch (error) {

      }
      let errorStr = JSON.stringify(error.message)
      logger(`Ошибка при создании таблицы скидок` + errorStr)
      alert(`Ошибка при создании таблицы скидок ` + errorStr)
    }
  })
}
// проверка промо
function checkPromo(token, subdomain, code) {
  return new Promise(function(resolve, reject){
  // 13327953
    ieFetch({
      method : 'POST',
      url: `https://bridge.cwsystem.ru/engine/kassa/sertificate/backend/info?token=${token}&code=${code}&key=Njim99`, // поменять адрес
    })
    .then((json) => {
      // alert('ответ' + json)
      let res = JSON.parse(json);
      if (!res) reject('Пустой ответ в checkPromo');
      if(res.type === 'error') {
        // popup('Неверный промокод')
        reject(false)
        return;
      }
      if(res.type === 'success') {
        if(res.data.hasOwnProperty('sertificate_code')) {
          resolve({
            offreckoning: Number(res.data.amount),
            certificate: Number(res.data['sertificate_code'])
          })
          return
        }
        try {
          let newArray = dbMethods.objExpandArray(res.data);
          let queryArr = ''
          newArray.forEach((item) => {
            item.percent = Math.floor(100 - Number(item.percent)) / 100;
            if (queryArr) {
              queryArr = `${queryArr},(0, 2400,'${weekDay}',${item.percent},1,${item.id})`
            } else {
              queryArr = `(0, 2400,'${weekDay}',${item.percent},1,${item.id})`
            }
          })
          db.query(`INSERT into discounts (time_from,time_to,weekdays,discount,temp,techcards_id) values ${queryArr}`);
          update.saleObg()
          resolve( {percent: Number(res.data.percent)})

          // dbMethods.setterDb('discounts', {time_from: 0, time_to: 24, weekdays:weekDay, discount: item.percent, temp: 1, techcards_id: item.id});
        } catch (error) {
          logger('Ошибка при проверке промо \n' + error.message + '\n')
          reject('Ошибка при проверке промо')
        }
      }

    })
    .catch((e) => {
      alert('Сетевая ошибка в checkPromo\n' + `${JSON.stringify(e)}`);
      reject('Сетевая ошибка в checkPromo\n' + `${JSON.stringify(e)}`);

    })
  })
}

// проверить скидки
function getDiscounts(token, subdomain) {
  return new Promise(function(resolve, reject){
    ieFetch({
      method : 'POST',
      url: api + "api/terminal/discounts/get?"+`token=${token}&subdomain=${subdomain}`,
    })
    .then((json) => {
      let res = JSON.parse(json);
        if (!res) reject('Пустой ответ в getDiscounts');

        if(res.type === 'error') {
          reject(res.data.msg);
          return;
        }

        if(res.type === 'success') {
          try {
            let message = `getDiscounts ${JSON.stringify(res)}`
          logger(message)
          createDiscountsTable(res.data);
          resolve(res.data);
          } catch (error) {
            reject('Ошибка при получении скидок');
          }
        }
    })
    .catch((e) => {
      reject('Сетевая ошибка в getDiscounts\n' + `${JSON.stringify(e)}`);
    });
  });
};

// создать оффлайн токен
function generateToken() {
  let emplName = dbMethods.getterDb('settings', {variable: 'barista'}, 'value')[0];
  let emplId = dbMethods.getterDb('employees', {[`employees_name`]: emplName}, 'employees_id')[0];
  let unix = Math.floor(Date.now() / 1000);
  let key = sha512(unix + 'CWSystem' + emplId);
  return key;
}
// Закрытие смены
function closeWorkDayClick() {
  preloader.preloader('body')
  if (useAtol === 1) { // если используется атол
    try {
      subfunc.qualitativeSynchronizer();
    } catch (e) {
      logger(`ошибка qualitativeSynchronizer ${e.message}`);
    }
    try {
      devkkm.printWorcdayInfo();
      devkkm.closeWorkday();
    } catch (e) {
      alert('Не удалось закрыть смену на фискальнике, нажмите ок что бы продолжить закрытие на сервере(на фисклаьнике закрыто не будет) \n или закройте кассу');
      logger(`ошибка закрытия смены на фискальнике ${e.message}`);
    }
  }
  let token = dbMethods.getterDb('settings', {variable: 'tokenPoint'}, 'value')[0]
  let subdomain = dbMethods.getterDb('settings', {variable: 'subdomain'}, 'value')[0]
  let tokenWorkdayOnline = dbMethods.getterDb('settings', {variable: 'tokenWorkdayOnline'}, 'value')[0]
  let tokenWorkdayOffline = dbMethods.getterDb('settings', {variable: 'tokenWorkdayOffline'}, 'value')[0]
  let loaded = false;
  let unix = Math.floor(Date.now() / 1000)
  let resp = false;
  let revenue = null;
  try {
    resp = db.query(`SELECT sum(orderSumFinal) as 'orderSum', count(id) as 'count', avg(orderSumFinal) as 'orderSumAvg' FROM orders WHERE status in(1,2,3) and idworkdayOffline = '${idworkdayOffline}'`);
  } catch(e) {
    db.conn.close()
    logger('Ошибка в closeWorkDayClick'+e.message)
  }
  if(resp) {
    revenue = resp[0].orderSum > 0 ? resp[0].orderSum : 0;
  }
  closeWorkDay(token, subdomain, tokenWorkdayOnline)
  .then((res) => {
    dbMethods.updateDb('workday', {[`status`]: '2'}, {[`tokenWorkdayOnline`]: tokenWorkdayOnline})
    dbMethods.updateDb('workday', {[`workDay_to`]: `${unix}`}, {[`tokenWorkdayOnline`]: tokenWorkdayOnline})
    dbMethods.updateDb('workday', {[`revenue`]: `${revenue}`}, {[`tokenWorkdayOnline`]: tokenWorkdayOnline})
    loaded = true;
  })
  .catch(() => {
    dbMethods.updateDb('workday', {[`status`]: '1'}, {[`tokenWorkdayOffline`]: tokenWorkdayOffline})
    dbMethods.updateDb('workday', {[`workDay_to`]: `${unix}`}, {[`tokenWorkdayOnline`]: tokenWorkdayOnline})
    dbMethods.updateDb('workday', {[`revenue`]: `${revenue}`}, {[`tokenWorkdayOnline`]: tokenWorkdayOnline})
    loaded = false;
  })
  .finally(() => {
    dbMethods.updateDb('settings', {value: null}, {variable: 'tokenWorkdayOnline'})
    dbMethods.updateDb('settings', {value: null}, {variable: 'tokenWorkdayOffline'})
    dbMethods.updateDb('settings', {value: null}, {variable: 'barista'})
    dbMethods.updateDb('settings', {value: null}, {variable: 'pincode'})
    dbMethods.updateDb('settings', {value: null}, {variable: 'employed'})
    dbMethods.removeFromDb('orders', {status: 0})
    try {
      let openOrder = dbMethods.getterDb('orders', {status: 0}, 'id')[0]
      dbMethods.removeFromDb('orderItem', {[`idOrder`]: openOrder})
    } catch (error) {
    }
    initapp();
    if(loaded) {
      popup('Смена закрыта')
    } else {
      popup('Смена закрыта но не отправлена на сервер')
    }
    closeWorkDayPinBtn.classList.add('hidden')
    preloader.preloaderOff()
    if (useTerminal) {
      sbbank.reconciliation()
    }
  })
}

// Открытие/продление/закрытие смены sync - запускается ли функция во время синхронизации
function workDay(sync) {
  let token = dbMethods.getterDb('settings', {variable: 'tokenPoint'}, 'value')[0]
  let subdomain = dbMethods.getterDb('settings', {variable: 'subdomain'}, 'value')[0]
  let tokenWorkdayOnline = dbMethods.getterDb('settings', {variable: 'tokenWorkdayOnline'}, 'value')[0]
  let emplName = dbMethods.getterDb('settings', {variable: 'barista'}, 'value')[0]
  let emplId = dbMethods.getterDb('employees', {[`employees_name`]: emplName}, 'employees_id')[0]
  let offlineWorkDayList = dbMethods.getterDb('workday', {status: 1}, 'id')
  tokenPoint = dbMethods.getterDb('settings', {variable: 'tokenPoint'}, 'value')[0]
  setting.globalVariables();
  function syncWorkDays() {
    try {
      let ans, q;
      try {
        q = `SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status in (-1 , 2))`
        ans = db.query(q);
      } catch (error) {
        db.conn.close()
        ans = undefined;
      }
      // в базе есть чеки со статусом -1 или 2
      if (ans) {
        setting.globalVariables();
        let e = ans[0];
        let newOrder = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient);
        // alert('Последний чек: \n' + JSON.stringify(newOrder))
        const param = new Transaction(newOrder); // создание объекта транзакции
        const onlineToken = dbMethods.getterDb('settings', {variable: 'tokenWorkdayOnline'}, 'value')[0]; // онлайн токен
        let key = newOrder.idworkdayOffline;
        // alert(onlineToken + `\n ${`${onlineToken}` === 'null'}`)
        if(`${onlineToken}` === 'null') {  // если это вызов функции при открытии смены
          // alert('Проверка айди смен: \n ' +  oldShift  + '\n' + newOrder.idworkdayOffline + '\n' + `${`${oldShift}` !== `${newOrder.idworkdayOffline}` && oldShift != undefined}`)
          if(`${oldShift}` !== `${newOrder.idworkdayOffline}` || typeof(oldShift) === 'undefined') { // новая для функции смена
            // alert('новая для функции смена')
            if(oldShift) {
              // alert('Закрытие предидущей смены: ' + oldShift)
              closeWorkDay(tokenPoint, subdomain, oldShift) // закрыть смену предидущей итерации
              .then(() => {
                dbMethods.updateDb('workday', {[`status`]: '2'}, {[`tokenWorkdayOnline`]: oldShift})
                // alert(`test ${oldShift}`)
                openWorkDay(tokenPoint, subdomain, emplId, newOrder.idworkdayOffline) // открытие следующей смены
                .then((res) => {
                  let prolongWorkday = res.shift; // смена продлена, это ошибка
                  if(prolongWorkday) {
                    // alert("Ошибка синхронизации, смена уже была открыта: " + newOrder.idworkdayOffline)
                    return;
                  }
                  dbMethods.updateDb('workday', {[`tokenWorkdayOnline`]: newOrder.idworkdayOffline}, {[`tokenWorkdayOffline`]: newOrder.idworkdayOffline}) // обновляем токен в таблице смен
                  // alert(`Смена открыта ${newOrder.idworkdayOffline} , транзакция: ${newOrder.id}`)
                  return new Promise(function(resolve, reject){
                    ieFetch({
                      method : 'POST',
                      url: `https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain}&point=${pointCashbox}`,
                      headerType: "Content-Type",
                      type: "application/json",
                      send: `${JSON.stringify(param)}`,
                    })
                    .then((json) => {
                      let ans = JSON.parse(json);
                      resolve(ans);
                      // alert(`Ответ с сервера: транзакция: ${newOrder.id}` + JSON.stringify(ans))
                      if (ans.type === 'success') { // если все удалось, вызов следующей итерации
                        dbMethods.updateDb('orders', {status: 3}, {id: newOrder.id}); // сменить статус текущего чека
                        //новое в 1.2:
                        dbMethods.updateDb('orders', {[`idworkdayOnline`]: newOrder.idworkdayOffline, [`idworkdayOffline`]: newOrder.idworkdayOffline}, {id: newOrder.id}) // обновить токен смены по синхонизации
                        oldShift = newOrder.idworkdayOffline; // обновить айди смены по текущему чеку
                        setTimeout(syncWorkDays, 500) // вызов следующей итерации
                      }
                      return;
                    }).catch((e) => {
                      setTimeout(syncWorkDays, 4000)  // повторный вызов текущей итерации
                    })
                  })
                })
                .catch((e) => {
                  // alert(`Ошибка при синхронизации, ошибка открытия смены: ${newOrder.idworkdayOffline} \n`+e.message);
                })
              })
              .catch((e) => {
                logger("Ошибка закрытия смены при синхронизации: \n"+e.message)
                alert("Ошибка закрытия смены при синхронизации: \n"+e.message);
              })
            }
            openWorkDay(tokenPoint, subdomain,  emplId, newOrder.idworkdayOffline) // первая транзакция в смене
            .then((res) => {
              let prolongWorkday = res.shift; // продлилась не закрытая онлайн смена
              if(prolongWorkday) {
                oldShift = prolongWorkday;
                newOrder.idworkdayOffline = prolongWorkday
                newOrder.idworkdayOnline = prolongWorkday
                const param = new Transaction(newOrder); // создание объекта транзакции
                return new Promise(function(resolve, reject){
                  ieFetch({
                    method : 'POST',
                    url: `https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain}&point=${pointCashbox}`,
                    headerType: "Content-Type",
                    type: "application/json",
                    send: `${JSON.stringify(param)}`,
                  })
                  .then((json) => {
                    let ans = JSON.parse(json);
                    // alert(`транзакция: ${newOrder.id}` + `ответ: ${JSON.stringify(ans)}`)
                    // вызываем себя же
                    if (ans.type === 'success') { // если все удалось, вызов следующей итерации
                      popup(`Транзакция №:${newOrder.id} отправлена`)
                      let q;
                      if (ordersArr[0].status == 2) {
                        q = `UPDATE orders SET status = 3 WHERE id = ${Number(newOrder.id)}`;
                        try {
                          db.query(q);
                        } catch (e) {
                          db.conn.close()
                          setTimeout(syncWorkDays, 4000)
                        }
                      } else if (ordersArr[0].status == -2 ) {
                        q = `UPDATE orders SET status = 4 WHERE id = ${Number(newOrder.id)}`;
                        try {
                          db.query(q);
                        } catch (e) {
                          db.conn.close()
                          setTimeout(syncWorkDays, 4000)
                        }
                      }
                      oldShift = newOrder.idworkdayOffline; // обновить айди смены по текущему чеку
                      setTimeout(syncWorkDays, 500) // вызов следующей итерации
                    }
                    return;
                  }).catch((e) => {
                    setTimeout(syncWorkDays, 4000) // повторный вызов текущей итерации
                  })
                })
              }
              newOrder.idworkdayOnline = newOrder.idworkdayOffline
              dbMethods.updateDb('workday', {[`tokenWorkdayOnline`]: newOrder.idworkdayOffline}, {[`tokenWorkdayOffline`]: newOrder.idworkdayOffline}) // обновляем токен в таблице смен
              // alert(`Смена открыта ${newOrder.idworkdayOffline} , транзакция: ${newOrder.id}`+ JSON.stringify(param))
              return new Promise(function(resolve, reject){
                ieFetch({
                  method : 'POST',
                  url: `https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain}&point=${pointCashbox}`,
                  headerType: "Content-Type",
                  type: "application/json",
                  send: `${JSON.stringify(param)}`,
                })
                .then((json) => {
                  let ans = JSON.parse(json);
                  resolve(ans);
                  // alert(`транзакция: ${newOrder.id}` + `ответ: ${JSON.stringify(ans)}`)
                  // вызываем себя же
                  if (ans.type === 'success') { // если все удалось, вызов следующей итерации
                    dbMethods.updateDb('orders', {status: 3}, {id: newOrder.id}); // сменить статус текущего чека

                    //новое в 1.2:
                    dbMethods.updateDb('orders', {[`idworkdayOnline`]: newOrder.idworkdayOffline, [`idworkdayOffline`]: newOrder.idworkdayOffline}, {id: newOrder.id}) // обновить токен смены по синхонизации
                    oldShift = newOrder.idworkdayOffline; // обновить айди обрабатываемой смены по текущему чеку
                    setTimeout(syncWorkDays, 500) // вызов следующей итерации
                  }
                  return;
                }).catch((e) => {
                  setTimeout(syncWorkDays, 4000) // повторный вызов текущей итерации
                })
              })
            })
            .catch((e) => {
              //  открыта онлайн смена грузим транзакции
              let prolongWorkday = newOrder.idworkdayOffline; // продлилась не закрытая онлайн смена
              if(prolongWorkday) {
                oldShift = prolongWorkday;
                newOrder.idworkdayOffline = prolongWorkday
                newOrder.idworkdayOnline = prolongWorkday
                const param = new Transaction(newOrder); // создание объекта транзакции
                return new Promise(function(resolve, reject){
                  ieFetch({
                    method : 'POST',
                    url: `https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain}&point=${pointCashbox}`,
                    headerType: "Content-Type",
                    type: "application/json",
                    send: `${JSON.stringify(param)}`,
                  })
                  .then((json) => {
                    let ans = JSON.parse(json);
                    // alert(`транзакция: ${newOrder.id}` + `ответ: ${JSON.stringify(ans)}`)
                    // вызываем себя же
                    if (ans.type === 'success') { // если все удалось, вызов следующей итерации
                      popup(`Транзакция №:${newOrder.id} отправлена`)
                      let q;
                      if (ordersArr[0].status == 2) {
                        q = `UPDATE orders SET status = 3 WHERE id = ${Number(newOrder.id)}`;
                        try {
                          db.query(q);
                        } catch (e) {
                          db.conn.close()
                          setTimeout(syncWorkDays, 4000)
                        }
                      } else if (ordersArr[0].status == -2 ) {
                        q = `UPDATE orders SET status = 4 WHERE id = ${Number(newOrder.id)}`;
                        try {
                          db.query(q);
                        } catch (e) {
                          db.conn.close()
                          setTimeout(syncWorkDays, 4000)
                        }
                      }
                      oldShift = newOrder.idworkdayOffline; // обновить айди смены по текущему чеку
                      setTimeout(syncWorkDays, 500) // вызов следующей итерации
                    }
                    return;
                  })
                  .catch((e) => {
                    setTimeout(syncWorkDays, 4000) // повторный вызов текущей итерации
                  })
                })
              }
              newOrder.idworkdayOnline = newOrder.idworkdayOffline

            })
            return;
          } if(`${oldShift}` === `${newOrder.idworkdayOffline}`) { // повторная итерация в одной с предидущим чеком смене
            return new Promise(function(resolve, reject){
              ieFetch({
                method : 'POST',
                url: `https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain}&point=${pointCashbox}`,
                headerType: "Content-Type",
                type: "application/json",
                send: `${JSON.stringify(param)}`,
              })
              .then((json) => {
                let ans = JSON.parse(json);
                resolve(ans);
                // alert(`транзакция: ${newOrder.id}` + `ответ: ${ans}`)
                // вызываем себя же
                if (ans.type === 'success') { // если все удалось, вызов следующей итерации
                  popup(`Транзакция: ${newOrder.id} отправлена`)
                  dbMethods.updateDb('orders', {status: 3}, {id: newOrder.id}); // сменить статус текущего чека
                  //новое в 1.2:
                  dbMethods.updateDb('orders', {[`idworkdayOnline`]: newOrder.idworkdayOffline, [`idworkdayOffline`]: newOrder.idworkdayOffline}, {id: newOrder.id}) // обновить токен смены по синхонизации
                  oldShift = newOrder.idworkdayOffline; // обновить айди смены по текущему чеку
                  setTimeout(syncWorkDays, 500) // вызов следующей итерации
                }
                return;
              }).catch((e) => {
                setTimeout(syncWorkDays, 4000) // повторный вызов текущей итерации
              })
            })
          }
          // alert('ТРАНЗАКЦИЯ'+ JSON.stringify(param))
          return new Promise(function(resolve, reject){
            ieFetch({
              method : 'POST',
              url: `https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain}&point=${pointCashbox}`,
              headerType: "Content-Type",
              type: "application/json",
              send: JSON.stringify(param),
            })
            .then((json) => {
              // alert('ответ: ' + json)
              let ans = JSON.parse(json);

              if (ans.type === 'success') { // вызываем себя же
                dbMethods.updateDb('orders', {status: 3}, {id: newOrder.id});
                //новое в 1.2:
                dbMethods.updateDb('orders', {[`idworkdayOnline`]: newOrder.idworkdayOffline, [`idworkdayOffline`]: newOrder.idworkdayOffline}, {id: newOrder.id}) // обновить токен смены по синхонизации
                if (`${oldShift}` !== `${newOrder.idworkdayOffline}` && typeof(oldShift) === 'undefined') {
                } else {
                  oldShift = newOrder.idworkdayOffline;
                  syncWorkDays();
                  return;
                }
              }
              return;
            })
            .catch((e) => {
              // alert('ошибка при синхронизации, ошибка связи')
              logger('ошибка при синхронизации, ошибка связи')
              setTimeout(syncWorkDays, 4000)
              return
            })
          })
        }
        // alert('ТРАНЗАКЦИЯ'+ JSON.stringify(param))
        return new Promise(function(resolve, reject){
          ieFetch({
            method : 'POST',
            url: `https://cwflow.apiloc.ru/api/integrations/transaction/create?token=${tokenPoint}&subdomain=${subdomain}&point=${pointCashbox}`,
            headerType: "Content-Type",
            type: "application/json",
            send: JSON.stringify(param),
          })
          .then((json) => {
            // alert('ответ: ' + json)
            let ans = JSON.parse(json);
            if (ans.type === 'success') { // вызываем себя же
              dbMethods.updateDb('orders', {status: 3}, {id: newOrder.id});
              //новое в 1.2:
              dbMethods.updateDb('orders', {[`idworkdayOnline`]: newOrder.idworkdayOffline, [`idworkdayOffline`]: newOrder.idworkdayOffline}, {id: newOrder.id}) // обновить токен смены по синхонизации
              if (`${oldShift}` !== `${newOrder.idworkdayOffline}` &&  typeof(oldShift) === 'undefined') {
              } else {
                oldShift = newOrder.idworkdayOffline;
                syncWorkDays();
                return;
              }
            }
            return;
          }).catch((e) => {
            logger('Ошибка связи в синхронизации: 650 строка')
            setTimeout(syncWorkDays, 4000)
            return
          })
        })
      }
      if(`${dbMethods.getterDb('settings', {variable: 'tokenWorkdayOnline'}, 'value')[0]}` === 'null') { // если итерации были запущены  до октрытия смены
        // alert('закрыть последнию смену и открыть новую')
        oldShift = dbMethods.getterDb('workday', {status: 1}, 'tokenWorkdayOnline')
        // alert(tokenPoint +'\n'+subdomain +'\n'+ oldShift)
        closeWorkDay(tokenPoint, subdomain, oldShift) // закрыть смену предидущей итерации
        .then(() => {
          dbMethods.updateDb('workday', {[`status`]: '2'}, {[`tokenWorkdayOnline`]: oldShift})
          workDay(true);
        })
        .catch((e) => {
          // alert("Ошибка закрытия смены при синхронизации: \n"+JSON.stringify(e));
          logger("Ошибка закрытия смены при синхронизации: \n"+JSON.stringify(e));
        })
      } else {
        workDay(true);
      }
    return true;
    } catch (e) {
      // alert("Ошибка отправки чеков на сервер \n"+JSON.stringify(e.message));
      logger("Ошибка отправки чеков на сервер \n"+JSON.stringify(e.message));
      return false;
    }
  }

  if(offlineWorkDayList.length) {
    if(!sync && onlineSystem) {
      popup('Синхронизация смен, ожидайте...', false, 'preloader')
      syncWorkDays();
      return;
    }
  }
  // висячая функция сеньора коммитов
  setting.globalVariables();
  postman.serverOrder();
  postman.loyalityOrder();
  postman.certificateOrder();
  postman.serverOrderCancel();

  if(`${tokenWorkdayOnline}` === `null`) { // нет онлайн токена
    let tokenWorkdayOffline = dbMethods.getterDb('settings', {variable: 'tokenWorkdayOffline'}, 'value')[0] // есть ли оффлайн токен
    let prolong = true;
    if(`${tokenWorkdayOffline}` === `null`) { // создали оффлайн токен(нет смен со статусом 0)
      prolong = false;
      tokenWorkdayOffline = generateToken();
      dbMethods.updateDb('settings', {value: tokenWorkdayOffline}, {variable: 'tokenWorkdayOffline'})
      let unix = Math.floor(Date.now() / 1000)
      dbMethods.setterDb('workday',
      {
        status: 0,
        tokenWorkdayOnline: null,
        tokenWorkdayOffline: tokenWorkdayOffline,
        workDay_from: unix,
        workDay_to: null,
        revenue: 0,
        hours: 0,
        salary: 0,
        premium: 0,
        dateDay: dateStrGlobal,
      })
    }

    if(!onlineSystem) {
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray))
      menuApp.renderList('category', menuApp.load('menuDb', null))
      preloader.preloader('body');
      logger(`Запуск обновлений`)
      setting.globalVariables()
      update.idOrder();
      update.productArr();
      update.saleObg()

      //  alert(`Обновились следующие переменные:
      //  ${JSON.stringify(productArr)}`)
      //  ${JSON.stringify(idOrderGlobal)}
      //  ${JSON.stringify(ordersArr)}
      orderCalc.renderReceipt()
      if(prolong) return popup('Смена продлена автономно');
      popup('Сменя открыта автономно');
      return;
    }
    openWorkDay(token, subdomain, emplId, tokenWorkdayOffline)
      .then(function(result) {
        tokenWorkdayOnline = result.shift; // если он есть продолжена онлайн смена с сервера
        dbMethods.updateDb('workday', {[`tokenWorkdayOnline`]: tokenWorkdayOffline}, {[`tokenWorkdayOffline`]: tokenWorkdayOffline}) // онлайн токен приравнивается к оффлайн токену
        dbMethods.updateDb('settings', {value: tokenWorkdayOffline}, {variable: 'tokenWorkdayOnline'})
        if(tokenWorkdayOnline) { // но если в ответе был онлайн токен, оффлайн и онлайн перепишутся на полученный из запроса(предидущая смена на сервере не была закрыта)
          dbMethods.updateDb('workday', {[`tokenWorkdayOnline`]: tokenWorkdayOnline, [`tokenWorkdayOffline`]: tokenWorkdayOnline}, {[`tokenWorkdayOffline`]: tokenWorkdayOffline})
          dbMethods.updateDb('settings', {value: tokenWorkdayOnline}, {variable: 'tokenWorkdayOffline'})
          dbMethods.updateDb('settings', {value: tokenWorkdayOnline}, {variable: 'tokenWorkdayOnline'})
        } else {
          // новая смена - архивация бд
          dbWork.archiveDb()
          // updateTerminal.updateTerminalInit();
        }
        menuApp.renderList('content', menuApp.loadById('menuDb', popularArray))
        menuApp.renderList('category', menuApp.load('menuDb', null))
        return;
      })
      .catch(() => { // онлайн токен не создан смена автономна
        openWorkDay(token, subdomain, emplId, generateToken()) // проверить нет ли открытой смены на сервере
        .then(function(result) {
          tokenWorkdayOnline = result.shift;
          if(tokenWorkdayOnline) { // запишет онлайн токен если это продление смены открытой на сервере
            dbMethods.updateDb('settings', {value: tokenWorkdayOnline}, {variable: 'tokenWorkdayOffline'})
            dbMethods.updateDb('settings', {value: tokenWorkdayOnline}, {variable: 'tokenWorkdayOnline'})
          } else {
            // архивация дб
            dbWork.archiveDb()
            // updateTerminal.updateTerminalInit();
          }
          setting.globalVariables()
          update.idOrder();
          update.productArr();
          update.saleObg()
          getDiscounts(token, subdomain).catch(() => { // получение скидок и обновление дб
            popup('Ошибка при обновлении скидок')
          })
          menuApp.renderList('content', menuApp.loadById('menuDb', popularArray))
          menuApp.renderList('category', menuApp.load('menuDb', null))
          return;
        })
        .catch((error) => { // Сетевая ошибка при открытии смены
          try {
            menuApp.renderList('content', menuApp.loadById('menuDb', popularArray))
            menuApp.renderList('category', menuApp.load('menuDb', null))
          } catch (error) {
            logger('Ошибка при открытии смены в workDay'+error.message)
            alert('Ошибка при открытии смены в workDay'+error.message)
          }
          preloader.preloaderOff()
          popup('Смена продлена автономно')
        })
        .finally(() => {
          preloader.preloaderOff()
          setting.globalVariables()
          update.idOrder();
          update.productArr();
          update.saleObg()
          popup('Смена продлена')
          orderCalc.renderReceipt()
        });
        try {
          menuApp.renderList('content', menuApp.loadById('menuDb', popularArray))
          menuApp.renderList('category', menuApp.load('menuDb', null))
        } catch (error) {
          logger('Ошибка при открытии смены в workDay'+error.message)
          alert('Ошибка при открытии смены в workDay'+error.message)
        }
        preloader.preloaderOff()
        if(prolong) return popup('Смена продлена автономно');
        popup('Сменя открыта автономно');
      })
      .finally(() => {
        preloader.preloaderOff()
        setting.globalVariables()
        update.idOrder();
        update.productArr();
        update.saleObg()
        orderCalc.renderReceipt()
        getDiscounts(token, subdomain)
        .then(() => {

        })
        .catch(()=> {
          popup('Ошибка при обновлении скидок')
        })
      });
    return;
  }
  if(!onlineSystem) {
    menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
    menuApp.renderList('category', menuApp.load('menuDb', null));
    preloader.preloader('body')
    popup('Смена продлена автономно')
    setting.globalVariables()
    update.idOrder();
    update.productArr();
    update.saleObg()
    orderCalc.renderReceipt()
    return;
  }
  openWorkDay(token, subdomain, emplId, generateToken()) // проверить нет ли открытой смены на сервере
    .then(function(result) {
      tokenWorkdayOnline = result.shift;
      if(tokenWorkdayOnline) { // запишет онлайн токен если это продление смены открытой на сервере
        dbMethods.updateDb('settings', {value: tokenWorkdayOnline}, {variable: 'tokenWorkdayOffline'})
        dbMethods.updateDb('settings', {value: tokenWorkdayOnline}, {variable: 'tokenWorkdayOnline'})
      } else {
        dbWork.archiveDb()
      }
      setting.globalVariables();
      update.idOrder();
      update.productArr();
      update.saleObg();
      getDiscounts(token, subdomain).catch(() => { // получение скидок и обновление дб
        popup('Ошибка при обновлении скидок');
      })
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
      menuApp.renderList('category', menuApp.load('menuDb', null));
      return;
    })
    .catch((error) => { // Сетевая ошибка при открытии смены
      try {
        menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
        menuApp.renderList('category', menuApp.load('menuDb', null));
      } catch (error) {
        alert('Ошибка в openWorkDay \n'+error.message);
        logger('Ошибка в openWorkDay \n'+error.message);
      }
      preloader.preloaderOff()
      popup('Смена продлена автономно');
    })
    .finally(() => {
      preloader.preloaderOff()
      setting.globalVariables()
      update.idOrder();
      update.productArr();
      update.saleObg()
      popup('Смена продлена')
      orderCalc.renderReceipt()
    });
  return;
}

// опредление онлайн/оффлайн через запрос
function checkOnlineStatus() {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://bridge.cwsystem.ru/dbtest', true);
    xhr.send();
    xhr.addEventListener('readystatechange', function (e) {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 0) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.statusText);
      }
    });
  });
}
// оповещение о соединении
function updateOnlineStatus (online) {
  if(online != onlineSystem) {
    onlineSystem = online
    const updateOnline = document.querySelector('.header__btn-update-descr')
    if (onlineSystem) {
      popup('Соединение с интернетом восстановлено')
      updateOnline.style.opacity = '0'
      if(`${idworkdayOnline}` === 'null') {
        dbMethods.updateDb('settings', {value: null}, {variable: 'barista'})
        dbMethods.updateDb('settings', {value: null}, {variable: 'pincode'})
        dbMethods.updateDb('settings', {value: null}, {variable: 'employed'})
        initapp();
      }
      setTimeout(() => {
        updateOnline.textContent = 'Online'
        updateOnline.style.opacity = '1';
        updateOnline.classList.remove('header__btn-update-descr_offline')
      }, 300)
      return
    }
    popup('Соединение с интернетом прервано')
    updateOnline.style.opacity = '0'
    setTimeout(() => {
      updateOnline.textContent = 'Offline'
      updateOnline.style.opacity = '1'
      updateOnline.classList.add('header__btn-update-descr_offline')
    }, 300)
  }
}

// запрос для проверки онлайна
setInterval(() => {
  const todayGlobal = new Date();
  dateStrGlobal = todayGlobal.getFullYear() + '-' + AddLeftG(todayGlobal.getMonth() + 1, '0', 2) + '-' + AddLeftG(todayGlobal.getDate(), '0', 2);
  checkOnlineStatus()
  .then((e) => {
    if (e == 1){
      updateOnlineStatus(true)
    } else {
      popup('соединение с сервером потерено')
      preloader.preloaderOff()
      updateOnlineStatus(false)
    }
  })
  .catch(() => {
    preloader.preloaderOff()
    updateOnlineStatus(false)
  })
}, 7500);

if(!onlineSystem) {
  const promocodeWrap = document.querySelector('.header__card_promocode');
  promocodeWrap.classList.add('imperfection')
}

// qualitativeSynchronizer
setInterval(() => {
  if (useAtol === 1) {
    try {
      subfunc.qualitativeSynchronizer(true);
    } catch (e) {
      logger(`ошибка qualitativeSynchronizer ${e.message}`);
    }
  }
}, 3612345);