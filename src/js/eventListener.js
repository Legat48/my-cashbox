// бОльшая часть обработчиков на кнопки

// обработчик ввода клиента
clientInput.addEventListener('input', ((e) => {
  // валидация поля(не даем ввести больше 11 символов если не вписывали +)
  if(clientInput.value > 11 && clientInput.value[0] != '+') {
    clientInput.value = clientInput.value.slice(0, 11)
  }
  // валидация поля(не даем ввести больше 12 символов если с +)
  if(clientInput.value > 12 && clientInput.value[0] == '+') {
    clientInput.value = clientInput.value.slice(0, 12)
  }
}))
// обработчик клика клиента
clientBtn.addEventListener('click', ((e)=> {
  let search = clientInput.value;
  // валидация ввода(что бы всегда было +7 в начале)
  if (search[0] === '9' && search.length == 10) {
    search = '+7' +  search.slice(0);
  }
  if (search[0] === '8' && search.length == 11) {
    search = '+7'  +  search.slice(1);
  }
  // если ввод больше 5(от 6 начинается QR код)
  if (search.length > 5) {
    preloader.preloader('body')
    keyboardClose()
    cashbackWrap.classList.remove('client__cashback_active');
    cardValue.classList.remove('client__value_write-off')
    cardValue.classList.remove('client__value_accumulate')
    btnWriteOff.classList.remove('imperfection')

    setting.globalVariables();
    // отправляем запрос в базу данных по клиенту
    send.getInfoClient(search)
    .then((e)=> {
      preloader.preloader('body')
      // обновляем глобальный объект
      client = new Client(e.name, e.phone, e.level.type, e.level.percent, e.email, Number(e.balance));
      if(client.type === 'discount') { // если клиент скидочный
        // создаем новую скидку в таблице
        db.query(`INSERT into discounts (time_from,time_to,weekdays,discount,temp,techcards_id) values (0,2400,'0123456',${Number(client.percent)},1,-1)`);
        update.saleObg(); // обновляем глобальные скидки
        //записываем клиента
        let q = `UPDATE orders SET idClient = '${e.phone}',clientPoints = ${Number(e.balance)}, initiallyPoints = ${Number(e.balance)}, nameClient = '${client.name}' WHERE id = ${idOrderGlobal}`;
        if (client.email) {
          q = `UPDATE orders SET idClient = '${e.phone}',clientPoints = ${Number(e.balance)}, initiallyPoints = ${Number(e.balance)}, email = '${e.email}', nameClient = '${client.name}' WHERE id = ${idOrderGlobal}`
        }
        try {
          db.query(q);
        } catch (error) {
          db.conn.close()
          logger('Ошибка в getInfoClient'+error.message)
        }
        //обновляем глобальный чек
        ordersArr[0].idClient = client.phone;
        ordersArr[0].accumClientPoints = 0;
        ordersArr[0].clientPoints = 0;
        ordersArr[0].nameClient = client.name;
        if(client.email) {
          ordersArr[0].email = client.email;
        }
        //визуальное отображение
        clientWrap.classList.add('client');
        if(!clientWrap.matches('.header__card_apply')) {
          clientWrap.classList.add('header__card_apply');
        }
        if(!clientWrap.matches('.header__card_apply')) {
          clientWrap.classList.add('header__card_apply');
        }
        clientWrap.classList.add('client_discount');
        const info = clientWrap.querySelector('.client__info');
        if (client.name.length > 0) {
          info.textContent = client.name;
        }
        const value = clientWrap.querySelector('.client__value_discount');
        value.textContent = `Скидка:  ${(100 - Number(client.percent) * 100)}%`;
        value.display = 'flex'
        // перерисовываем
        orderCalc.renderReceipt()
      }
      // обработка клиента с кэшбэком
      if(client.type === 'cashback') {
        const btnClientArr = document.querySelectorAll('.client__btn');
        btnClientArr.forEach((j) =>{
          j.style.display = 'block'
        })
        clientWrap.classList.add('client');
        if(!clientWrap.matches('.header__card_apply')) {
          clientWrap.classList.add('header__card_apply');
        }
        clientWrap.classList.add('client_cashback');
        const info = clientWrap.querySelector('.client__info');
        if (client.name.length > 0) {
          info.textContent = client.name;
        }
        info.style.display = 'none'
        // приравнивание глобальной переменной к полученным данным
        balanceFinal = client.balance;
        const value = clientWrap.querySelector('.client__value');
        value.textContent = `Баллов:  ${client.balance}`;
        btnClientArr.forEach((j) => {
          // обработка кликов на кнопки
          j.addEventListener('click', ((e) => {
            if (e.target.id === 'client-btn-accumulate') {
              statusСashback = 1
              globalCashback = Math.floor((100 - Number(client.percent)*100)) / 100;
              let q = `UPDATE orders SET idClient = '${client.phone}',globalCashback = ${Number(globalCashback)},clientPoints = ${Number(client.balance)}, initiallyPoints = ${Number(client.balance)}, accumClientPoints = 1, nameClient = '${client.name}' WHERE id = ${idOrderGlobal}`;
              if (client.email) {
                q = `UPDATE orders SET idClient = '${client.phone}',globalCashback = ${Number(globalCashback)},clientPoints = ${Number(client.balance)}, initiallyPoints = ${Number(client.balance)}, accumClientPoints = 1 ,email = '${client.email}', nameClient = '${client.name}' WHERE id = ${idOrderGlobal}`
              }
              try {
                db.query(q);
              } catch(e) {
                db.conn.close()
                logger('Ошибка в getInfoClient'+e.message)
              }
              ordersArr[0].idClient = client.phone;
              ordersArr[0].accumClientPoints = 1;
              ordersArr[0].clientPoints = Number(client.balance);
              ordersArr[0].nameClient = client.name;
              if(client.email) {
                ordersArr[0].email = client.email;
              }
            } else {
              statusСashback = 2
              let q = `UPDATE orders SET idClient = '${client.phone}',clientPoints = ${Number(client.balance)}, initiallyPoints = ${Number(client.balance)}, accumClientPoints = 2, nameClient = '${client.name}' WHERE id = ${idOrderGlobal}`;
              if (client.email) {
                q = `UPDATE orders SET idClient = '${client.phone}',clientPoints = ${Number(client.balance)}, initiallyPoints = ${Number(client.balance)}, accumClientPoints = 2, email = '${client.email}', nameClient = '${client.name}' WHERE id = ${idOrderGlobal}`
              }
              try {
                db.query(q);
              } catch(e) {
                db.conn.close()
                logger('Ошибка в getInfoClient'+e.message)
              }
              ordersArr[0].idClient = client.phone;
              ordersArr[0].accumClientPoints = 2;
              ordersArr[0].clientPoints = Number(client.balance);
              ordersArr[0].nameClient = client.name;
              if(client.email) {
                ordersArr[0].email = client.email;
              }
            }
            btnClientArr.forEach((j) =>{
              j.style.display = 'none'
            })
            info.style.display = 'flex'
            cashbackWrap.classList.add('client__cashback_active');

            // добавление прелоадера с отменой
            orderCalc.renderReceipt()
          }))
        });
      }
    })
  }
}))
// сброс клиента
clientWrap.addEventListener('click', (e) => {
  e.preventDefault();
  if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
    if(clientWrap.matches('.header__card_apply') && (!e.target.closest('#client-btn-accumulate') && !e.target.closest('#client-btn-write-off'))) {
      preloader.cancelConfirmClient();
    }
  } else {
    popup('Сбросить клиента в оплаченном чеке невозможно');
  }
});
// сброс промокода
promocodeWrap.addEventListener('click', (e) => {
  e.preventDefault();
  if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
    if(promocodeWrap.matches('.header__card_apply')) {
      preloader.cancelConfirmCashback();
    }
  } else {
    popup('Сбросить промокод в оплаченном чеке невозможно');
  }
});
// ввод промокода/сертификата
promocodeBtn.addEventListener('click', ((e) => {
  if (promocodeInput.value > 0) {
    preloader.preloader('body')
    keyboardClose()
    setting.globalVariables();
    let code = promocodeInput.value;
    logger(`Запрос по промокоду tokenPoint ${tokenPoint} subdomain ${subdomain} code ${code}`)
    checkPromo(tokenPoint, subdomain, code).then((e) => {
      preloader.preloaderOff()
      if(e.hasOwnProperty('certificate')) {
        try {
          let q = `UPDATE orders SET offreckoning = ${Number(e.offreckoning)}, endPointsCert = ${Number(e.offreckoning)}, certificate = ${Number(e.certificate)}, recordedCertificate = 1 WHERE id = ${idOrderGlobal}`;
          try {
            db.query(q);
            cert = e.certificate
            balanceFinalCert = e.offreckoning;
            ordersArr[0].certificate = e.certificate
            ordersArr[0].offreckoning = e.offreckoning
            ordersArr[0].endPointsCert = e.offreckoning
            promocodeWrap.classList.add('certificate');
          } catch(error) {
            try {
              db.conn.close()
            } catch (error) {

            }
            logger('Ошибка в checkPromo'+error.message)
            throw 'Ошибка в checkProm';
          }
        }
        catch (error) {
          popup('Ошибка при проверке сертификата \n' + error.message + '\n')
          logger('Ошибка при проверке сертификата \n' + error.message + '\n')
          reject('Ошибка при проверке сертификата')
        }
        if(!promocodeWrap.matches('.header__card_apply')) {
          promocodeWrap.classList.add('header__card_apply');
        }
        update.saleObg()
        orderCalc.renderReceipt();
        return
      }
      try {
        db.query(`UPDATE orders SET promo = '${code}' WHERE id = ${idOrderGlobal}`);
        promotion_code = code //промокод
        ordersArr[0].promo = promotion_code
      } catch (error) {
        try {
          db.conn.close()
        } catch (error) {

        }
      }
      promocodeWrap.classList.add('promocode');
      promoValue.textContent = `${e.percent}%`;
      if(!promocodeWrap.matches('.header__card_apply')) {
        promocodeWrap.classList.add('header__card_apply');
      }
      orderCalc.renderReceipt()
    }).catch((e) => {
      preloader.preloaderOff()
      popup('Промокод не верный')
    })
  }
}))
// сверка итогов
btnBankReconciliation.addEventListener('click', ((e) =>{
  if (useTerminal) {
    sbbank.reconciliation();
  }
}))
// оплата безналом
btnCashNon.addEventListener('click', (()=> {
  logger(`нажали кнопку оплаты безналом  айди чека id ${idOrderGlobal} статус терминала ${useTerminal} статус фискальника ${useAtol}`);
  if (productArr.length > 0 && !btnQRcode.classList.contains('ready-payment')) { // если товары есть в чете
    if(!btnCashNon.classList.contains('ready-payment') && !(ordersArr[0].chtype == 1 && ordersArr[0].status == 1)) {
      if (entry.productArrFixation(ordersArr[0])) {
        ordersArr[0].chtype = 1; // значение для атола
        if (useTerminal) {
          send.cashlessTerminal(); //отправляем на терминал
          // делаем отправку на терминал (остальный вызов функций находится там)
        } else if (useAtol && !troubleAtol) { // если используется атол
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
                btnCashNon.classList.add('trouble');
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
            troubleAtolCounter += 1;
            if (troubleAtolCounter === 2) {
              devkkm.init()
            }
            if (troubleAtolCounter === 3) {
              btnCashNon.classList.add('trouble');
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
        } else if (useAtol && troubleAtol) {
          if (entry.ordersFixation(ordersArr[0], 1)) {// фиксируем чек\
            del.tempSale(); // чистим скидки
            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
            update.idOrder(); // вызов нового чека
          } else {
            popup(`фиксация чека ${ordersArr[0].id} не удалась`);
            logger(`фиксация чека ${ordersArr[0].id} не удалась`);
          }
        } else {
          if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
            del.tempSale(); // чистим скидки
            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
            update.idOrder(); // вызов нового чека
          } else {
            popup(`фиксация чека ${ordersArr[0].id} не удалась`);
            logger(`фиксация чека ${ordersArr[0].id} не удалась`);
          }
        }
      } else {
        popup(`фиксация товаров в чеке ${ordersArr[0].id} не удалась, повторите попытку`);
        logger(`фиксация товаров в чеке ${ordersArr[0].id} не удалась, повторите попытку`);
      }
    } else if (btnCashNon.classList.contains('ready-payment')) {
      if (entry.ordersFixation(ordersArr[0], 1)) {
        if (useAtol && !troubleAtol) { // если используется атол
          if(devkkm.openOrder(ordersArr[0], productArr)) {
            if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
              devkkm.printOrder(ordersArr[0], productArr)
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
        } else if (useAtol && troubleAtol) {
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
        }
      } else {
        popup(`фиксация чека после оплаты ${ordersArr[0].id} не удалась`);
        logger(`фиксация чека после оплаты ${ordersArr[0].id} не удалась чек ${JSON.stringify(ordersArr[0])} товары в нем ${JSON.stringify(productArr)}`);
      }
    }
  } else if (btnQRcode.classList.contains('ready-payment')) {
    popup('чек оплачен QR кодом');
  }
}));
// оплата QRcod
btnQRcode.addEventListener('click', (()=> {
  logger(`нажали кнопку оплаты qr кодом айди чека id ${idOrderGlobal} статус терминала ${useTerminal} статус фискальника ${useAtol}`);

  if (productArr.length > 0 && useQRcode && !btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) { // если товары есть в чеке
    if (entry.productArrFixation(ordersArr[0])) {
      send.cashlessQRcode(); //отправляем на оплату qr кодом
    } // фиксируем товары в базе данных
  } else if (btnQRcode.classList.contains('ready-payment')) {
    if (entry.ordersFixation(ordersArr[0], 1)) {
      if (useAtol === 1 && !troubleAtol) { // если используется атол
        if(devkkm.openOrder(ordersArr[0], productArr)) {
          if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
            devkkm.printOrder(ordersArr[0], productArr)
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
            }
          }
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
      }
    } else {
      popup(`фиксация чека после оплаты ${ordersArr[0].id} не удалась`);
      logger(`фиксация чека после оплаты ${ordersArr[0].id} не удалась чек ${JSON.stringify(ordersArr[0])} товары в нем ${JSON.stringify(productArr)}`);
    }
  } else if (btnCashNon.classList.contains('ready-payment')) {
    popup('чек оплачен безналичными');
  };
}));
// оплата налом
btnCash.addEventListener('click', (()=> {
  interfaceApp.focusReset()
  logger(`нажали кнопку оплаты налом айди чека id ${idOrderGlobal} статус терминала ${useTerminal} статус фискальника ${useAtol}`);
  if(!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment') && productArr.length > 0) {
    ordersArr[0].chtype = 0;
    ordersArr[0].status = 1;
    if (btnCash.classList.contains('ready-payment')) {
      if (entry.productArrFixation(ordersArr[0])) {
        if (useAtol === 1 && !troubleAtol) { // если используется атол
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
              devkkm.init();
            }
            if (troubleAtolCounter === 3) {
              btnCash.classList.add('trouble');
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
            }
          }
        } else if (useAtol === 1 && troubleAtol) {
          if (entry.ordersFixation(ordersArr[0], 1)) {// фиксируем чек\
            del.tempSale(); // чистим скидки
            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
            update.idOrder(); // вызов нового чека
          } else {
            popup(`фиксация чека ${ordersArr[0].id} не удалась`);
            logger(`фиксация чека ${ordersArr[0].id} не удалась`);
          }
        } else {
          if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
            del.tempSale(); // чистим скидки
            idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
            update.idOrder(); // вызов нового чека
          } else {
            popup(`фиксация чека ${ordersArr[0].id} не удалась`);
            logger(`фиксация чека ${ordersArr[0].id} не удалась`);
          }
        }
      } else {
        popup(`фиксация товаров в чеке ${ordersArr[0].id} не удалась, повторите попытку`);
        logger(`фиксация товаров в чеке ${ordersArr[0].id} не удалась, повторите попытку`);
      }
    }
  } else if (btnCashNon.classList.contains('ready-payment')) {
    popup('Товар оплачен безналом');
  } else if (btnQRcode.classList.contains('ready-payment')) {
    popup('Товар оплачен безналом');
  }
}));
//X отчет
btnReportX.addEventListener('click', (()=> {
  if (useAtol === 1) { // если используется атол
    try {
      devkkm.printWorcdayInfo();
      devkkm.ReportX();
    } catch (error) {
      popup(error.message)
      try {
        devkkm.init();
      } catch (error) {

      }
    }
  }
}));
//печать последнего чека
btnLastOrder.addEventListener('click', (()=> {
  if (useAtol === 1) { // если используется атол
    try {
      devkkm.lastOrder();
    } catch (error) {
      popup(error.message)
      try {
        devkkm.init();
      } catch (error) {

      }
    }
  }
}));
// обновление меню
btnUpdate.addEventListener('click', (() => {
  preloader.preloader('body');
  try {
    setting.updateMenu(tokenPoint, subdomain)
  } catch (error) {
    popup('Ошибка при обновлении меню');
    try {
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray))
      menuApp.renderList('category', menuApp.load('menuDb', null));
      preloader.preloaderOff();
    } catch (error) {
      preloader.preloaderOff();
      logger(`Ошибка при обновлении меню + ${error.message}`);
    }
  }
}));
// обновление меню
reloadMenu.addEventListener('click', (() => {
  preloader.preloader('body');
  try {
    setting.updateMenu(tokenPoint, subdomain)
  } catch (error) {
    popup('Ошибка при обновлении меню');
    try {
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray))
      menuApp.renderList('category', menuApp.load('menuDb', null));
      preloader.preloaderOff();
    } catch (error) {
      preloader.preloaderOff();
      logger(`Ошибка при обновлении меню + ${error.message}`);
    }
  }
}));
// Очистить чек
clearOrderBtn.addEventListener('click', (() => {
  if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
    del.order();
  } else {
    popup('очистить оплаченный чек невозможно');
  }
}));

