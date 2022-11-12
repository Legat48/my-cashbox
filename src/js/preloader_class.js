const preloader = new function() {
  // стандартная заглушка, если обжект true, в селектор передается обьект
  this.preloader = function (selector, obj,) {
    const newPreloader = el('div', 'preloader', el('div', 'lds-spinner', [
      el('div'),el('div'),el('div'),el('div'),el('div'),el('div'),el('div'),el('div'),el('div'),el('div'),el('div'),el('div'),
    ]))
    if(obj) {
      const loaderItem = selector.querySelector(`.preloader`);
      if(loaderItem) {
      selector.removeChild(loaderItem)
      return;
      }
      selector.appendChild(newPreloader)
      return;
    }

    const root = document.querySelector(`.${selector}`)
    const loaderItem = root.querySelector(`.preloader`);
    if(loaderItem) {
      root.removeChild(loaderItem)
      return;
    }
    root.appendChild(newPreloader)
  }
  this.preloaderOff = function() {
    const preloaderArr = document.querySelectorAll('.preloader');
    try {
      if(preloaderArr.length > 0) {
        preloaderArr.forEach((e) => {
          e.remove()
        })
      }
    } catch (error) {

    }

  }
  // заглушка прии оплате через кюаркод
  this.preloaderQRcode = function () {
    const root = document.querySelector(`.body`);
    const newPreloader = el('div', 'preloader', [
      el('div', 'preloader__content preloader__content_qr', [
        el('h3', 'preloader__title',[
          'Ожидание оплаты...'
        ]),
        el('div', 'preloader__btn-group', [
          el('button', 'preloader__btn preloader__btn_qr btn preloader__btn_verify', 'Проверить'),
          el('button', 'preloader__btn preloader__btn_qr btn preloader__btn_cancel', 'Отмена'),
        ])
      ])
    ]
    )
    // обработка клика на кнопку "отмена" закрыть окно ожидания
    newPreloader.querySelector('.preloader__btn_cancel').addEventListener('click', () => {
      // закрытие операции оплаты QRcode
      ieFetch({
        method : 'POST',
        url: `https://newpayb2b.pro/api/s1/operation/cancel`,
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
          // оплата отменена
          preloader.preloaderOff()
        } else {
          popup(`Ошибка запроса отмены оплаты QR кодом: ${JSON.stringify(ans)}`)
          logger(`Ошибка запроса отмены оплаты QR кодом: ${JSON.stringify(ans)}`)
        }
      })
      .catch((e) => {
        logger(`отправил на СПБ: ${JSON.stringify(data)} \n
        ошибка пришла ${JSON.stringify(e)}`)
      })
    })

    const loaderItem = root.querySelector(`.preloader`);
    if(loaderItem) {
      root.removeChild(loaderItem)
      return;
    }
    root.appendChild(newPreloader)
  }

  // заглушка при оплате через терминал сбербанка
  this.preloaderTerminal = function () {
    const root = document.querySelector(`.body`);
    const newPreloader = el('div', 'preloader', [
      el('div', 'preloader__content preloader__content_flex', [
        el('span', 'preloader__text preloader__text_terminal',[
          'Ожидание оплаты...',
        ]),
        el('span', 'preloader__text preloader__text_terminal',[
          'Не закрывайте кассу'
        ]),
      ])
    ]
    )
    const loaderItem = root.querySelector(`.preloader`);
    if(loaderItem) {
      root.removeChild(loaderItem)
      return;
    }
    root.appendChild(newPreloader)
  }
  // Попап на сброса поля "клиент"
  this.cancelConfirmClient = function () {
    const root = document.querySelector(`.body`);
    let btnText = ''
    let activeBtn = null;
    if(ordersArr[0].accumClientPoints == 1) {
      btnText = 'Переключить на списание'
    } else if(ordersArr[0].accumClientPoints == 2) {
      btnText = 'Переключить на накопление'
    }
    if(btnText.length > 0) {
      activeBtn = el('button', 'preloader__btn btn preloader__btn_change', btnText);
      activeBtn.addEventListener('click', ()=>{
        if(ordersArr[0].accumClientPoints == 1) {
          ordersArr[0].accumClientPoints = 2;
          statusСashback = 2;
          let q = `UPDATE orders SET  accumClientPoints = 2 WHERE id = ${idOrderGlobal}`;
          try {
            db.query(q);
          } catch(e) {
            db.conn.close();
            logger('Ошибка в cancelConfirmClient'+e.message)
          }
          update.orders();
        } else if(ordersArr[0].accumClientPoints == 2) {
          statusСashback = 1;
          ordersArr[0].accumClientPoints = 1;
          let q = `UPDATE orders SET  accumClientPoints = 1 WHERE id = ${idOrderGlobal}`;
          try {
            db.query(q);
          } catch(e) {
            db.conn.close();
            logger('Ошибка в cancelConfirmClient'+e.message)
          }
          update.orders();
        }
        preloader.preloaderOff()
        orderCalc.renderReceipt();
      })
    }

    const newPreloader = el('div', 'preloader', [
      el('div', 'preloader__content preloader__content_flex', [
        el('span', 'preloader__text',[
          'Сбросить данные клиента?'
        ]),
        el('button', 'preloader__btn btn preloader__btn_true', 'Да'),
        el('button', 'preloader__btn btn preloader__btn_false', 'Нет'),
        activeBtn
      ])
    ]
    )
    // сброс клиента
    newPreloader.querySelector('.preloader__btn_true').addEventListener('click', () => {
      const clientWrap = document.querySelector('.header__card_client');
      const promocodeWrap = document.querySelector('.header__card_promocode');

      clientWrap.classList.remove('header__card_apply')
      clientWrap.classList.remove('client');
      clientWrap.classList.remove('client_discount');
      clientWrap.classList.remove('client_cashback');
      client = undefined;
      ordersArr[0].idClient = '';
      ordersArr[0].accumClientPoints = 0;
      ordersArr[0].clientPoints = 0;
      ordersArr[0].email = mailPoint;
      ordersArr[0].initiallyPoints = 0;
      saleObg = {};
      // обнуление скидок в массиве товаров глобальном
      productArr.forEach((e) => {
        e.sale = 1
      })
      let q = `UPDATE orders SET idClient = '', accumClientPoints = 0, clientPoints = 0, initiallyPoints = 0, email = '${mailPoint}' WHERE id = ${idOrderGlobal}`;
      try {
        db.query(q);
      } catch (error) {
        db.conn.close()
      }
      del.tempSale();
      if (!onlineSystem) {
        popup('Отсутствует связь с сервером')
        return
      }
      preloader.preloaderOff()

      if (ordersArr[0].promo > 0 || ordersArr[0].certificate > 0) {
        preloader.preloader('body')
        keyboardClose()
        setting.globalVariables();
        let code = ordersArr[0].certificate > 0 ? ordersArr[0].certificate: ordersArr[0].promo;
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
                throw error.message
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
          orderCalc.renderReceipt()
        })
        .catch((e) => {
          preloader.preloaderOff()
          popup('Промокод не верный')
          // alert(JSON.stringify(e))
        })
      }
      orderCalc.renderReceipt()
    })
    newPreloader.querySelector('.preloader__btn_false').addEventListener('click', () => {
      preloader.preloaderOff()
    })
    newPreloader.addEventListener('click', (e) => {
      if(!e.target.closest('.preloader__content')) {
        preloader.preloaderOff()
      }
    })
    const loaderItem = root.querySelector(`.preloader`);
    if(loaderItem) {
      root.removeChild(loaderItem)
      return;
    }
    root.appendChild(newPreloader)
  }

  // Попап на сброса поля "клиент"
  this.cancelConfirmCashback = function () {
    const root = document.querySelector(`.body`);
    const newPreloader = el('div', 'preloader', [
      el('div', 'preloader__content preloader__content_flex', [
        el('span', 'preloader__text',[
          'Сбросить промокод/сертификат?'
        ]),
        el('button', 'preloader__btn btn preloader__btn_true', 'Да'),
        el('button', 'preloader__btn btn preloader__btn_false', 'Нет'),
      ])
    ]
    )
    // обработчик клика на сброс промокода
    newPreloader.querySelector('.preloader__btn_true').addEventListener('click', () => {
      const clientWrap = document.querySelector('.header__card_client');
      const promocodeWrap = document.querySelector('.header__card_promocode');
      // сбрасываем визуал
      promocodeWrap.classList.remove('header__card_apply')
      promocodeWrap.classList.remove('promocode');
      promocodeWrap.classList.remove('certificate');
      // сбрасываем промокод
      ordersArr[0].promo = '0';
      promotion_code = '0';
      cert = '';
      balanceFinalCert = '';
      ordersArr[0].promo = '0';
      ordersArr[0].certificate = '0';
      ordersArr[0].offreckoning = '0';
      ordersArr[0].endPointsCert = '0';
      // убираем его из базы данных
      let q = `UPDATE orders SET promo = '0', offreckoning = 0, endPointsCert = 0, certificate = 0  WHERE id = ${idOrderGlobal}`;
      try {
        db.query(q);
      } catch(e) {
        db.conn.close()
        logger('Ошибка в cancelConfirmCashback'+e.message)
      }
      // удаляем все временные скидки
      try{
        q = "DELETE FROM discounts WHERE temp = 1";
        db.query(q);
      } catch(e){
        try {
          db.conn.close()
        } catch (error) {
        }
        logger('Ошибка в cancelConfirmCashback'+e.message)
      }

      // обнуление скидок в массиве товаров глобальном
      productArr.forEach((e) => {
        e.sale = 1
      })
      if (ordersArr[0].accumClientPoints == 0 && ordersArr[0].idClient > 0) {
        client = undefined;
        let q = `UPDATE orders SET idClient = '' WHERE id = ${idOrderGlobal}`;
        try {
          db.query(q);
        } catch(error) {
          db.conn.close()
          logger('Ошибка в обнулении скидок'+e.message)
        }
        send.getInfoClient(ordersArr[0].idClient).then((e)=> {
          preloader.preloader('body')
          // обновляем глобальный объект
          client = new Client(e.name, e.phone, e.level.type, e.level.percent, e.email, Number(e.balance));
          try {
            db.query(`INSERT into discounts (time_from,time_to,weekdays,discount,temp,techcards_id) values (0,2400,0123456,${Number(client.percent)},1,-1)`);
          } catch (error) {
            db.conn.close()
            logger('Ошибка в getInfoClient'+error.message)
          }
          update.saleObg(); // обновляем глобальные скидки
          //записываем клиента
          let q = `UPDATE orders SET idClient = '${e.phone}',clientPoints = ${Number(e.balance)}, initiallyPoints = ${Number(e.balance)} WHERE id = ${idOrderGlobal}`;
          if (client.email) {
            q = `UPDATE orders SET idClient = '${e.phone}',clientPoints = ${Number(e.balance)}, initiallyPoints = ${Number(e.balance)}, email = '${e.email}' WHERE id = ${idOrderGlobal}`
          }
          try {
            db.query(q);
          } catch (error) {
            db.conn.close()
            logger('Ошибка в getInfoClient'+error.message+'\n'+q)
          }
          //обновляем глобальный чек
          ordersArr[0].idClient = client.phone;
          ordersArr[0].accumClientPoints = 0;
          ordersArr[0].clientPoints = 0;
          if(client.email) {
            ordersArr[0].email = client.email;
          }
          //визуальное отображение
          clientWrap.classList.add('client');
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
          document.querySelector('#promocode-input').value = '';
          preloader.preloaderOff()
          })
      }
      orderCalc.renderReceipt()
      document.querySelector('#promocode-input').value = '';
      preloader.preloaderOff()
    })
    newPreloader.querySelector('.preloader__btn_false').addEventListener('click', () => {
      preloader.preloaderOff()
    })
    newPreloader.addEventListener('click', (e) => {
      if(!e.target.closest('.preloader__content')) {
        preloader.preloaderOff()
      }
    })
    const loaderItem = root.querySelector(`.preloader`);
    if(loaderItem) {
      root.removeChild(loaderItem)
      return;
    }
    root.appendChild(newPreloader)
  }

  this.fiscalErrorNote = (text) => {
    const root = document.querySelector(`.body`);
    const newPreloader = el('div', 'preloader preloader_note', [
      el('div', 'preloader__content preloader__content_qr', [
        el('h3', 'preloader__title',[
          text,
        ]),
        el('div', 'preloader__btn-group preloader__btn-group_note', [
          el('button', 'preloader__btn preloader__btn_qr btn preloader__btn_verify', 'Прочитано'),
        ])
      ])
    ]
    )
    newPreloader.querySelector('.preloader__btn_verify').addEventListener('click', () => {
      const loaderItem = root.querySelector(`.preloader_note`);
      if(loaderItem) {
        root.removeChild(loaderItem)
      }
    })
    root.appendChild(newPreloader)
  }
}
