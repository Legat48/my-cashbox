// Конструктор различных объектов
// конструктор нового продукта в массив продуктов
function Product( id, idProd, idOrder, name, productCategory, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum) {
  this.selector = 'receipt'; //для рендера
  this.className = 'product'; //для рендера
  this.id = Number(id); // id айди товара в таблице товаров
  this.idProd = Number(idProd); // idProd идентификатор продукта, берется из базы данных каталога
  this.idOrder = Number(idOrder); // idOrder айди чека, к которому имеет отношение данный товар
  this.name = name; // name наименование товара
  this.bulkvalue = bulkvalue; // значение объема
  this.bulkuntils = bulkuntils; // в чем измеряется, опечатка в units на сервере
  this.price = price; // price изначальная цена товара в меню
  this.sale = Number(sale) ; // sale размер скидки примененной к товару (0.0-1)
  this.saleMaxPrice = Number(saleMaxPrice) ; // максимальная скидка
  this.debitClientBonus = Number(debitClientBonus) ; // debitClientBonus списание баллов
  this.interimPrice = Number(interimPrice) ;  // interimPrice промежуточная цена с применением всех скидок и баллов, от которой пойдет вычет ниже границы.
  this.offreckoningItem = Number(offreckoningItem) ; // offreckoningItem вычет не считающий размер скидки который берется из чека и делится по всем товарам равномерно
  this.cashbackPercent = Number(cashbackPercent) ;// cashbackPercent процент кэшбэка на товаре
  this.amount = Number(amount) ; // amount колличество единиц товара
  this.priceFinal = Number(priceFinal) ; // priceFinal финальная цена по товару (price*sale)
  this.cashback = Number(cashback) ; // cashback кэшбэк
  this.cashbackSum = Number(cashbackSum) ; // cashbackSum сумма начисляемого кэшбека
  this.productSum = Number(productSum) ; // productSum финальная сумма по товару (priceFinal*amount)
  this.productCategory = Number(productCategory); // категория продукта
}
//объект чека собранный из данных из базы данных
function Order(id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, email, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient) {
  this.id = Number(id);  // id чека, по нему можно сделать выборку товаров, автозаполнение на нем
  this.status = Number(status);
  this.currentTable = Number(currentTable); // currentTable номер стола, пока функционала по нему нет номер всегда 1
  this.fiscalPrint = Number(fiscalPrint); // печатается ли чек
  this.time = time;  // time время (часы:минуты)
  this.date = date;   // date дата (год-месяц-день)
  this.unix = Number(unix);  // unix юникс время
  this.orderSum = Number(orderSum); // orderSum сумма стоимости всех товаров без скидок
  this.promo = promo; // промокод
  this.idClient = idClient; // idClient идентификатор клиента (номер карты или телефона)
  this.accumClientPoints = Number(accumClientPoints); // accumClientPoints накопление баллов. 0- карты нет 1-копим 2 списываем
  this.clientPoints = Number(clientPoints);  // clientPoints баллы лояльности, действия с ними зависят от режима накопления
  this.email = email; // email почта на которую ушел чек
  this.globalCashback = Number(globalCashback); // глобальный кэшбек по всему чеку
  this.interimSum = Number(interimSum); // interimSum сумма с примененными скидками и баллами
  this.offreckoning = Number(offreckoning);  // offreckoning вычет по сертификату или разбивка чека в будущем, идет мимо границы скидки, до 0 общей суммы
  this.amount = Number(amount); // amount колличество товаров в чеке
  this.orderSumFinal = Number(orderSumFinal); // orderSumFinal финальная сумма чека
  this.barista = barista; // barista имя кассира которое отправляется на фискальник
  this.idworkdayOffline = idworkdayOffline; // idworkdayOffline идентификатор смены созданный на кассе
  this.idworkdayOnline = idworkdayOnline; // idworkdayOnline идентификатор смены пришедший с сервера
  this.chtype = Number(chtype); // chtype тип чека (безнал, нал) сертификат пойдет как нал
  this.tokenPoint = tokenPoint;   // tokenPoint уникальный токен точки
  this.hashcode = hashcode; // hashcode хэшкод чека(рандом 8 цифр и юникс)
  this.initiallyPoints = Number(initiallyPoints); // initiallyPoints кол-во баллов изначально у клиента
  this.qrtoken = qrtoken; // qrtoken токен транзакции qr оплаты
  this.certificate = certificate; // certificate
  this.endPointsCert = endPointsCert; // endPointsCert
  this.nameClient = nameClient;
}
// создание клиента в глобал
function Client(name, phone, type, percent, email, balance) {
  this.name = ''; //имя
  if(name.split(' ')[0]) {
    this.name = name.split(' ')[0]; //имя
  }
  this.phone = phone; //телефон клиента(или то что ввелось)
  this.type = type; // скидочный или с баллами
  this.percent = 1 - Number(percent)/100; // размер скидки или процент накопления баллов
  this.email = email; // имэил если есть
  this.balance = balance; // текущий баланс
}
// создание товара в транзакции
function ProductOrder(technical_card, accumClientPoints, count, price, total, discount, points, weighted = false) {
  this.technical_card = Number(technical_card); //техкарта
  this.count = Number(count); //кол-во
  this.price = Number(price); //цена без учета скидок и баллов
  this.total = Number(total); // финальная цена с учетом скидок
  this.discount = 100 - Number(discount) * 100; //скидка
  this.time_discount = 0; //временная скидка(всегда 0)
  this.points = 0 // баллы с товара, надо в будущем удалить
  this.weighted = weighted; //весовой или нет(сейчас всегда не весовой)
}
// создание акции в транзакции
function PromoOrder(technical_card, accumClientPoints, count, price, total, discount, points) {
  this.promotion = Number(technical_card); //техкарта акции
  this.count = Number(count); //кол-во
  this.price = Number(price); //цена без учета скидок и баллов
  this.total = Number(total); // финальная цена с учетом скидок
  this.discount = 100 - Number(discount) * 100; //скидка
  this.time_discount = 0; //временная скидка(всегда 0)
  this.points = 0 // баллы с товара, надо в будущем удалить
}
// создание объекта для транзакции
function Transaction(order) {
  this.point = Number(pointCashbox); // номер точки
  this.uniqid = `${Number(order.id)}${order.hashcode}`; // уникальный айди
  this.date = Number(order.unix); // юникс время
  this.sum = Number(order.orderSum); // сумма в чеке
  this.sertificate_points = Number(order.offreckoning) - Number(order.endPointsCert) // Списать баллов у сертификата
  this.sertificate_code = order.certificate // номер сертификата
  this.barista = order.barista // бариста
  this.points = 0 //кол-во баллов клиента, если это списание или накопление высчитываем разницу по баллам
  if(order.accumClientPoints == 1 || order.accumClientPoints == 2) {
    this.points = Number(order.clientPoints) - Number(order.initiallyPoints);
  }
  this.total = Number(order.orderSumFinal); // общая сумма в чеке(к оплате)
  this.promotion_code = order.promo; // промокод(строкой)
  this.shift = order.idworkdayOffline; // токен смены
  // чайкин криворукий, придется инвертировать значение, что бы на сервере правильно записывалосьц
  this.type = Number(order.chtype); // тип чека(нал или безнал)
  if (this.type === 1 || this.type === 2) {
    this.type = 0;
  } else if (this.type ===0) {
    this.type = 1
  }
  this.client_phone = order.idClient; // номер клиента(может быть пустым)
  this.source = 'new_app'; //источник
  this.products = []; //массив продуктов
  this.promotions= []; //массив акций
  // идем за товарами по чеку
  let ans, q; // готовим запросы
  let productTableArr = []; //массив для пересбора товаров
  let productArr = [] // создаем массив товаров чека
  try{
    q = `SELECT id, idProd, idOrder, name, productCategory, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum FROM orderItem WHERE idOrder = ${Number(order.id)}`
    ans = db.query(q);
    for( let i = 0; ans[i] != undefined; i++) {
      productTableArr.push(ans[i]);
    }
    // по пришедшим данным заполняем глобальный массив товаров
    productTableArr.forEach((e) => {
      let newProduct = new Product(e.id, e.idProd, e.idOrder, e.name, e.productCategory, e.bulkvalue, e.bulkuntils, e.price, e.sale, e.debitClientBonus, e.saleMaxPrice, e.interimPrice, e.offreckoningItem, e.cashbackPercent, e.amount, e.priceFinal, e.cashback, e.cashbackSum, e.productSum)
      //напихали товары в массив
      productArr.push(newProduct)
    })
  } catch(e){
    try {
      db.conn.close()
    } catch (error) {

    }
    logger('Ошибка в constructor'+e.message)
    return;
  }
  productArr.forEach((e) => {
    if(e.productCategory == -1) {
      let promo = new PromoOrder(e.idProd, order.accumClientPoints, e.amount, e.price, e.priceFinal, e.sale, e.debitClientBonus);
      this.promotions.push(promo)
    } else {
      let product = new ProductOrder(e.idProd, order.accumClientPoints, e.amount, e.price, e.priceFinal, e.sale, e.debitClientBonus);
      this.products.push(product)
    }
  });
}
// объект для записи скидки в массив скидок
function Sale(techcards_id, discount) {
  this.techcards_id = techcards_id;
  this.discount = discount;
}
// объект для создания продукта в системе лояльности
function LoyaltyRequestProduct(title,quantity,price) {
  this.title = title; //название товара
  this.quantity = `${quantity}`; //кол-во
  this.price = `${price}`; // финальная цена
}
// объект для записи в системе лояльности
function LoyaltyRequest(order) {
  this.uniq_id = `${Number(order.id)}${order.hashcode}`; //уникальное айди чека
  this.userPhone = `${order.idClient}`; //номер клиенте
  this.country = subdomain; //страна
  this.amount = `${order.orderSum}`; // стоимость чека без баллов и скидок
  this.total_amount = `${order.orderSumFinal}`; // финальная стоимость чека
  this.discount = '0'; //всегда 0 кидаем по скидкам
  this.bonuses = '0';
  // считаем и отправляем разницу в баллах до и после операции
  if(order.accumClientPoints == '1' || order.accumClientPoints == '2') {
    this.bonuses = `${Number(order.clientPoints) - Number(order.initiallyPoints)}`;
  }
  this.date = `${order.unix}`; // таймштамп
  // this.point = '13'; //ВРЕМЕНННО
  this.point = `${pointCashbox}`; //номер точки
  this.positions = []; //товары
  // берем товары по чеку
  try{
    let q = `SELECT id, idProd, idOrder, name, bulkvalue, bulkuntils, price, sale, debitClientBonus, saleMaxPrice, interimPrice, offreckoningItem, cashbackPercent, amount, priceFinal, cashback, cashbackSum, productSum FROM orderItem WHERE idOrder = ${Number(order.id)}`
    let ans = db.query(q);
    let productTableArr = [];
    for( let i = 0; ans[i] != undefined; i++) {
      productTableArr.push(ans[i]);
    }
    // по пришедшим данным заполняем глобальный массив товаров
    productTableArr.forEach((e) => {
      let newProduct = new LoyaltyRequestProduct(e.name, e.amount, e.priceFinal)
      //напихали товары в массив
      this.positions.push(newProduct)
    })
  } catch(e){
    try {
      db.conn.close()
    } catch (error) {

    }
    return;
  }
}

//1 пункт чеклиста
function ChecklistItem(id, text, parttime, status) {
  this.id = id;
  this.text = text;
  this.parttime = parttime;
  this.status = status;
}