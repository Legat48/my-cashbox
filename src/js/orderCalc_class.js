// обнуление всех полей и значений
const orderCalc = new function () {
  this.resetCounter = function() {
    valueStock = 0;
    valueSurrender = 0;
    outputValueStockArr.forEach((j) => {
      j.textContent = 'Получено: ';
    });
    outputValueSurrenderArr.forEach((j) => {
      j.textContent = 'Сдача: ';
    });
    btnCash.textContent = 'Наличные';
    btnCash.classList.remove('.ready-payment')
    outputValueSurrenderArr.forEach((e) => {
      e.style.opacity = 0;
    });
    outputValueStockArr.forEach((e) => {
      e.style.opacity = 0;
    });
  };
  // счетчик чека
  this.counter = function () {
    let balance = 0; //локальный баланс для счета
    balanceFinal = ordersArr[0].clientPoints;
    balanceFinalCert = ordersArr[0].offreckoning;
    ordersArr[0].orderSum = 0 // сумма чека без скидок
    ordersArr[0].amount = 0; // кол-во товаров в чеке всего
    ordersArr[0].interimSum = 0; // промежуточная сумма чека без применения сертификата
    ordersArr[0].orderSumFinal = 0; // сумма к оплате
    // счетчик всех товаров
    productArr.forEach((e) => {
      ordersArr[0].orderSum = Number(e.price) * Number(e.amount)  + Number(ordersArr[0].orderSum); //сумма чека без скидок
      let debitProduct = Math.floor((Number(balanceFinal) / Number(e.amount))); //вычет баллов с 1 единицы товара

      let debitProductCert = Math.floor((Number(balanceFinalCert) / Number(e.amount))); //вычет баллов сертификата с 1 единицы товара
      let debitClientBonus; // переменная изменения бонусов клиента относительно товара по всей цене
      if (statusСashback == 2) { //если мы списываем баллы то считаем с вычетом баллов финальную сумму
        if (roundPrice == 1) { // округляем или нет
          e.interimPrice = Math.floor(Number(e.price) * Number(e.sale) - Number(debitProduct)); // считаем промежуточный прайс
        } else {
          e.interimPrice =  Math.floor((Number(e.price) * Number(e.sale) - Number(debitProduct)) * 100) / 100; // считаем промежуточный прайс с округлением до сотых
        }
        if (e.interimPrice < 0) { // если вычитается в минус, считаем сколько можно списать из стоимости с примененной скидкой
          debitProduct = (Number(e.price) * Number(e.sale)) / Number(e.amount)
          e.interimPrice = 0
        }
      } else { // если не списываем то просто считаем промежуточный прайс(применяем только скидку)
        if (roundPrice == 1) { // округляем или нет
          e.interimPrice = Math.floor(Number(e.price) * Number(e.sale))
        } else {
          e.interimPrice =  Math.floor((Number(e.price) * Number(e.sale)) * 100) / 100;
        }
      } // если получившаяся сумма меньше чем допустимая сумма скидки то приравниваем к значению скидки максимальной
      if (e.interimPrice < e.saleMaxPrice) {
        e.interimPrice = e.saleMaxPrice;
        if (statusСashback == 2) { //если баллы списываем
          debitProduct = (Number(e.price) * Number(e.sale) - Number(e.saleMaxPrice)) / Number(e.amount)// сколько баллов можно вычесть с 1 единицы
        }
      }
      // обработка баллов клиента
      if (statusСashback == 1) { // если мы копим то считаем сколько баллов даст товар и записываем
        //тут можно перенастроить счет кэшбека, на чем то увеличивать)
        e.cashback = Math.floor(Number(e.interimPrice) * (globalCashback + Number(e.cashbackPercent)));
        e.cashbackSum = Math.floor(Number(e.cashback) * Number(e.amount));
        balanceFinal = Math.floor(Number(balanceFinal) + Number(e.cashbackSum));
        const value = document.querySelector('.client__value');
        if (balanceFinal > balance) { // красим в зеленый
          value.classList.remove('client__value_write-off')
          value.classList.add('client__value_accumulate')
        }
        value.textContent = `Баллов:  ${balanceFinal}`;
      } else if (statusСashback == 2) { // если мы списываем, то считаем сколько у нас получилось списать баллов
        e.debitClientBonus = Math.floor(Math.ceil(Math.floor(Number(e.price) * Number(e.sale))  - Number(e.interimPrice)) * Number(e.amount)); // переписываем в объекте
        debitClientBonus = e.debitClientBonus; // 9176401407
        let beforeChange = balanceFinal;
        balance = beforeChange  - debitClientBonus; // высчитываем из текущего баланса

        //для дебага
        if(balance < 0 ) {
          try {
            telegramNote(`Ошибка в счете баллов было ${beforeChange} вычли ${debitClientBonus}`, '1385389369')
            e.debitClientBonus = debitClientBonus + balance
            balance = 0;
          } catch (error) {
            logger(`Ошибка в счете баллов было ${beforeChange} вычли ${debitClientBonus}`)
          }
        }


        balanceFinal = balance;
        const value = document.querySelector('.client__value');
        if (debitClientBonus) {
          value.classList.remove('client__value_accumulate')
          value.classList.add('client__value_write-off')
        }
        value.textContent = `Баллов: ${balanceFinal}`;
        e.cashback = 0;
        e.cashbackSum = 0;
      } else {
        // сбрасываем наверняка
        e.debitClientBonus = 0;
        balanceFinal = 0;
        e.cashback = 0;
        e.cashbackSum = 0;
      }
      // Тут мы будем пересчитывать сертификат
      let offreckoningPrice; // промежуточная для счета цена с вычтенными барами сертификатов
      if (roundPrice == 1) { // округляем или нет
        offreckoningPrice = Math.ceil(Number(e.interimPrice) - (Number(debitProductCert))); // считаем промежуточный прайс
      } else {
        offreckoningPrice =  Math.floor(Number(e.interimPrice) - Number(debitProductCert) * 100) / 100; // считаем промежуточный прайс с округлением до сотых
      }
      // если получилось списать в минус
      if (offreckoningPrice < 0) {
        offreckoningPrice = 0;
        debitProductCert = Number(e.interimPrice);
      }
      let beforeChange = balanceFinalCert;
      balanceFinalCert = beforeChange - Math.floor((Math.ceil(Number(e.interimPrice) - offreckoningPrice) * e.amount));

      //для дебага
      if(balanceFinalCert < 0 ) {
        try {
          telegramNote(`Ошибка в счете баллов было ${beforeChange} вычли ${Math.floor((Math.ceil(Number(e.interimPrice) - offreckoningPrice) * e.amount))}`, '1385389369')
          balanceFinalCert = 0;
        } catch (error) {
          logger(`Ошибка в счете баллов было ${beforeChange} вычли ${Math.floor((Math.ceil(Number(e.interimPrice) - offreckoningPrice) * e.amount))}`)
        }
      }


      // считаем финальную цену
      e.priceFinal = Number(offreckoningPrice)

      // обнулить цену под списание
      if(writeOffGlobal) {
        e.priceFinal = 0;
        e.interimPrice = 0;
        e.productSum = 0;
        ordersArr[0].writeoffMode = 1;
        ordersArr[0].chtype = 0;
      }


      e.productSum = Math.floor(Number(e.priceFinal) * Number(e.amount));
      // перезаписываем в текущем чеке значения
      ordersArr[0].amount += e.amount;
      ordersArr[0].interimSum = ordersArr[0].interimSum + Number(e.interimPrice) * Number(e.amount);
      ordersArr[0].orderSumFinal += e.productSum;
      ordersArr[0].endPointsCert = balanceFinalCert;
    });
    // вывод значения суммы оплаты
    orderSumFinal = ordersArr[0].orderSumFinal;
    const outputValuePaymentArr = document.querySelectorAll('.payment-value');
    outputValuePaymentArr.forEach((e)=> {
      e.textContent = orderSumFinal;
    });
    certValue.textContent = `Баллов: ${balanceFinalCert}`;
  };
  // функция отрисовки итемов в чеке
  this.renderReceipt = function () {
    orderCalc.counter(); //вызываем счетчик
    // визуальная очистка чека
    while (wrapReceipt.firstChild) {
      wrapReceipt.removeChild(wrapReceipt.firstChild);
    }
    function renderItem(idProd, name, amount, productCategory, price, priceFinal, productSum) {
      const plusBtn = el('button', 'counter__btn counter__btn_up btn btn_hover-alternate', '+', {id :`btnPlus${idProd}`});
      const minusBtn = el('button', 'counter__btn counter__btn_down btn btn_hover-alternate', '-', {id :`btnMinus${idProd}`});
      // кнопка плюс увеличивает в объекте количество
      plusBtn.addEventListener('click', (e) => {

        if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
          // // находим по id кнопки айди итема в массиве
          const idBtn = `${plusBtn.id}`;
          const idProd = idBtn.slice(7);
          for(let i of productArr) {
            //   // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
            if (i.idProd == idProd && i.productCategory == productCategory) {
              i.amount = Number(i.amount) +1;
              let q = `UPDATE orderItem SET amount = ${Number(i.amount)} WHERE id = ${Number(i.id)}`;
              db.query(q);
              orderCalc.renderReceipt();
              break;
            }
          }
        } else {
          popup('Изменение товаров в оплаченном чеке невозможно');
        }
      });

      minusBtn.addEventListener('click', () => {
        if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
          // находим по id кнопки айди итема в массиве
          const idBtn = `${minusBtn.id}`;
          const idProd = idBtn.slice(8);
          for(let i of productArr) {
             // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
            if (i.idProd == idProd && i.productCategory == productCategory) {
              if (i.amount > 1) {
                let oldLength = String(i.amount).length
                i.amount = Number(i.amount) - 1;
                if(String(i.amount).length > oldLength) i.amount = String(i.amount).substring(0, oldLength);
                let q = `UPDATE orderItem SET amount = ${Number(i.amount)} WHERE id = ${Number(i.id)}`;
                db.query(q);
                orderCalc.renderReceipt();
                break;
              } else {
                let q = `DELETE FROM orderItem WHERE id = ${Number(i.id)};`;
                db.query(q);
                update.productArr();
                update.saleObg();
                orderCalc.renderReceipt();
                break;
              }
            }
          }
        } else {
          popup('Изменение товаров в оплаченном чеке невозможно');
        }
      });
      let priceClass = 'product__text'
      if (price != priceFinal || priceFinal == 0) {
        priceClass = 'product__text product__text_sale'
      }
      const input = el('input', 'counter__input keyboard-input keyboard-input_num', '', { type: 'number'});
      input.setAttribute('keyboard', 'product_input');
      input.value = amount;
      input.id = `idProd${idProd}`;
      input.addEventListener('focus', (e) => {
        e.preventDefault()
        keyboardInit(e.target, false)
      });
      input.addEventListener('input', (e) => {
        clearTimeout(delay);
          delay = setTimeout(() => {
            if(isNaN(input.value)) {
              input.value = 0;
            }
            if(input.value.length > 10) {
              input.value = 999999999
            }
            if(!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
              const idProdInput = `${input.id}`;
              const idProd = idProdInput.slice(6);
              for(let i of productArr) {
                // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
                if (i.idProd == idProd && productCategory == i.productCategory) {
                  i.amount = Number(input.value);
                  let q = `UPDATE orderItem SET amount = ${Number(i.amount)} WHERE id = ${Number(i.id)}`;
                  try {
                    db.query(q);
                  } catch (error) {
                    try {
                      db.conn.close()
                    } catch (error) {

                    }
                  }
                  orderCalc.renderReceipt();
                  break;
                }
              }
            } else {
              for(let i of productArr) {
                // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
                if (i.idProd == idProd && productCategory == i.productCategory) {
                  input.value = i.amount;
                  break;
                }
              }
              popup('Изменение товаров в оплаченном чеке невозможно');
              return;
            }
            if (input.value < 0) {
              input.value = '';
            }
          }, 300);
      });
      // alert(priceFinal+productSum)
      // возвращает отрисованный товар
      return el('li', 'product receipt__item', [
        el('button', 'product__btn-name',
          el('span', null, name)
          ),
        el('div', 'product__counter counter', [
          minusBtn,
          input,
          plusBtn
        ]),
        el('div', priceClass,`${Number(priceFinal)}`),
        el('div', 'product__text product-summ', `${Number(productSum)}`),
      ], { id: `receipt-${idProd}` });
    }
    // если есть товары в массиве отрисовываем весь чек
    if(productArr.length > 0) {
      productArr.forEach((e)=> {
        let nameStr = e.bulkvalue !== 'undefined'  || e.bulkuntils !== 'undefined' ?  e.name+': '+e.bulkvalue+e.bulkuntils :  e.name;
        wrapReceipt.appendChild(renderItem(e.idProd, nameStr, e.amount, e.productCategory, e.price, e.priceFinal, e.productSum));
      })
    }
  };
};





