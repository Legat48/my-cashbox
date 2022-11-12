// функции записи рабочей информации по чеку и товарам
const entry = new function Entry() {
  // запись нового товара
  this.product = function (idProd, name, bulkvalue, bulkuntils, price, amount, cashback_percent, parent, maxSale = 0 ) {
    let message = `Вызвалась функция записи нового товара. текущий айди чека ${idOrderGlobal} В неё передано idProd ${idProd},name ${name},bulkvalue ${bulkvalue},bulkuntils ${bulkuntils},price ${price},amount ${amount},cashback_percent ${Number(cashback_percent) / 100},parent ${parent}, maxSale ${maxSale}`;
    logger(message);
    // смотрим такой товар в массиве товаров который локально подгружен в массив
    if (!btnCashNon.classList.contains('ready-payment') && !btnQRcode.classList.contains('ready-payment')) {
      const searchInput = document.querySelector('#search-input');
      searchInput.value = ''
      for(let i of productArr) {
        //   // если нашли совпадения техкарты то прибавляем к товару в массиве численность и запускаем рендер и пересчет
        if (i.idProd == idProd && parent == i.productCategory) {
          let prodName = name.split(': ')[1]
          if(((i.name.includes('Сироп') || i.name.includes('Топпинг')) || i.name.includes('Раф')) && !i.name.includes(prodName)) {
            i.name += '/' + prodName
          }
          i.amount = Number(i.amount) +1;
          q = `UPDATE orderItem SET amount = '${Number(i.amount)}', name = '${i.name}' WHERE id = ${Number(i.id)}`;
          db.query(q);
          orderCalc.renderReceipt();
          return;
        }
      }
      // если совпадения нет, то будем вписывать новый товар в чек
      let  q;
      try {
        let saleMaxPrice = price * maxSale;
        q = `INSERT INTO orderItem ( idProd, idOrder, name, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum, productCategory) VALUES ('${idProd}', ${idOrderGlobal}, '${name}','${bulkvalue}','${bulkuntils}', ${price}, 1, 0,${saleMaxPrice}, 0, 0, ${Number(cashback_percent) / 100}, '${Number(amount)}', 0, 0, 0, 0, ${parent});`;
        db.query(q);
        let message = `Запись товара. текущий айди чека ${idOrderGlobal} В неё передано idProd ${idProd} был записан`;
        logger(message);
        update.productArr();
        update.saleObg();
        orderCalc.renderReceipt();
      } catch (e) {
        try {
          db.conn.close()
        } catch (error) {

        }
        let message = `Запись товара. текущий айди чека ${idOrderGlobal} В неё передано idProd ${idProd} не записался, ошибка ${e.message}`;
        logger(message);
        popup (e.message);
      }
    } else {
      popup('добавить товары в оплаченный чек невозможно');
    }
  };
  // фиксация данных чека
  this.ordersFixation = function(order, status) {
    let time = subfunc.getTime();
    let rs = subfunc.random();
    let hashcode = `${rs}${time.unix}s${useAtol}${useTerminal}${troubleAtol}`;
    if(status == 2) {
      postman.displayOrder(order, productArr)
    }
    let q = `UPDATE orders SET status = ${Number(status)}, time = '${time.time}', date = '${time.date}', unix = '${time.unix}', hashcode = '${hashcode}', fiscalPrint = ${Number(order.fiscalPrint)}, orderSum = ${Number(order.orderSum)}, interimSum = ${Number(order.interimSum)}, clientPoints  = '${Number(balanceFinal)}', amount = '${Number(order.amount)}', orderSumFinal = ${Number(order.orderSumFinal)}, barista = '${order.barista}', chtype = '${order.chtype}', qrtoken ='${order.qrtoken}', endPointsCert = ${order.endPointsCert}, writeoffMode = ${order.writeoffMode || 0} WHERE id = ${Number(order.id)}`;
    try {
      logger(`запрос на фиксацию чека${q}`);
      db.query(q);
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
      return true;
    } catch (e) {
      try {
        db.conn.close()
      } catch (error) {

      }
      logger(`ошибка при фиксации чека в функции фиксации ошибка :${e.message} чек ${JSON.stringify(order)}`);
      return false;
    };
  };
  this.productArrFixation = function(order) {
    logger(`Фиксируются товары, id чека ${Number(order.id)} массив товаров ${JSON.stringify(productArr)}`);
    let q;
    let funcStatus = true;
    if(order.sertiicate > 0) {
      alert('test')
    }
    productArr.forEach((e) => {
      q = `UPDATE orderItem SET debitClientBonus = ${Number(e.debitClientBonus)}, sale = ${Number(e.sale)}, interimPrice = ${Number(e.interimPrice)}, offreckoningItem = ${Number(e.offreckoningItem)}, cashbackPercent = ${Number(e.cashbackPercent)}, amount = '${Number(e.amount)}', priceFinal = ${Number(e.priceFinal)}, cashback = ${Number(e.cashback)}, cashbackSum = ${Number(e.cashbackSum)}, productSum = ${Number(e.productSum)} WHERE id= ${Number(e.id)}`;
      try {
        db.query(q);
        logger(`Зафиксировался товар, id чека ${Number(order.id)} массив товаров ${JSON.stringify(e)}`);
      } catch (e) {
        try {
          db.conn.close()
        } catch (error) {

        }
        let message = `Ошибка в productArrFixation ${JSON.stringify(e)}  productArr ${productArr} `;
        logger(message);
        popup(e.message + 'Сбросьте чек и набейте заного');
        funcStatus = false;
      }
    });
    return funcStatus;
  };
};