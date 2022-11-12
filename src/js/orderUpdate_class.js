const update = new function Update() {
  // Обновление глобального идентификатора чека
  this.idOrder = function () { //переключение столов реализуется от олобального стола
    // alert(`функция Update.idOrder`)
    var q;
    let ans = false;
    try {
      // делаем запрос в таблицу, и ищем там чек который не сформирован (статус 0)
      q = `SELECT id FROM orders WHERE status = 0 and currentTable = ${currentTable}`;
      ans = db.query(q);
    } catch(e) {
      db.conn.close();
      if(!troubleAtol && useAtol) {
        q = `SELECT id FROM orders WHERE status = 1 and currentTable = ${currentTable} and chtype in (1,2)`;
        try {
          ans = db.query(q);
        } catch(e) {
          db.conn.close();
        }
      }
      // если такого чека нет, то создаем новый чек со статусом 0
      if (!ans) {
        try {
          // потрем глобальые переменные для нового чека
          productArr = [];
          const clientWrap = document.querySelector('.header__card_client');
          btnCashNon.classList.remove('ready-payment');
          btnQRcode.classList.remove('ready-payment');
          btnCash.classList.remove('trouble');
          btnQRcode.classList.remove('trouble');
          btnCashNon.classList.remove('trouble');

          clientWrap.classList.remove('client');

          clientWrap.classList.remove('client_discount');
          clientWrap.classList.remove('client_cashback');
          cashbackWrap.classList.remove('client__cashback_active');
          cardValue.classList.remove('client__value_write-off');
          cardValue.classList.remove('client__value_accumulate');
          const promocodeWrap = document.querySelector('.header__card_promocode');
          promocodeWrap.classList.remove('promocode');
          clientInput.removeAttribute("disabled");
          clientBtn.removeAttribute("disabled");
          promocodeInput.removeAttribute("disabled");
          promocodeWrap.removeAttribute("disabled");
          promotion_code = '';
          client = undefined;
          const cardApplyArr =  document.querySelectorAll('.header__card_apply');
          if(cardApplyArr.length > 0) {
            cardApplyArr.forEach((i) => {
              i.classList.remove('header__card_apply');
            });
          }
          inputHeaderArr.forEach((e) =>{
            e.value = '';
          })
          statusСashback = 0; // 0- карты нет
          globalCashback = 0; // общий кэшбек
          balanceFinal = 0; // остаток или накопление баллов клиента
          valueSurrender = 0; /*размер сдачи*/
          valueStock = 0; /*получено наличных*/
          orderSumFinal = 0; // сумма чека
          promotion_code = '' //промокод
          ordersArr = []; // глобальный чек
          productArr = []; // текущие товары в чеке
          saleObg = []; // массив скидок
          client = {}; //глобальный объект клиента
          outputValuePaymentArr.forEach((e)=> {
            e.textContent = '0';
          });
          outputValueStockArr.forEach((e)=> {
            e.textContent = 'Получено';
          });
          outputValueSurrenderArr.forEach((e)=> {
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
          }
          // создание новоего чека
          q = `INSERT INTO orders (status, currentTable, fiscalPrint, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, email, barista, offreckoning, idworkdayOffline, idworkdayOnline, tokenPoint, initiallyPoints, recordedLoyalty, qrtoken, certificate, endPointsCert, workdayId, recordedCertificate, nameClient) VALUES (0,${currentTable},${fiscalPrint},0,0,'0',0,0,0,'${mailPoint}','${barista}',0,'${idworkdayOffline}','${idworkdayOnline}','${tokenPoint}',0,0,'0',0,0,'${ansId[0].id}',0, ' ');`;
          db.query(q);
          //берем айди нового чека из таблицы
          q = `SELECT id FROM orders WHERE status = 0 and currentTable = ${currentTable}`;
          // alert(JSON.stringify(q))
          ans = db.query(q);
        } catch(e) {
          db.conn.close()
          popup('ошибка внутри функции обновления глобального чека'+ e.message);
          logger('ошибка внутри функции обновления глобального чека'+ e.message);
        }
      }
    }
    // обновляет айди чека
    idOrderGlobal = ans[0].id;
    this.orders();
  };
  // обновление глобального чека
  this.productArr = function() {
    // alert(`функция Update.productArr`)
    if (idOrderGlobal == undefined) {
      this.idOrder()
    }
    let ans, q;
    let productTableArr = []; //массив для пересбора товаров
    productArr = [] // очищаем глобальный массив
    try{
      q = `SELECT id, idProd, idOrder, name, productCategory, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum FROM orderItem WHERE idOrder = ${idOrderGlobal}`;
      ans = db.query(q);
      for( let i = 0; ans[i] != undefined; i++) {
        productTableArr.push(ans[i]);
      }
      // по пришедшим данным заполняем глобальный массив товаров
      productTableArr.forEach((e) => {
        let newProduct = new Product(e.id, e.idProd, e.idOrder, e.name, e.productCategory, e.bulkvalue, e.bulkuntils, e.price, e.sale, e.debitClientBonus, e.saleMaxPrice, e.interimPrice, e.offreckoningItem, e.cashbackPercent, e.amount, e.priceFinal, e.cashback, e.cashbackSum, e.productSum);
        productArr.push(newProduct);
      });
      // alert(JSON.stringify(productArr))
    } catch(e){
      try {
        db.conn.close()
      } catch (error) {

      }
      // alert(`ошибка внутри функции обновления массива товаров ${e.message}`)
    }
  }
  // обновление глобального чека, если ничего не передать обновит текущий, иначе смотрим внутри функции
  this.orders = function() {
    // запускаем отправки на сервер
    // alert(`функция Update.orders`)
    if (idOrderGlobal == undefined) {
      this.idOrder();
    }
    let ans, q;
    let ordersTableArr = []; //массив для создания чека
    // переписывание глобальной переменной чека
    try{
      q = `SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = ${idOrderGlobal}`;
      ans = db.query(q);
      for( let i = 0; ans[i] != undefined; i++) {
        ordersTableArr.push(ans[i]);
      }
      ordersArr = [];
      ordersTableArr.forEach((e) => {
        let order = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient);
        ordersArr.push(order);
      })
      const btnClientArr = document.querySelectorAll('.client__btn');
      // если есть клиент с накоплением баллов
      if (ordersArr[0].status == 0 && ordersArr[0].idClient > 0 && ordersArr[0].accumClientPoints == 1) {
        statusСashback = 1;
        globalCashback = Number(ordersArr[0].globalCashback);
        balanceFinal = Number(ordersArr[0].clientPoints);
        clientWrap.classList.add('client');
        clientWrap.classList.add('header__card_apply');
        clientWrap.classList.add('client_cashback');
        btnClientArr.forEach((j) =>{
          j.style.display = 'none';
        });
        const value = clientWrap.querySelector('.client__value');
        value.textContent = `Баллов:  ${ordersArr[0].clientPoints}`;
        cashbackWrap.classList.add('client__cashback_active');
      } else if (ordersArr[0].status == 0 && ordersArr[0].idClient > 0 && ordersArr[0].accumClientPoints == 2) {
        statusСashback = 2;
        balanceFinal = Number(ordersArr[0].clientPoints);
        clientWrap.classList.add('client');
        clientWrap.classList.add('header__card_apply');
        clientWrap.classList.add('client_cashback');
        btnClientArr.forEach((j) =>{
          j.style.display = 'none';
        });
        const value = clientWrap.querySelector('.client__value');
        value.textContent = `Баллов:  ${ordersArr[0].clientPoints}`;
        // info.style.display = 'flex'
        cashbackWrap.classList.add('client__cashback_active');
      } else if (ordersArr[0].status == 0 && ordersArr[0].idClient > 0 && ordersArr[0].accumClientPoints == 0) {
        clientWrap.classList.add('client');
        clientWrap.classList.add('header__card_apply');
        clientWrap.classList.add('client_discount');
        btnClientArr.forEach((j) =>{
          j.style.display = 'none';
        })
        const value = clientWrap.querySelector('.client__value_discount');
        value.textContent = `Применили скидку`;
      }
      if (ordersArr[0].status == 0 && (ordersArr[0].certificate > 0 || ordersArr[0].promo > 0)) {

        let code = ordersArr[0].certificate > 0 ? ordersArr[0].certificate : ordersArr[0].promo;
        logger(`Запрос по промокоду tokenPoint ${tokenPoint} subdomain ${subdomain} code ${code}`)
        checkPromo(tokenPoint, subdomain, code)
        .then((e) => {
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
          update.saleObg()
          orderCalc.renderReceipt();
        })
        .catch((e) => {
          preloader.preloaderOff()
          popup('Промокод не верный');
        });
      }
      if (ordersArr[0].status == 1 && ordersArr[0].chtype == 1) {
        btnCashNon.classList.add('ready-payment');
        clientInput.setAttribute("disabled", "disabled");
        clientBtn.setAttribute("disabled", "disabled");
        promocodeInput.setAttribute("disabled", "disabled");
        promocodeWrap.setAttribute("disabled", "disabled");
      };
      if (ordersArr[0].status == 1 && ordersArr[0].chtype == 2) {
        btnQRcode.classList.add('ready-payment');
        clientInput.setAttribute("disabled", "disabled");
        clientBtn.setAttribute("disabled", "disabled");
        promocodeInput.setAttribute("disabled", "disabled");
        promocodeWrap.setAttribute("disabled", "disabled");
      };
    } catch(e){
      try {
        db.conn.close()
      } catch (error) {

      }
      popup(`Ошибка в функции получения и обновления чека из базы данных при ${e.message}`);
      // db.conn.close()
    }
  };
  // функция обновления массива скидок. Вызываем при клике на новый товар для перезаписи по айдишникам
  this.saleObg = function() {
    let ans, q;
    let queryArr = '';
    let time = new Date(); // берем текущий час для скидки
    let minutes = `${time.getMinutes()}`;
    if(minutes.length == 1) {
      minutes = `0${minutes}`
    }
    let timeRange = Number(`${time.getHours()}${minutes}`);
    productArr.forEach((item) => {
      if (!queryArr) {
        queryArr = `${item.idProd}`
      } else {
        queryArr = `${queryArr},${item.idProd}`
      }
    })
    queryArr = `(${queryArr}, -1)`
    q = `SELECT techcards_id, MIN(discount) as disc from discounts where weekdays like '%${weekDay}%' and time_from <= ${Number(timeRange)} and time_to >= ${Number(timeRange)} AND (techcards_id in ${queryArr}) group by techcards_id`
    try {
      ans = db.query(q);
    } catch (e) {
      db.conn.close()
    }
    let saleObgArr = []
    // преобразование ответа в массив
    if (ans) {
      for( let i = 0; ans[i] != undefined; i++) {
        let sale = new Sale(ans[i].techcards_id, ans[i].disc)
        saleObgArr.push(sale);
      }
      saleObg = {};
      saleObgArr.forEach((e) => {
        saleObg[e.techcards_id] = e.discount;
      })
      if (saleObg[-1]) {
        productArr.forEach((e) => {
          e.sale = saleObg[-1];
        })
      }
      productArr.forEach((e) => {
        if (saleObg[e.idProd] && e.sale > saleObg[e.idProd]) {
          e.sale = saleObg[e.idProd];
        }
      })
    }
  }
}