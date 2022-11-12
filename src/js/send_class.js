// класс для работы с запросами и отправкой данных

const send = new function() {
  // получить данные клиента
  this.getInfoClient = function(search) {
    return new Promise(function(resolve, reject){
      const clientInput = document.querySelector('#client-card-input');
      let json = {};
      json.search = search;
      json.country = subdomain;
      json.point = pointCashbox;
      ieFetch({
        method : 'POST',
        url: `https://loyalclient.apptor.tech/integration/cw/client/search`,
        headerApikey:  "apikey",
        key: "a808d35874bfb2b3ab492ec5ed23486dff0025e40527d2f677bc7e954e3c0a23",
        headerType: "Content-Type",
        type: "application/json",
        send: JSON.stringify(json),
      })
      .then((json) => {
        const clientInfoArr = document.querySelectorAll('.client__info')
        if(clientInfoArr.length > 0) {
          clientInfoArr.forEach((clientInfoItem) => {
            clientInfoItem.textContent = 'Клиент';
          });
        }
        logger(`Ответ по запросу клиента: Запрос по : ${search} ответ: ${json}`);
        if(JSON.parse(json).success) {
          clientInput.value = '';
          let ans = JSON.parse(json).data;
          resolve(ans);
          return ans;
        } else {
          clientInput.value = '';
          popup('Неверный номер или код');
          resolve(undefined);
          return undefined;
        }
      }).catch((e) => {
        clientInput.value = '';
        popup(`ошибка запроса клиенте, возможно нет связи`);
        logger(`ошибка запроса клиенте ${e.message}`);
        resolve(undefined);
        return undefined;
      });
    });
  };
  // Оплата QR кодом
  this.cashlessQRcode = function() {
    if(onlineSystem) {
      let time = subfunc.getTime();
      let rs = subfunc.random();
      let trans = `${idOrderGlobal}${rs}${time.unix}s${useAtol}${useTerminal}${troubleAtol}`;
      let data = {};
      data['answer_url'] = `http://inside.erpka.online/sbp/?p=${pointCashbox}&trans=${trans}`;
      data.cost = Number(ordersArr[0].orderSumFinal); // сумма которую должен оплатить клиент
      // data.duration = 600 //не обязательный параметр который указывает время жизни существования операции на кассе в секундах.
      data.items = []; //  список покупок, который будет отображаться у клиента

      productArr.forEach((e) => {
        let product = {};
        product.title = e.name; // название позиции
        product.amount = e.amount; //  количество позиций
        product.price = e.priceFinal; // цена одной позиции
        data.items.push(product);
      });
      logger(`отправляем на адрес qr оплаты при создании${JSON.stringify(data)}`);
      // создание операции
      ieFetch({
        method : 'POST',
        url: `https://newpayb2b.pro/api/s1/operation/create`,
        headerApikey:  "api-key",
        key: keyQR,
        headerUserToken:  "user-token",
        token: tokenQR,
        headerType: "Content-Type",
        type: "application/json",
        send: JSON.stringify(data),
      })
      .then((json) => {
        let answ = JSON.parse(json);
        saleToken = answ['sale_token'];
        ordersArr[0].qrtoken = answ['sale_token'];
        // кнопка проверки оплаты
        if(answ.code === 1) { // если операция создана
          preloader.preloaderQRcode();
          var xmlhttp = getXmlHttp();
          xmlhttp.open("POST", `http://inside.erpka.online/sbp/get.php?p=${pointCashbox}&trans=${trans}`, true);
          xmlhttp.onreadystatechange=function(){
            if (xmlhttp.readyState != 4) return;
            clearTimeout(timeout); // очистить таймаут при наступлении readyState 4
            if (xmlhttp.status == 200) {
              // alert(JSON.stringify(servAnsw))
              let servAnsw = JSON.parse(xmlhttp.responseText);
              if(servAnsw.answer == 'error') {
                preloader.preloaderOff();
                return;
              }
              if(saleToken == servAnsw['sale_token'].replace(/\n/g, '') && `${servAnsw.result}` === 'true' ) {
                ordersArr[0].chtype = 2;
                preloader.preloaderOff();
                btnQRcode.classList.add('ready-payment');
                clientInput.setAttribute("disabled", "disabled");
                clientBtn.setAttribute("disabled", "disabled");
                promocodeInput.setAttribute("disabled", "disabled");
                promocodeWrap.setAttribute("disabled", "disabled");
                ordersArr[0].status = 1;
                popup(`Оплата чека QR кодом ${ordersArr[0].id} проведена успешно`);
                logger(`Оплата чека QR кодом ${ordersArr[0].id} проведена успешно`);
                if (entry.ordersFixation(ordersArr[0], 1)) {
                  if (useAtol === 1 && !troubleAtol) { // если используется атол и не аварийный режим
                    if(devkkm.openOrder(ordersArr[0], productArr)) {
                      if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
                        devkkm.printOrder(ordersArr[0], productArr);
                        del.tempSale(); // чистим скидки
                        idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                        update.idOrder(); // вызов нового чека
                      } else {
                        popup(`фиксация чека ${ordersArr[0].id} не удалась`);
                        logger(`фиксация чека ${ordersArr[0].id} не удалась`);
                        troubleAtolCounter += 1;
                        if (troubleAtolCounter === 2) {
                          devkkm.init()
                        }
                        if (troubleAtolCounter === 3) {
                          btnQRcode.classList.add('trouble');
                        }
                        if (troubleAtolCounter > 3) {
                          troubleAtol = 1;
                          document.querySelector('#trouble-atol-toggle').checked = true;
                          telegramNote('Аварийный режим атола включён')
                          dbMethods.updateDb('settings', {value: 1}, { variable: 'troubleAtol' } );
                          popup('Перевод кассы в режим аварийной работы фискального регистратора');
                          postman.atolOrder();
                          troubleAtolCounter = 0;
                          if (entry.ordersFixation(ordersArr[0], 1)) {// фиксируем чек\
                            del.tempSale(); // чистим скидки
                            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                            update.idOrder(); // вызов нового чека
                          } else {
                            popup(`фиксация чека ${ordersArr[0].id} не удалась`);
                            logger(`фиксация чека ${ordersArr[0].id} не удалась`);
                          };
                        };
                      }
                    } else {
                      popup(`печать чека ${ordersArr[0].id} не удалась. Проверьте фискальный регистратор и повторите попытку!`);
                      logger(`печать чека ${ordersArr[0].id} не удалась. Проверьте фискальный регистратор и повторите попытку!`);
                    }
                  } else if (useAtol === 1 && troubleAtol) {
                    del.tempSale(); // чистим скидки
                    idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                    update.idOrder(); // вызов нового чека
                  } else {
                    if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
                      del.tempSale(); // чистим скидки
                      idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                      update.idOrder(); // вызов нового чека
                    } else {
                      popup(`фиксация чека ${ordersArr[0].id} не удалась`);
                      logger(`фиксация чека ${ordersArr[0].id} не удалась`);
                    }
                  };
                } else {
                  popup(`фиксация чека ${ordersArr[0].id} после оплаты QR кодом  не удалась`);
                  logger(`фиксация чека ${ordersArr[0].id} после оплаты QR кодом  не удалась чек ${JSON.stringify(ordersArr[0])} товары в нем ${JSON.stringify(productArr)}`);
                }
              } else {
                preloader.preloaderOff();
              }
            } else {
              handleError(xmlhttp.statusText); // вызвать обработчик ошибки с текстом ответа
            }
          };
          xmlhttp.send("a=5&b=4");
          // Таймаут 600 секунд
          var timeout = setTimeout( function(){ xmlhttp.abort(); handleError("Time over"); }, 600000);
          function handleError(message) {
            // обработчик ошибки
            popup(`Ошибка в ожидании QR кода: ${message}`);
          }
        } else {
          // ошибка запроса
          popup(`ошибка запроса: ${answ.error}`);
          logger(`ошибка запроса: ${answ.error} ${JSON.stringify(answ)} проведена успешно`);
          preloader.preloaderOff();
        }
         // кнопка проверки оплаты
        document.querySelector('.preloader__btn_verify').addEventListener('click', () => {
          logger(`нажата копка проверки оплаты, ID чека ${idOrderGlobal}`);
          // закрытие операции оплаты QRcode
          let url = `https://newpayb2b.pro/operation/result?sale_token=${saleToken}`;
          ieFetch({
            method : 'GET',
            url: url,
            headerApikey:  "api-key",
            key: keyQR,
            headerUserToken:  "user-token",
            token: tokenQR,
            headerType: "Content-Type",
            type: "application/json",
            send: '',
          })
          .then((json) => {
            let ans = JSON.parse(json);
            if(ans.code === 1) {
              if(ans.status === 0) {
                popup('Операция еще не оплачена');
              } else if (ans.status === 1 && `${ans.result}` === 'true') {
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
                  popup(`Оплата чека QR кодом ${ordersArr[0].id} проведена успешно`);
                  logger(`Оплата чека QR кодом ${ordersArr[0].id} проведена успешно`);
                  if (entry.ordersFixation(ordersArr[0], 1)) {
                    if (useAtol === 1 && !troubleAtol) { // если используется атол и не аварийный режим
                        if(devkkm.openOrder(ordersArr[0], productArr)) {
                        if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
                          devkkm.printOrder(ordersArr[0], productArr);
                          del.tempSale(); // чистим скидки
                          idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                          update.idOrder(); // вызов нового чека
                        } else {
                          popup(`фиксация чека ${ordersArr[0].id} не удалась`);
                          logger(`фиксация чека ${ordersArr[0].id} не удалась`);
                        }
                      } else {
                        popup(`печать чека ${ordersArr[0].id} не удалась. Проверьте фискальный регистратор и повторите попытку!`);
                        logger(`печать чека ${ordersArr[0].id} не удалась. Проверьте фискальный регистратор и повторите попытку!`);
                        troubleAtolCounter += 1;
                        if (troubleAtolCounter === 2) {
                          devkkm.init()
                        }
                        if (troubleAtolCounter === 3) {
                          btnQRcode.classList.add('trouble');
                        }
                        if (troubleAtolCounter > 3) {
                          troubleAtol = 1;
                          document.querySelector('#trouble-atol-toggle').checked = true;
                          telegramNote('Аварийный режим атола включён')
                          dbMethods.updateDb('settings', {value: 1}, { variable: 'troubleAtol' } );
                          popup('Перевод кассы в режим аварийной работы фискального регистратора');
                          postman.atolOrder();
                          troubleAtolCounter = 0;
                          if (entry.ordersFixation(ordersArr[0], 1)) {// фиксируем чек\
                            del.tempSale(); // чистим скидки
                            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                            update.idOrder(); // вызов нового чека
                          } else {
                            popup(`фиксация чека ${ordersArr[0].id} не удалась`);
                            logger(`фиксация чека ${ordersArr[0].id} не удалась`);
                          };
                        };
                      }
                    } else if (useAtol === 1 && troubleAtol) {
                      del.tempSale(); // чистим скидки
                      idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                      update.idOrder(); // вызов нового чека
                    } else {
                      if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
                        del.tempSale(); // чистим скидки
                        idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                        update.idOrder(); // вызов нового чека
                      } else {
                        popup(`фиксация чека ${ordersArr[0].id} не удалась`);
                        logger(`фиксация чека ${ordersArr[0].id} не удалась`);
                      }
                    };
                  } else {
                    popup(`фиксация чека ${ordersArr[0].id} после оплаты QR кодом  не удалась`);
                    logger(`фиксация чека ${ordersArr[0].id} после оплаты QR кодом  не удалась чек ${JSON.stringify(ordersArr[0])} товары в нем ${JSON.stringify(productArr)}`);
                  }
                } catch (e) {
                  logger(`Ошибка в ${e.message}`);
                }
                return;
              } else if(ans.status === 1 && `${ans.result}` === 'false') {
                preloader.preloaderOff();
                popup('Операция отменена клиентом');
                logger(`Операция по чеку ${ordersArr[0].id} отменена клиентом`);
              }
            } else {
              popup('Ошибка проверки оплаты QR кодом');
              logger(`ошибка запроса проверки оплаты QR кодом: ${ans.error}`);
            }
          })
          .catch((e) => {
            logger(`отправил на СПБ: ${JSON.stringify(data)} \n
            ошибка пришла ${JSON.stringify(e)}`);
          });
        });
      })
      .catch((e) => {
        logger(`отправил на СПБ: ${JSON.stringify(data)}
        ошибка пришла ${JSON.stringify(e)}`);
      })
    } else {
      popup('Соединение с сервером потерено, оплата QR кодом невозможна');
    }
  };
  this.cancelQRcode = function(idOrder, btn) {
    let order = subfunc.getOrderObg(7, idOrder);
    let productArr = subfunc.getProductArr(order);
    logger(`keyQR ${keyQR} tokenQR ${tokenQR} `)
    if(onlineSystem) {
      let data = { };
      data.sale_token = order.qrtoken;
      data.cost = Number(order.orderSumFinal);   // сумма которую должен оплатить клиент
      data['answer_url'] = `http://inside.erpka.online/sbp/?p=${pointCashbox}&trans=${order.qrtoken}`; //  адрес url куда отправлять сообщение о результатах платежа (не обязательный параметр если не требуется можно опустить)
      // создание операции
      ieFetch({
        method : 'POST',
        url: `https://newpayb2b.pro/api/s1/operation/return`,
        headerApikey:  "api-key",
        key: keyQR,
        headerUserToken:  "user-token",
        token: tokenQR,
        headerType: "Content-Type",
        type: "application/json",
        send: JSON.stringify(data),
      })
      .then((json) => {
        let answ = JSON.parse(json);
        if(answ.code === 1) { // если операция создана
          btn.classList.add('ready-payment');
          btn.textContent = 'Ден. возв.';
          order.status = -1;
          popup(`Возврат чека ${order.id} проведен успешно`);
          logger(`Возврат чека ${order.id} проведен успешно`);
          let q = `UPDATE orders SET status = -1 WHERE id = ${Number(order.id)}`;
          try {
            db.query(q);
            if (useAtol && !troubleAtol) { // если используется атол
              if(devkkm.printReturtOrder(order, productArr)) {
                popup(`Чек ${order.id} успешно отменен`);
                btn.textContent = 'Отменен';
                btn.setAttribute("disabled", "disabled");
              } else {
                popup(`Печать возврата чека ${order.id} не удалась`);
                logger(`Печать возврата чека ${order.id} не удалась`);
                troubleAtolCounter += 1;
                if (troubleAtolCounter == 2) {
                  devkkm.init()
                }
                if (troubleAtolCounter > 3) {
                  troubleAtol = 1;
                  document.querySelector('#trouble-atol-toggle').checked = true;
                  telegramNote('Аварийный режим атола включён')
                  dbMethods.updateDb('settings', {value: 1}, { variable: 'troubleAtol' } );
                  popup('Перевод кассы в режим аварийной работы фискального регистратора');
                  postman.atolOrder();
                  troubleAtolCounter = 0;
                  btn.textContent = 'Отменен';
                  btn.setAttribute("disabled", "disabled");
                };
              }
            } else if (useAtol === 1 && troubleAtol) {
              popup('Печать чеков невозможна, проверьте работу фискальника и выключите аварийный режим');
              btn.textContent = 'Отменен';
              btn.setAttribute("disabled", "disabled");
            } else {
              let q = `UPDATE orders SET status = -2 WHERE id = ${Number(order.id)}`;
              try {
                db.query(q);
                btn.textContent = 'Отменен';
                btn.setAttribute("disabled", "disabled");
              } catch (e) {
                logger(`чек ${Number(order.id)} не удалось записать, чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} ошибка ${e.message}`);
                popup(`чек ${Number(order.id)} не удалось записать`);
              }
            };
          } catch (e) {
            popup(`фиксация чека после отмены ${order.id} не удалась`);
            logger(`фиксация чека после отмены ${order.id} не удалась чек ${JSON.stringify(order)} товары в нем ${JSON.stringify(productArr)}`);
          }
      }})
      .catch((e) => {
        logger(`отправил на СПБ: ${JSON.stringify(data)}
        ошибка пришла ${JSON.stringify(e)}`);
      });
    }
  }
  //оплата на терминале
  this.cashlessTerminal = function() {
    sbbank.sum = ordersArr[0].orderSumFinal; //на сбер отправляем общую сумму чека
		sbbank.statusWaiting = 1; // открываем статус на ожидание оплаты
    preloader.preloaderTerminal();
    // вызов функции оплаты
		try {
      sbbank.paymentBank();
      while(sbbank.statusWaiting > 0){ } //ожидание статуса оплаты
      preloader.preloaderOff();
      if(sbbank.res == 0){ //если оплата прошла
        btnCashNon.classList.add('ready-payment');
        clientInput.setAttribute("disabled", "disabled");
        clientBtn.setAttribute("disabled", "disabled");
        promocodeInput.setAttribute("disabled", "disabled");
        promocodeWrap.setAttribute("disabled", "disabled");
        ordersArr[0].status = 1;
        popup(`Оплата чека ${ordersArr[0].id} проведена успешно`);
        logger(`Оплата чека ${ordersArr[0].id} проведена успешно`);
        if (entry.ordersFixation(ordersArr[0], 1)) {
          if (useAtol && !troubleAtol) { // если используется атол
            if(devkkm.openOrder(ordersArr[0], productArr)) {
              if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
                devkkm.bankSlip(sbbank.cheque, devkkm.printOrder(ordersArr[0], productArr))// банковский слип
                del.tempSale(); // чистим скидки
                idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                update.idOrder(); // вызов нового чека
              } else {
                popup(`фиксация чека ${ordersArr[0].id} не удалась`);
                logger(`фиксация чека ${ordersArr[0].id} не удалась`);
              }
            } else {
              popup(`печать чека ${ordersArr[0].id} не удалась. Проверьте фискальный регистратор и повторите попытку!`);
              logger(`печать чека ${ordersArr[0].id} не удалась. Проверьте фискальный регистратор и повторите попытку!`);
              troubleAtolCounter += 1;
              if (troubleAtolCounter === 2) {
                devkkm.init()
              }
              if (troubleAtolCounter === 3) {
                btnCashNon.classList.add('trouble');
              }
              if (troubleAtolCounter > 4) {
                troubleAtol = 1;
                document.querySelector('#trouble-atol-toggle').checked = true;
                telegramNote('Аварийный режим атола включён')
                dbMethods.updateDb('settings', {value: 1}, { variable: 'troubleAtol' } );
                popup('Перевод кассы в режим аварийной работы фискального регистратора');
                postman.atolOrder();
                troubleAtolCounter = 0;
                if (entry.ordersFixation(ordersArr[0], 1)) {// фиксируем чек\
                  del.tempSale(); // чистим скидки
                  idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
                  update.idOrder(); // вызов нового чека
                } else {
                  popup(`фиксация чека ${ordersArr[0].id} не удалась`);
                  logger(`фиксация чека ${ordersArr[0].id} не удалась`);
                };
              };
            }
          } else if (useAtol === 1 && troubleAtol) {
            del.tempSale(); // чистим скидки
            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
            update.idOrder(); // вызов нового чека
          } else {
            if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
              del.tempSale(); // чистим скидки
              idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
              update.idOrder(); // вызов нового чека
            } else {
              popup(`фиксация чека ${ordersArr[0].id} не удалась`);
              logger(`фиксация чека ${ordersArr[0].id} не удалась`);
            }
          };
        } else {
          popup(`фиксация чека после оплаты ${ordersArr[0].id} не удалась`);
          logger(`фиксация чека после оплаты ${ordersArr[0].id} не удалась чек ${JSON.stringify(ordersArr[0])} товары в нем ${JSON.stringify(productArr)}`);
        }
      } else {
        popup('Оплата остановлена!', true);
        preloader.fiscalErrorNote('Оплата остановлена!')
      }
    } catch (e) {
      popup('Оплата остановлена! Возникли проблемы в функции оплаты');
      logger(`Оплата остановлена! Возникли проблемы в функции оплаты ${e.message}`);
      preloader.fiscalErrorNote('Оплата остановлена!')
      try {
        devkkm.init()
      } catch (error) {

      }
      preloader.preloaderOff();
    }
  };

};
