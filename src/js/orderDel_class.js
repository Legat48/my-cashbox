// функции удаление рабочей информации по чеку, товарам и скидкам
const del = new function Del() {
  this.tempSale = function() {
    // alert(`функция Del.tempSale`)
    let q, ans;
    try{
      q = "DELETE FROM discounts WHERE temp = 1";
      ans = db.query(q);
    } catch(e){
      db.conn.close()
      logger('Ошибка в orderDel'+e.message)
    }
    const clientWrap = document.querySelector('.header__card_client');
    clientWrap.classList.remove('client');
    clientWrap.classList.remove('client_discount');
    clientWrap.classList.remove('client_cashback');
    const promocodeWrap = document.querySelector('.header__card_promocode');
    promocodeWrap.classList.remove('promocode');
    promocodeWrap.classList.remove('certificate');

    promotion_code = '';
    cert = '';
    balanceFinalCert = '';
    client = undefined;
    inputHeaderArr.forEach((e) =>{
      e.value = '';
    })
  };
  // удаление всех товаров из чека
  this.order = function() {
    // alert(`функция Del.order`)
    let q;
    try{
      this.tempSale();
      q = `DELETE FROM orderItem WHERE idOrder = ${idOrderGlobal}`;
      db.query(q);
      db.query(`UPDATE orders SET orderSum = 0, accumClientPoints = 0, idClient = '0', clientPoints = 0, interimSum = 0, amount = '0', orderSumFinal = 0, promo = '0', email = '${mailPoint}', orderSumFinal = 0, offreckoning = 0, endPointsCert = 0, certificate = 0 WHERE id = ${Number(idOrderGlobal)}`);
      // потрем глобал
      const clientWrap = document.querySelector('.header__card_client');
      const cardApplyArr =  document.querySelectorAll('.header__card_apply')
      if(cardApplyArr.length > 0) {
        cardApplyArr.forEach((i) => {
          i.classList.remove('header__card_apply');
        });
      }
      clientWrap.classList.remove('client');
      clientWrap.classList.remove('client_discount');
      clientWrap.classList.remove('client_cashback');
      cashbackWrap.classList.remove('client__cashback_active');
      cardValue.classList.remove('client__value_write-off');
      cardValue.classList.remove('client__value_accumulate');
      const promocodeWrap = document.querySelector('.header__card_promocode');
      promocodeWrap.classList.remove('promocode');
      promocodeWrap.classList.remove('certificate');
      promotion_code = '';
      cert = '';
      balanceFinalCert = '';
      client = undefined;
      inputHeaderArr.forEach((e) =>{
        e.value = '';
      });
      statusСashback = 0; // 0- карты нет
      globalCashback = 0; // общий кэшбек
      balanceFinal = 0; // остаток или накопление баллов клиента
      valueSurrender = 0; /*размер сдачи*/
      valueStock = 0; /*получено наличных*/
      orderSumFinal = 0; // сумма чека
      promotion_code = ''; //промокод
      ordersArr = []; // глобальный чек
      productArr = []; // текущие товары в чеке
      saleObg = []; // массив скидок
      client = {}; //глобальный объект клиента
      idOrderGlobal = undefined;
      outputValuePaymentArr.forEach((e)=> {
        e.textContent = '0';
      });
      while (wrapReceipt.firstChild) {
        wrapReceipt.removeChild(wrapReceipt.firstChild);
      }
      update.idOrder();
      orderCalc.resetCounter(); //скинуть сдачу
    } catch(e){
      try {
        db.conn.close()
      } catch (error) {

      }
      // alert(JSON.stringify('нет элементов в чеке'))
      orderCalc.resetCounter(); //скинуть сдачу
    }
  };
};