const closeWorkDayBtn = document.querySelector('#menu-btn-exit');
closeWorkDayBtn.addEventListener('click', (() => {
  if(useChecklist) {
    checklist.render(2, true);
  }
  closeWorkDayClick();
}))

closeWorkDayPinBtn.addEventListener('click', (() => {
  closeWorkDayClick();
}))

const btnDayNext = document.querySelector('.formed-orders__navbar-btn_next')
const btnDayPrev = document.querySelector('.formed-orders__navbar-btn_prev')
const btnOrderStatLimit = document.querySelector('.formed-orders__limit')

btnOrderStatLimit.addEventListener('click', () => {
  orderRenderLimit = 999;
  interfaceApp.renderOrderByDay(dateStrGlobal)
})


function navBtnClick(event) {
  event.preventDefault()
  let incr = 0, q = '', ans = '';
  if(event.target.classList.contains('formed-orders__navbar-btn_next')) {
    incr = 1
  } else {
    incr = -1
  }
  try {
    let dArr = dateStrGlobalTemp.split('-')
    var d = new Date(Number(dArr[0]), Number(dArr[1]) - 1, Number(dArr[2]));
    d.setDate(d.getDate() + incr);
    dateStrGlobalTemp = d.getFullYear() + '-' + AddLeftG(d.getMonth() + 1, '0', 2) + '-' + AddLeftG(d.getDate(), '0', 2);
    try {
      q = `SELECT id FROM orders WHERE date = '${dateStrGlobalTemp}'`
      ans = db.query(q);
      interfaceApp.renderOrderByDay(dateStrGlobalTemp)
      if(dateStrGlobal === dateStrGlobalTemp) {
        btnDayNext.setAttribute('disabled', 'disabled')
      } else {
        btnDayNext.removeAttribute('disabled')
      }
    } catch (error) {
      try {
        db.conn.close()
      } catch (error) {

      }
      popup('Данные за предыдущий день архивированы')
    }
  } catch (error) {

  }
}

