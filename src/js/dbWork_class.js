// работа с базой данных (сейчас только создание таблиц)
const dbWork = new function() {
  this.createdTable = function() {
    // создание таблицы, в которой хранятся ВСЕ чеки которые были когда либо на точке
    db.query("CREATE TABLE IF NOT EXISTS orders(id Integer PRIMARY KEY AUTOINCREMENT, status varchar(128), currentTable varchar(128), fiscalPrint varchar(128), time varchar(128), date varchar(128), unix varchar(128), orderSum varchar(128), promo varchar(128), idClient varchar(128), accumClientPoints varchar(128), clientPoints varchar(128), globalCashback varchar(128), email varchar(128), interimSum varchar(128), offreckoning varchar(128), amount varchar(128), orderSumFinal varchar(128), barista varchar(128), idworkdayOffline varchar(128), idworkdayOnline varchar(128), chtype varchar(128), tokenPoint varchar(128), hashcode varchar(128), initiallyPoints varchar(128), recordedLoyalty, workdayId varchar(128), recordedCertificate varchar(128));")
    // так мы добавляем столбцы если их нет при запуске
    try {
      db.query('alter table orders add column qrtoken varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table orders add column certificate varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table orders add column endPointsCert varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table workday add column dateDay varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table workday add column synhIncomeCash varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table workday add column synhRefundCash varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table workday add column synhIncomeCashLess varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table workday add column synhRefundCashLess varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table orders add column workdayId varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table orders add column recordedCertificate varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table orders add column nameClient varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table orders add column writeoffMode varchar(128)');
    } catch (e){
      db.conn.close();
    }
    // id чека, по нему можно сделать выборку товаров, автозаполнение на нем
    // status статус чека 0 формируется 1 готов на отправку на атол 2- пропечатался и готов на сервер 3-записан на сервере 4-отменен и не записан
    // currentTable номер стола, пока функционала по нему нет номер всегда 1
    // fiscalPrint печатается ли чек
    // time время (часы:минуты)
    // date дата (год-месяц-день)
    // unix юникс время
    // orderSum сумма стоимости всех товаров без скидок
    // promo промокод
    // idClient айди клиента
    // accumClientPoints накопление баллов. 0- карты нет 1-копим 2 списываем
    // clientPoints баллы лояльности, действия с ними зависят от режима накопления
    // email почта на которую ушел чек
    // interimSum сумма с примененными скидками и баллами
    // offreckoning вычет по сертификату или разбивка чека в будущем, идет мимо границы скидки, до 0 общей суммы
    // amount колличество товаров в чеке
    // orderSumFinal финальная сумма чека
    // barista имя кассира которое отправляется на фискальник
    // idworkdayOffline идентификатор смены созданный на кассе
    // idworkdayOnline идентификатор смены пришедший с сервера
    // chtype тип чека (безнал, нал) сертификат пойдет как нал
    // tokenPoint уникальный токен точки
    // hashcode хэшкод чека(рандом 8 цифр и юникс)
    // initiallyPoints изначально баллов
    // recordedLoyalty записано в системе лояльности
    // таблица итемов(товаров), в которой хранятся ВСЕ товары которые когда либо пробивались на точке. Ориентированны относительно таблицы чеков
    db.query("CREATE TABLE IF NOT EXISTS orderItem(id Integer PRIMARY KEY AUTOINCREMENT, idProd varchar(128), idOrder varchar(128), name varchar(128), bulkvalue varchar(128), bulkuntils varchar(128), productCategory varchar(128), price varchar(128), sale varchar(128), debitClientBonus varchar(128), saleMaxPrice varchar(128), interimPrice varchar(128), offreckoningItem varchar(128), cashbackPercent varchar(128), amount varchar(128), priceFinal varchar(128), cashback varchar(128), cashbackSum varchar(128), productSum varchar(128));")
    try {
      db.query('alter table orderItem add column idOrderRefund varchar(128)');
    } catch (e){
      db.conn.close();
    }
    try {
      db.query('alter table orderItem add column amountRefund varchar(128)');
    } catch (e){
      db.conn.close();
    }
    // id айди товара в таблице товаров
    // idProd идентификатор продукта, берется из базы данных каталога
    // idOrder айди чека, к которому имеет отношение данный товар
    // name наименование товара
    // bulkvalue значение объема
    // bulkuntils в чем измеряется, опечатка в units на сервере
    // productCategory категория товара
    // price изначальная цена товара в меню
    // sale размер скидки примененной к товару (0.0-1)
    // debitClientBonus списание баллов
    // saleMaxPrice максимальный размер скидки  (записывается price * saleMax из таблицы скидок)
    // interimPrice промежуточная цена с применением всех скидок и баллов, от которой пойдет вычет ниже границы.
    // offreckoningItem вычет не считающий размер скидки который берется из чека и делится по всем товарам равномерно
    // cashbackPercent процент кэшбэка на товаре
    // amount колличество единиц товара
    // priceFinal финальная цена по товару (price*sale)
    // cashback кэшбэк
    // cashbackSum сумма начисляемого кэшбека
    // productSum финальная сумма по товару (priceFinal*amount)

    // таблица смен
    db.query("CREATE TABLE IF NOT EXISTS workday(id Integer PRIMARY KEY AUTOINCREMENT, status varchar(128), tokenWorkdayOffline varchar(128), tokenWorkdayOnline varchar(128), workDay_from varchar(128), workDay_to varchar(128), revenue varchar(128), hours varchar(128), salary varchar(128), premium varchar(128), dateDay varchar(128));")
    // status статус смены 0-открыта 1-закрыта 2-закрыта и записана в базе данных
    // tokenWorkdayOffline токен смены офлайн, генерируется когда смена открывается
    // tokenWorkdayOnline токен смены онлайн, берется с CRM если есть интернет
    // workDay_from  таймштамп открытия
    // workDay_to таймштамп закрытия
    // revenue выручка
    // hours часы работы
    // salary зарплата
    // premiun ?
    //настройка. Вертикальная таблица
    db.query(`CREATE TABLE IF NOT EXISTS settings(id Integer PRIMARY KEY AUTOINCREMENT, variable varchar(128), value varchar(128) NULL);`)
    // Таблица чеклистов
    db.query(`CREATE TABLE IF NOT EXISTS checklist(id varchar(128), text varchar ,parttime varchar(128), status varchar(128));`)
    // Таблица Возвратов
    db.query(`CREATE TABLE IF NOT EXISTS orderrefund(id Integer PRIMARY KEY AUTOINCREMENT, idOrder varchar(128), amount varchar(128), orderSumFinal varchar(128), orderHashcode varchar(128));`)
    // таблица с сиропами
    let toppingnewArray =  [ {name: 'Карамель', type: 0}, {name: 'Лаванда', type: 0}, {name: 'Лесной орех', type: 0},
    {name: 'Имбирь', type: 0}, {name: 'Кокос', type: 0}, {name: 'Дыня', type: 0},
    {name: 'Ваниль', type: 0}, {name: 'Амаретто', type: 0}, {name: 'Корица', type: 0}, {name: 'Миндаль', type: 0}, {name: 'Корица', type: 0},
    {name: 'Шоколад', type: 1}, {name: 'Карамель', type: 1}, {name: 'Клюква', type: 1}, {name: 'Соленая карамель', type: 1},
    {name: 'Лесной орех', type: 1}, {name: 'Кленовый сироп', type: 1},]
    let query = '';
    toppingnewArray.forEach((e) => {
      if(query.length > 0) {
        query = `${query},('${e.name}',${e.type})`
      } else {
        query = `('${e.name}',${e.type})`
      }
    })
    let q = `INSERT into toppinglist (name, type) values ${query}`
    let ans = null;
    db.query(`CREATE TABLE IF NOT EXISTS toppinglist(id Integer PRIMARY KEY AUTOINCREMENT, name varchar(128), type varchar(128));`)
    try {
      ans = db.query(`SELECT id FROM toppinglist`)
    } catch (error) {
      db.conn.close()
    }
    if(!ans){
      db.query(q)
    }
  }
  // обновление зарезервированных названий
  this.updateColName = function(table, param) {
    for (const [key, value] of Object.entries(param)) { // меняет зарезервированные имена
      if(`${key}` === 'id' ||`${key}` === 'name') {
        param[`${table}_${key}`] = param[key];
        delete param[key];
      }
    }
    return param;
  }
  // добавление работника или скидку в таблицу
  this.addTable = function(table, param) {
    let paramStr = '', j = 0, q = '';
    // обработка массива объектов или объект
    let tableParam = Array.isArray(param) ? this.updateColName(table, param[0]): this.updateColName(table, param);
    // кривой цикл но работает, собирает строку для запроса
    for (const [key, value] of Object.entries(tableParam)) {
      j += 1;
      paramStr += (j > 1) ? `, ${key} varchar(128)` : `${key} varchar(128)`
    }
    q = `CREATE TABLE IF NOT EXISTS ${table}(id Integer PRIMARY KEY AUTOINCREMENT, ${paramStr});`
    // создание таблицы
    try {
      db.query(q)
    } catch (error) {
      db.conn.close()
    }
    if(Array.isArray(param)) {
      param.forEach((paramItem) => {
        dbMethods.setterDb(table, this.updateColName(table, paramItem))
      })
      return;
    }
    dbMethods.setterDb(table, param)
  }
  // бекап базы пару раз в неделю(по воскресеньям)
  this.archiveDb = function(canArchive) {
    if(weekDay == 0) {
      try {
        let ans, q;
        try {
          q = `SELECT id FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status  not in (0 , 3, 5))`
          ans = db.query(q);
        } catch (error) {
          db.conn.close()
          ans = undefined;
        }
        if (!ans) {
          try {
            let pathFolder = fso.GetAbsolutePathName(".");
            const today = new Date();
            const dumpFile = today.getFullYear() + '_' + AddLeft(today.getMonth() + 1, '0', 2) + '_' + AddLeft(today.getDate(), '0', 2)+ '_' + AddLeft(today.getHours(), '0', 2) + '_' + + AddLeft(today.getMinutes(), '0', 2) + '_' + AddLeft(today.getSeconds(), '0', 2) +".db";
            let strDirectory = "./backup";
            if(!fso.FolderExists(strDirectory)){
            fso.CreateFolder(strDirectory)
            }
            strDirectory = "./backup/db";
            if(!fso.FolderExists(strDirectory)){
            fso.CreateFolder(strDirectory)
            }
            fso.CopyFile(`${pathFolder}\\mydb.db`, `${pathFolder}\\backup\\db\\${dumpFile}`)

            //чистка таблиц
            let q = 'DELETE FROM orders'
            try {
              db.query(q)

              q = 'DELETE FROM discounts'
              db.query(q)

              q = 'DELETE FROM orderItem'
              db.query(q)

              q = 'VACUUM'
              db.query(q)

            } catch (error) {
              db.conn.close()
              logger('Ошибки при удалении строк из таблиц \n' + error.message)
            }

          } catch (error) {
            logger('Ошибка при бэкапе дб\n' + error.message)
            popup('Ошибка при бэкапе дб\n' + error.message)
          }
        } else {
          popup('В системе остались нефиксированные чеки\nСвяжитесь с разработчиком')
        }

      } catch (error) {
       logger('Ошибка в запросе к бд при бэкепе\n'+ error.message)
      }

    }
  }
}

// сразу создаем все таблицы
dbWork.createdTable()