btnDayNext.addEventListener('click', navBtnClick)
btnDayPrev.addEventListener('click', navBtnClick)

const iframeComtainer = document.querySelector('.iframe-container')
const suppliesBtn = document.querySelector('#supplies')

suppliesBtn.addEventListener('click', () => {
  const iframeList = document.querySelectorAll('.iframe-container__item')
  if(iframeList.length > 0) {
    iframeComtainer.classList.remove('iframe-container_active')
    iframeList.forEach((item) => {
      item.remove()
    })
  }
  const iframe = document.createElement("iframe");
  iframeComtainer.classList.add('iframe-container_active')
  iframe.classList.add('iframe-container__item')
  iframe.setAttribute('title','pickcha')
  iframe.setAttribute('frameborder','0')
  iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
  iframe.onload = function() {
    iframeComtainer.classList.add('iframe-container_active')
  };
  iframe.onerror = function() {
    popup('Ошибка загрузки окна поставок', true)
  };
  iframe.src = `http://bridge.cwsystem.ru/engine/?class=API&method=makeorderface&key=nokey`;
  logger('Открытие поставок:'+iframe.src)
  iframeComtainer.appendChild(iframe);
})

// кнопка поставок
const suppliesBtnReturn = document.querySelector('.iframe-container__btn');
suppliesBtnReturn.addEventListener('click', (e) => {
  iframeComtainer.classList.remove('iframe-container_active')
  const iframeList = document.querySelectorAll('.iframe-container__item')
  if(iframeList.length > 0) {
    iframeList.forEach((item) => {
      item.remove()
      iframeComtainer.classList.remove('iframe-container_active')
    })
  }
})


btnWriteoff.addEventListener('click', () => {
  logger(`Нажали кнопку списание айди чека id ${idOrderGlobal}`);
  if (entry.ordersFixation(ordersArr[0], 2)) {// фиксируем чек\
    del.tempSale(); // чистим скидки
    idOrderGlobal = undefined; // удаляем глобал и обновляем страницу
    update.idOrder(); // вызов нового чека
  } else {
    popup(`списание чека ${ordersArr[0].id} не удалась`);
    logger(`списание чека ${ordersArr[0].id} не удалась`);
  }
})


