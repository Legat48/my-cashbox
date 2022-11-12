const interfaceApp = new function Interface() {
  // сброс фокуса
  this.focusReset = function() {
    const blurElement = document.querySelector('.blurElement')
    blurElement.focus();
  }
  //кастомный выпадающий список
  this.dropdown = function() {
    // функция обработчик всех дропдаунов
    // массив кнопок
    const dropdownBtnAll = document.querySelectorAll('.dropdown__btn_target');
    const dropdownBtn = Array.prototype.slice.call(dropdownBtnAll); // делает привычный массив из нодлиста
    //массив контейнеров дропдаунов
    const dropdownBoxAll = document.querySelectorAll('.dropdown-content-box');
    const dropdownBoxArr = Array.prototype.slice.call(dropdownBoxAll);
    //массив иконок
    const iconSpanAll = document.querySelectorAll('.dropdown__icon');
    const iconSpanArr = Array.prototype.slice.call(iconSpanAll)
    // проходим по всем кнопкам
    dropdownBtn.forEach((btn) => {
      // все иконки на экране (нужно что бы переворачивать)
      const iconSpan = btn.querySelector('.dropdown__icon');
      btn.addEventListener('click', () => {
        const path = btn.dataset.dropdown;
        // console.log(btn.dataset.test)
        const dropdownBox = document.querySelector(`[data-dropdown-box="${path}"]`);
        // закрываем все списки и переключаем нажатый
        dropdownBoxArr.forEach((el) => {
          if (dropdownBox !== el) {
            el.classList.remove('active');
          }
        });
        // переворачиваем стрелочку при клике
        iconSpanArr.forEach((j) => {
          if (iconSpan !== j) {
            j.classList.remove('dropdown__icon_active');
          }
        });
        // переворачиваем все стрелочки
        console.log(dropdownBox)
        if (iconSpan) {
          iconSpan.classList.toggle('dropdown__icon_active');
        }
        // закрываем при нажатии вне дропдауна
        dropdownBox.classList.toggle('active');
      });
    });
    // открытие и закрытие на клик дропдауна
    document.addEventListener('click', (i) => {
      if (!i.target.closest('.dropdown-content-box') && !i.target.closest('.dropdown__btn')) {
        iconSpanArr.forEach((j) => {
          j.classList.remove('dropdown__icon_active');
        });
        dropdownBoxArr.forEach((el) => {
          el.classList.remove('active');
        });
      }
    });
  }
  // Работа бургера на появление и уход меню
  this.burger = function() {
    // анимация menu
    const burgerBtn = document.querySelector('.burger');
    const menu = document.querySelector('.header__menu');
    const substrate = document.querySelector('.substrate');
    function menuAnim() {
      // переключение бургера
      burgerBtn.classList.toggle('burger--active');
      // появление и уход меню навигации
      if (burgerBtn.classList.contains('burger--active')) {
        substrate.style.display = 'block';
        menu.classList.add('menu_anim')
        menu.classList.add('menu_active')
        // вызываем функцию которая берет информацию по чекам за текущую смену из базы данных(общую сумму если включен атол берем из атолла)
        interfaceApp.getWorkDayInfo();
      } else if ((!burgerBtn.classList.contains('burger--active'))) {
        //скрытие бургера
        substrate.style.display = 'none';
        menu.classList.remove('menu_anim')
        menu.classList.add('menu_anim-re')
        //таймаут для анимации
        setTimeout(() => {
          menu.classList.remove('setting')
          menu.classList.remove('menu_anim-re')
          menu.classList.remove('menu_active')
          const categoryList = document.querySelector('.allCategory__list')
          if(categoryList) menu.removeChild(categoryList);
          menu.classList.remove('allCategory')
          menu.classList.remove('formed-orders')
        }, 550)
      }
    }
    //клик на открытие меню
    burgerBtn.addEventListener('click', menuAnim);
    //substrate-поле подменю(подложка) При клике на нео-скрытие бургера
    substrate.addEventListener('click', () => {
      if (document.querySelector('.burger').classList.contains('burger--active')) {
        menuAnim();
      }
    });
  }
  // вызов отрисовки информации по чекам
  this.formedOrders = function() {
    const formedOrdersBtn = document.querySelector('#formedOrdersBtn')//кнопка "Чеки"
    const formedOrdersRoot = document.querySelector('.header__menu') //общая информация по чекам
    //открытие интерфейса с таблицами по чекам
    formedOrdersBtn.addEventListener('click', () => {
      preloader.preloader('body')
      formedOrdersRoot.classList.add('formed-orders')


      const btnDayNext = document.querySelector('.formed-orders__navbar-btn_next')
      btnDayNext.setAttribute('disabled', 'disabled')
      dateStrGlobalTemp = dateStrGlobal;
      this.renderOrderByDay(dateStrGlobal, orderRenderLimit) // отрисовка чеков по дню

      interfaceApp.scrollFuncVert('.formed-orders__card-box_all', 35);

      interfaceApp.scrollFuncVert('.formed-orders__card-box_returned', 35);
      // скроллбар для товаров которые пробились(интерфейс чеков)
      interfaceApp.scrollFuncVert('.formed-orders__card-box_productList', 35);
      // скроллбар для категорий которые пробились(интерфейс чеков)
      interfaceApp.scrollFuncVert('.formed-orders__card-box_productListCategory', 35);
    })
    //скрытие интерфейса с чеками
    formedOrdersRoot.addEventListener('click', ((e) => {
      if(!e.target.closest('.formed-orders__box') && !e.target.matches('.formedOrdersBtn')) {
        formedOrdersRoot.classList.remove('formed-orders')
      }
    }))
    // навигация внутри интерфейса чеков
    const navBtnList = document.querySelectorAll('.formed-orders__navbar-link') // массив кнопок навигации
    navBtnList.forEach((navBtn) => {
      // переключение между вкладками в интерфейсе чеков
      navBtn.addEventListener('click', (event) => {
        event.preventDefault();
        if(!event.currentTarget.matches('.formed-orders__navbar-link_active')) {
          navBtnList.forEach((navBtn) => {
            navBtn.classList.remove('formed-orders__navbar-link_active')
          })
          event.currentTarget.classList.add('formed-orders__navbar-link_active')
          const tabList = document.querySelectorAll('.formed-orders__tab-item')
          tabList.forEach((tabListItem) => {
            tabListItem.classList.remove('formed-orders__tab-item_active')
          })
          const target = event.currentTarget.dataset.navtabkey;
          document.querySelector(`[data-navtab="${target}"]`).classList.add('formed-orders__tab-item_active');
        }
      })
    })
  }
  this.renderOrderByDay = function(day, limit) {
    let orderListIncome = [], orderItemList = {}, ordersListRefaund = [];
    let limitStr = limit ? ` limit ${limit}`: '';
    // получение чеков из бд
    try {
      let resp = db.query(`SELECT id, chtype, orderSumFinal, date, time, chtype, orderSumFinal, status, workdayId FROM orders WHERE date = '${day}' and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat}) order by id desc${limitStr}`);
      let respItem = db.query (`SELECT name, amount, idOrder FROM orderItem WHERE idOrder in (SELECT id FROM orders WHERE date = '${day}' and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat}))`)
      Object.entries(resp).forEach(([key, value]) => {
        if([1,2,3].indexOf(Number(value.status)) !== - 1) {
          orderListIncome.unshift(value)
        } else {
          ordersListRefaund.unshift(value)
        }
      });
      Object.entries(respItem).forEach(([key, value]) => {
        if(orderItemList.hasOwnProperty(`${value[`idOrder`]}`)) {
        orderItemList[`${value[`idOrder`]}`].push({ name: value[`name`], amount: value[`amount`]})

        } else {
        orderItemList[`${value[`idOrder`]}`] = [{ name: value[`name`], amount: value[`amount`]}]

        }
      });
    } catch (error) {
      try {
        db.conn.close()
      } catch (error) {

      }
      orderListIncome = [];
      ordersListRefaund = [];
    }
    renderOrderList('formed-orders__card-box', orderListIncome, orderItemList); //отрисовка чеков
    renderOrderList('formed-orders__card-box_returned', ordersListRefaund, orderItemList);  //отрисовка чеков возврата
    renderOrderList('formed-orders__box'); // отрисовка  товаров и категорий в таблицу
    // создание таблицы
    function createTableHystoryOrder(root, category) {
      let tableCategory = category ? category : '', caption = '';
      if(category) {
        caption = el('caption', 'table__caption', [
          el('span', 'table__caption-name', `${allCategoryList[`${tableCategory}`]}: `,),
          el('span', 'table__caption-sum', [
            el('span', 'table__caption-sum-numb', ``),
            el('span', 'table__caption-sum-currency', ` ${currency}`),
          ])
        ])
      }
      root.appendChild(
        el('table', 'table__table', [
          caption,
          el('thead', 'table__head',
            el('tr', '', [
              el('th', 'table__th',
                el('span', 'table__th-content',
                  el('span', 'table__text', 'Позиция')),
              { 'data-col':"table__name", 'data-head':''}),
              el('th', 'table__th',
                el('span', 'table__th-content',
                  el('span', 'table__text', 'Цена')),
              { 'data-col':"table__price", 'data-head':''}),
              el('th', 'table__th',
                el('span', 'table__th-content',
                  el('span', 'table__text', 'Кол-во')),
              { 'data-col':"table__amount", 'data-head':''}),
              el('th', 'table__th',
                el('span', 'table__th-content',
                  el('span', 'table__text', ' Итого(С учетом бонусов и  скидок)')),
              { 'data-col':"table__productSum", 'data-head':''}),
            ])),
          el('tbody', 'table__body', '',)
        ], { style:"border-spacing: 0px;border-collapse:collapse;", 'data-category': `${tableCategory}`})
      )
    }
    // отрисовка строк
    function addRowForTable (element, root) {
      const row = root.querySelector(`[data-techcard="${element.idProd}"]`)
      if(row) {
        const counterDisplay = row.querySelector(`[data-col="table__amount"]`);
        counterDisplay.textContent = Number(counterDisplay.textContent) + 1;
        const sumDisplay = row.querySelector(`[data-col="table__productSum"]`);
        sumDisplay.textContent = Number(counterDisplay.textContent) * element.priceFinal;
        return
      }
      const colArray = root.querySelectorAll(`[data-head]`)
      const tdList = [] //колонки в строке
      colArray.forEach((item) => {
        const propName = item.dataset.col.split('__')[1];
        if(propName === 'name') {
          const newTd = el('td', '', [
            el('span', 'table__td-content', [
              el('span', 'table__text', `${element[`${propName}`]}: ${element.bulkvalue}${element.bulkuntils}`)
            ])
          ], {'data-col': `${item.dataset.col}`})
          tdList.push(newTd);
        } else {
          const newTd = el('td', '', [
            el('span', 'table__td-content', [
              el('span', 'table__text', `${element[`${propName}`]}`)
            ])
          ], {'data-col': `${item.dataset.col}`})
          tdList.push(newTd);
        }
      })
      const newRow = el('tr', '', tdList, {'data-techcard': `${element.idProd}`})
      root.appendChild(newRow);
    }
    //отрисовка таблицы с продуктами
    function renderTableProduct(rootElement, rowArray) {
      const root = rootElement;
      const rowList = rowArray;
      try {
        rowList.forEach(element => {
          const itemListContainer = root.querySelector('.formed-orders__card-box_productList .table')
          const itemByCategoryContainer = root.querySelector('.formed-orders__card-box_productListCategory .table')
          let tableBody = itemByCategoryContainer.querySelector(`[data-category="${element.productCategory}"]`);
          let ItemListTable = itemListContainer.querySelector(`table`);
          if(!ItemListTable) {
            createTableHystoryOrder(itemListContainer);
            ItemListTable = itemListContainer.querySelector(`table`);
          }
          addRowForTable(element, ItemListTable);
          if(!tableBody) {
            createTableHystoryOrder(itemByCategoryContainer, element.productCategory)
            tableBody = itemByCategoryContainer.querySelector(`[data-category="${element.productCategory}"]`);
          }
          addRowForTable(element, tableBody)
          const categorySumCDisplay = itemByCategoryContainer.querySelector(`[data-category="${element.productCategory}"] .table__caption-sum-numb`)
          categorySumCDisplay.textContent = Number(categorySumCDisplay.textContent) + Number(element.priceFinal);
        });
      } catch (error) {
        logger(`Ошибка в отрисовке истории чеков ${error.message}`)
      }
    }
    //отрисовка продукта в чеке
    function renderOrderItem(rootSelector, selector, order) {
      let root = rootSelector;
      let cardList = [];
      order.cards.forEach((cardItem) => {
        cardItem.amount = (Number.isInteger(Number(cardItem.amount))) ? `${cardItem.amount}шт`: `${cardItem.amount}кг`;
        const item = el('div', `${selector}__item`,[
          el('div', `${selector}__item-text`, `${cardItem.name}`),
          el('div', `${selector}__item-value`, `Количество: ${cardItem.amount}`),
        ]);
        cardList.push(item);
      })
      //коррекция даты
      let x = order.time.split(':')
      let y = [];
      x.forEach((i) => {
        y.push((i.length > 1) ? i : `0${i}`)
      })
      order.time = y.join(':')
      const cardContent = el('div', `${selector}__card-content`, cardList);
      let statusСhtype =  'Без-нал расчет';
      if (order.chtype == 0 ) {
        statusСhtype =  'Наличный расчет';
      }
      if (order.chtype == 2 ) {
        statusСhtype =  'QRкод/NewPay';
      }
      const refaundBtnGroup = [1,2,3].indexOf(Number(order.status)) !== -1 && dateStrGlobal == dateStrGlobalTemp ? el('div', `${selector}__btn-group`, [
        el('button', `${selector}__btn ${selector}__btn_refaund btn`, `Возврат`, {'data-value': `${order.id}`,'data-chtype': `${order.chtype}`}),
      ]) : el('div', `${selector}__btn-group`, [
      ]);
      if(order.status == -1 && order.chtype != 0) {
        refaundBtnGroup.appendChild(
          el('button', `${selector}__btn ${selector}__btn_refaund ${selector}__btn_refaund_print btn`, `На печать`, {'data-value': `${order.id}`,'data-chtype': `${order.chtype}`})
        )
        refaundBtnGroup.querySelector(`${selector}__btn_refaund_print`).addEventListener('click', (e) => {
          logger(`Нажата кнопка отправки на печать возврата, айди чека ${e.target.dataset.value}`);
          if (useAtol === 1 && !troubleAtol) { // если используется атол
            let order = subfunc.getOrderObg(7, Number(e.target.dataset.value));
            let productArr = subfunc.getProductArr(order);
            if(devkkm.printReturtOrder(order, productArr)) {
              popup(`Чек ${order.id} успешно отменен`);
              refaundBtn.textContent = 'Отменен';
              refaundBtn.setAttribute("disabled", "disabled");
            } else {
              popup(`Печать возврата чека ${order.id} не удалась`);
              logger(`Печать возврата чека ${order.id} не удалась`);
            }
          } else if(!useAtol){
            let order = subfunc.getOrderObg(7, Number(e.target.dataset.value));
            let productArr = subfunc.getProductArr(order);
            let q = `UPDATE orders SET status = -2 WHERE id = ${Number(order.id)}`;
            refaundBtn.textContent = 'Отменен';
            refaundBtn.setAttribute("disabled", "disabled");
            try {
              db.query(q);
            } catch (e) {
              logger(`чек ${Number(order.id)} не удалось записать, чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} ошибка ${e.message}`);
              popup(`чек ${Number(order.id)} не удалось записать`);
            }
          };
        });
      }
      let wkdayId = order.workdayId === '' ? ``: `Смена: ${order.workdayId}`;
      const newItem = el('div', `${selector}__card`,[
        el('div', `${selector}__card-left`, [
          el('div',`${selector}__card-header`,[
            el('div', `${selector}__header-item`, `Чек № ${order.id}`),
            el('div', `${selector}__header-item`, `Дата: ${order.date}`),
            el('div', `${selector}__header-item`, `Время: ${order.time}`),
            el('div', `${selector}__header-item`, `${wkdayId}`),
            el('div', `${selector}__header-item`, `Сумма: ${order.orderSumFinal} ${currency}`),
            el('div', `${selector}__header-item`, `${statusСhtype}`)
          ], ),
          cardContent,
        ]),
        refaundBtnGroup
      ]);
      if(order.status === '1') {
        const status = el('div', `${selector}__header-item ${selector}__header-item_status`, 'Не пропечатан')
        newItem.querySelector(`.${selector}__card-header`).appendChild(status)
        newItem.querySelector(`.${selector}__btn_refaund`).textContent = 'Возврат не доступен'
        newItem.querySelector(`.${selector}__btn_refaund`).setAttribute('disabled', 'disabled')
      } else {
        const status = el('div', `${selector}__header-item`, `Статус: ${order.status}`);
        if(order.status == 3 || order.status == 5) {
          status.classList.add(`${selector}__header-item_status_green`);
        }
        if(order.status == 6) {
          status.textContent = 'Ошибочный чек(обратитесь к разработчику)';
          status.classList.add(`${selector}__header-item_status`)
        }
        if(order.status === '2') {
         status.textContent = 'Ожидает отправки на сервер'
        } else if(order.status === '3') {
         status.textContent = 'Зафиксирован'
        } else if(order.status === '4') {
          status.textContent = 'Ожидает фиксации'
         }else if(order.status === '5') {
          status.textContent = 'Зафиксирован'
         }else if(order.status === '-1') {
          status.textContent = 'Не пропечатан'
         }else if(order.status === '-2') {
          status.textContent = 'Ожидает отправки на сервер'
         }
        newItem.querySelector(`.${selector}__card-header`).appendChild(status);
      }
      // кнопка возврата и алгоритм возврата чека
      const refaundBtn = newItem.querySelector(`.${selector}__btn_refaund`);
      if(refaundBtn) {
        refaundBtn.addEventListener('click', (e) => {
          logger(`Нажата кнопка возврата, айди чека ${e.target.dataset.value}`);
          let order = subfunc.getOrderObg(7, Number(e.target.dataset.value));
          let productArr = subfunc.getProductArr(order);
          interfaceApp.orderRefund(order,productArr);
        });
      }

      root.insertBefore(newItem, root.firstChild);
    }
    // отрисовка чеков
    function renderOrderList(rootSelect, orderListArr, orderItemObj) {
      let root;
      // очистка окна
      if(rootSelect !== 'formed-orders__box') {
        root = document.querySelector(`.${rootSelect}`).querySelector('.simplebar-content')
        root.innerHTML = '';
      }
      // отрисовка табличек
      if(rootSelect === 'formed-orders__box') {
        let q, resp, itemList = [];
        q = `SELECT * FROM orderItem WHERE idOrder IN (SELECT id FROM orders WHERE date = '${day}' AND status IN (1,2,3) and (writeoffMode is null or writeoffMode = ${writeOffGlobalStat}))`
        try {
          resp = db.query(q);
          Object.entries(resp).forEach(([key, value]) => {
            itemList.push(value)
          });
        } catch (error) {
          try {
            db.conn.close()
          } catch (error) {

          }
          // alert('ошибка запроса ' + error.message)
          itemList = [];
        }
        if(itemList.length > 0) {
          const itemListContainer = document.querySelector(`.${rootSelect}`).querySelector('.formed-orders__card-box_productList .table')
          const itemByCategoryContainer = document.querySelector(`.${rootSelect}`).querySelector('.formed-orders__card-box_productListCategory .table')
          itemListContainer.innerHTML = ''
          itemByCategoryContainer.innerHTML = ''
          renderTableProduct(document.querySelector(`.${rootSelect}`), itemList)
        }
        return;
      }
      // отрисовка прихода за день
      try {
        // обработка массива чеков
        function renderOrder(orderId, ordersArrIndex, orderArr) {
          let itemList = [];
          if (orderItemList[`${orderId.id}`]) {
            itemList = orderItemList[`${orderId.id}`];
          }
          const renderingOrder = {
            id:orderId.id,
            date: orderId.date,
            time: orderId.time,
            workdayId: `${orderId.workdayId}` === 'null' ? '' : orderId.workdayId,
            chtype: orderId.chtype,
            orderSumFinal: orderId.orderSumFinal,
            cards: itemList,
            status: orderId.status,
          }
          if(ordersArrIndex == orderArr.length - 1) {
            preloader.preloaderOff()
          }
          renderOrderItem(root, 'formed-orders', renderingOrder);

        }
        // отрисовка прочих чеков
        if(rootSelect === 'formed-orders__card-box_returned') {
          try {
            let ordersArr = orderListArr;
            const orderSumContainer = document.querySelector(`.formed-orders__card-box_returned .formed-orders__orders-info`);
            const ordersSumDiv = orderSumContainer.querySelector(`.formed-orders__ordersSum`);
            const ordersSumCashDiv = orderSumContainer.querySelector(`.formed-orders__ordersSum_cash`);
            const ordersSumNoncashDiv = orderSumContainer.querySelector(`.formed-orders__ordersSum_noncash`);
            ordersSumDiv.textContent = `Сумма чеков: 0\u00A0${currency}`
            ordersSumCashDiv.textContent = `Наличный расчёт: 0\u00A0${currency}`
            ordersSumNoncashDiv.textContent = `Без-нал расчёт: 0\u00A0${currency}`
            if(ordersArr.length > 0) {
              ordersArr.forEach((item, index, arr) => renderOrder(item, index, arr))
              ordersSumDiv.textContent = `Сумма чеков: ${ordersReturnSumStat}\u00A0${currency}`
              ordersSumCashDiv.textContent = `Наличный расчёт: ${ordersReturnSumCashStat}\u00A0${currency}`
              ordersSumNoncashDiv.textContent = `Без-нал расчёт: ${ordersReturnSumCashLessStat}\u00A0${currency}`
            } else {
              preloader.preloaderOff()
            }
          } catch (error) {
            popup('Ошибка в отрисовке чеков');
            logger(`Ошибка в отрисовке чеков ${error.message}`);
            preloader.preloaderOff();
          }
          return;
        }
        let ordersArr = orderListArr;
        const orderSumContainer = document.querySelector(`.formed-orders__orders-info`);
        const ordersSumDiv = orderSumContainer.querySelector(`.formed-orders__ordersSum`);
        const ordersSumCashDiv = orderSumContainer.querySelector(`.formed-orders__ordersSum_cash`);
        const ordersSumNoncashDiv = orderSumContainer.querySelector(`.formed-orders__ordersSum_noncash`);
        ordersSumDiv.textContent = `Сумма чеков: 0\u00A0${currency}`
        ordersSumCashDiv.textContent = `Наличный расчёт: 0\u00A0${currency}`
        ordersSumNoncashDiv.textContent = `Без-нал расчёт: 0\u00A0${currency}`

        if(ordersArr.length > 0) {
          ordersArr.forEach((item, index, arr) => renderOrder(item, index, arr))
          ordersSumDiv.textContent = `Сумма чеков: ${ordersSumStat}\u00A0${currency}`
          ordersSumCashDiv.textContent = `Наличный расчёт: ${ordersSumCashStat}\u00A0${currency}`
          ordersSumNoncashDiv.textContent = `Без-нал расчёт: ${ordersSumCashLessStat}\u00A0${currency}`
        } else {
          preloader.preloaderOff()
        }
      } catch (error) {
        popup('Ошибка в отрисовке чеков');
        logger(`Ошибка в отрисовке чеков ${error.message}`);
        preloader.preloaderOff();
      }
    }
  }
  // Скроллбары
  // первым передаем класс скролла вторым расстояние прохождения
  this.scrollFuncVert = function(scrollBox, oneClick = 1) {
    // принимаем контейнер конкретного скролла
    const scrollWrapper = document.querySelector(scrollBox);
    let scrollInterval; /*скролл на 1px вниз за 10 милисек*/
    const wrap = scrollWrapper.querySelector('.simplebar-content-wrapper')
    const btnUp = scrollWrapper.querySelector('.btn_nav-up');
    const btnDown = scrollWrapper.querySelector('.btn_nav-down');
    // функция скролла вверх
    function scrollUpFunc() {
      const scrollUp = () => {
        wrap.scrollTop = wrap.scrollTop - oneClick;
      }
      clearInterval(scrollInterval);
      scrollInterval = setInterval(scrollUp, 10);
      setTimeout(()=> {
        clearInterval(scrollInterval)
      }, 200);
    }
    // функция скролла вниз
    function scrollDownFunc() {
      const scrollDown = () => {
        wrap.scrollTop = wrap.scrollTop + oneClick;
      }
      clearInterval(scrollInterval)
      scrollInterval = setInterval(scrollDown, 10);
      setTimeout(()=> {
        clearInterval(scrollInterval)
      }, 200);
    }
    btnDown.addEventListener('click', () => {
      scrollDownFunc();
    });
    btnUp.addEventListener('click', () => {
      scrollUpFunc();
    });
  }
  this.scrollFuncHoryz = function(scrollBox, oneClick = 1) {
    // принимаем контейнер конкретного скролла
    const scrollWrapper = document.querySelector(scrollBox);
    let scrollInterval; /*скролл на 1px вниз за 10 милисек*/
    const wrap = scrollWrapper.querySelector('.simplebar-content-wrapper')
    const btnLeft = scrollWrapper.querySelector('.btn_nav-left');
    const btnRight = scrollWrapper.querySelector('.btn_nav-right');
    // функция скролла лево
    function scrollLeftFunc() {
      const scrollLeftFunc = () => {
        wrap.scrollLeft += oneClick;
      }
      clearInterval(scrollInterval)
      scrollInterval = setInterval(scrollLeftFunc, 8);
      setTimeout(()=> {
        clearInterval(scrollInterval)
      }, 160);
    }
    // функция скролла право
    function scrollRigthFunc() {
      const scrollRigthFunc = () => {
        wrap.scrollLeft -= oneClick;
      }
      clearInterval(scrollInterval)
      scrollInterval = setInterval(scrollRigthFunc, 10);
      setTimeout(()=> {
        clearInterval(scrollInterval)
      }, 200);
    }
    btnLeft.addEventListener('click', () => {
      scrollLeftFunc();
    });
    btnRight.addEventListener('click', () => {
      scrollRigthFunc();
    });
  }
  // ВСЕ ПО СЧЕТЧИКУ СДАЧИ
  this.surrender = function() {
    // обработчик счетчика сдачи
    function counterSurrender() {
      valueSurrender = valueStock - orderSumFinal;
      outputValueSurrenderArr.forEach((j) => {
        if (valueSurrender > 0) {
          j.textContent = 'Сдача: ' + valueSurrender;
        } else {
          j.textContent = 'Сдача: ';
        }
      });
    }
    // счетчик введенных наличных
    function counterStock() {
      outputValueStockArr.forEach((j) => {
        j.textContent = 'Получено: ';
      })
      btnDenominationArr.forEach((btnDenomination)=> {
        btnDenomination.addEventListener('click', (() => {
          valueStock = Number(`${valueStock}${btnDenomination.textContent.trim()}`);
          outputValueStockArr.forEach((j) => {
            j.textContent = 'Получено: ' + valueStock;
          })
          counterSurrender()
        }));
      })
    }
    // очистка введенных наличных
    function clearStock() {
      btnClear.addEventListener('click',(() => {
        outputValueStockArr.forEach((j) => {
          j.textContent = 'Получено: ';
        })
        valueStock = 0;
        valueSurrender = 0;
        counterSurrender();
      }));
      const btnDel = document.querySelector('.surrender__btn_del')
      btnDel.addEventListener('click',(() => {
        valueStock = Number(`${valueStock}`.slice(0, -1));
        outputValueStockArr.forEach((j) => {
          j.textContent = `Получено: ${valueStock}`;
        })
        counterSurrender();
      }));
    };

    // обработчик кнопки наличных
    function btnCashFunc() {
      if (surrenderWrap.classList.contains('surrender_deactiv')) {
        if(writeOffGlobal){
          btnCash.textContent = 'Списание';
        } else{
          btnCash.textContent = 'Наличные';
        }
        btnCash.classList.remove('ready-payment')
        outputValueSurrenderArr.forEach((e) => {
          e.style.opacity = 0;
        });
        outputValueStockArr.forEach((e) => {
          e.style.opacity = 0;
        });
      } else {
        btnCash.textContent = 'Оплатить';
        btnCash.classList.add('ready-payment'); /* это нужно для закрытия чека */
        outputValueSurrenderArr.forEach((e) => {
          e.style.opacity = 1;
        });
        outputValueStockArr.forEach((e) => {
          e.style.opacity = 1;
        });
      }
    }
    // вызов функций
    btnCashFunc();
    clearStock();
    counterSurrender();
    counterStock();
    // проявление счетчика скидки
    btnCash.addEventListener('click', (() => {
      surrenderWrap.classList.toggle('surrender_deactiv')
      btnCashFunc()
    }));
    // скрытие счетчика
    document.addEventListener('click', (i) => {
      if (!i.target.closest('.surrender') && !i.target.closest('.interaction__btn_cash')) {
        surrenderWrap.classList.add('surrender_deactiv')
        btnCashFunc()
      }
      counterSurrender();
    });
  }
  //кнопка "все категории"
  this.btnAllCategory = function() {
    const btn = document.querySelector('#all-category')
    const root = document.querySelector('.header__menu')

    btn.addEventListener('click', () => {
      // отрисовка заного все кнопок
      const allCategoryList = el('div', `allCategory__list`)
      root.appendChild(allCategoryList)
      root.classList.add('allCategory')
      menuApp.renderList('allCategory', menuApp.load('menuDb', null))
      // открытие бургера
      document.getElementById('burger').click();
    })
  }
  // отрисовка окна добавления в чек весового товара
  // card - техкарта из массива меню
  this.weigher = function(card) {
    //общий класс для карточки
    const weigher = 'weigher'
     // обработка кнопки в окне добавления
    const weigherSubmit = function (e) {
      e.preventDefault();
      let amount = document.querySelector(`.${weigher}__input`).value / 1000;
      document.querySelector(`.${weigher}__input`).value = '';
      entry.product(Number(card.id), card.name, card.bulk_value, card.bulk_untils, Number(card.price), Number(amount), Number(card.cashback_percent), Number(card.parent))
      modalClose(document.querySelector('.modalR'))
    }
    // валидация того что в инпуте
    const inputValidate = function(e) {
      e.preventDefault();
      let input = document.querySelector(`.${weigher}__input`)
      let submitBtn = document.querySelector(`.${weigher}__submit`)
      clearTimeout(weigherDelay);
      weigherDelay = setTimeout(function() {
        input.value = input.value.replace(/[^\d]/g, '')
        if (input.value !== '') {
          if (input.value < 0) {
            input.value = 0
          } else {
            submitBtn.removeAttribute('disabled');
          }
        } else {
          submitBtn.setAttribute('disabled', 'disabled');
        }
      }, 200);
    }
    // переключатель состояния кнопки ручного/автоматического ввода веса
    const turnManual = function(e) {
      e.preventDefault()
      if(!e.target.matches(`.${weigher}__btn-manual_active`)) {
        e.target.classList.add(`${weigher}__btn-manual_active`)
        document.querySelector(`.${weigher}__input`).removeAttribute('disabled');
        document.querySelector(`.${weigher}__input`).value = '';
        document.querySelector(`.${weigher}__autoInput`).setAttribute('disabled', 'disabled');
        document.querySelector(`.${weigher}__submit`).setAttribute('disabled', 'disabled');
        e.target.parentNode.querySelector(`.${weigher}__btn-auto_active`).classList.remove(`${weigher}__btn-auto_active`)
      }
    }
    // переключатель состояния кнопки ручного/автоматического ввода веса
    const turnAuto = function(e) {
      e.preventDefault()
      if(!e.target.matches(`.${weigher}__btn-auto_active`)) {
        e.target.classList.add(`${weigher}__btn-auto_active`)
        document.querySelector(`.${weigher}__input`).setAttribute('disabled', 'disabled');
        document.querySelector(`.${weigher}__input`).value = '';
        document.querySelector(`.${weigher}__autoInput`).removeAttribute('disabled')
        document.querySelector(`.${weigher}__submit`).setAttribute('disabled', 'disabled');
        e.target.parentNode.querySelector(`.${weigher}__btn-manual_active`).classList.remove(`${weigher}__btn-manual_active`)
      }
    }
    // пока не работает
    // передать с весов в инпут
    const takeWeight = function(e) {
      e.preventDefault();
      if(useWeight) {
        const weightInput = document.querySelector(`.${weigher}__input`);
        weightInput.value = '';
        let weight = 0
        weight = myWeight.getWeight()
        weightInput.value = Number(weight);
      }
    }

    // создание окна добавления весового товара
    const newWeigher = el('div',`${weigher}__container`, [
      el('div', `${weigher}__descr`, [
        el('h2', `${weigher}__title`, `${card.name}`),
        el('h2', `${weigher}__price`, `Цена за 1кг - ${card.price} ${currency}`)
      ]),
      el('div', `${weigher}__btn-group`, [
        el('button', `${weigher}__btn-auto btn`, `Весы`),
        el(`button`, `${weigher}__btn-manual ${weigher}__btn-manual_active btn`, `Ручной ввод`)
      ]),
      el('form', `${weigher}__form`, [
        el('input', `${weigher}__input keyboard-input`, '', {type: 'number', placeholder: 'Введите вес в граммах(г)'}),
        el('div', `${weigher}__btn-group`, [
          el('button', `${weigher}__autoInput btn`, 'Снять замер', {disabled: 'disabled'}),
          el(`button`, `${weigher}__submit btn`, `Применить`, {disabled: 'disabled'})
        ])
      ]
      ),
    ])
    newWeigher.querySelector(`.${weigher}__submit`).onclick = weigherSubmit;
    newWeigher.querySelector(`.${weigher}__input`).oninput = inputValidate;
    newWeigher.querySelector(`.${weigher}__input`).onfocus = (e) => {
      e.preventDefault()
      keyboardInit(e.target, false)
    };

    newWeigher.querySelector(`.${weigher}__btn-auto`).onclick = turnAuto;
    newWeigher.querySelector(`.${weigher}__btn-manual`).onclick = turnManual;
    newWeigher.querySelector(`.${weigher}__autoInput`).onclick = takeWeight;

    // переделать на модульность
    const root = document.querySelector(`.modalR__content`)
    root.classList.add('weigher')
    root.innerHTML = '';
    root.appendChild(newWeigher)
    modalOpen(document.getElementById('modalR'));
  }

  // функционал кнопки обновления
  this.btnFptsUpdate = function() {
    const btnFptsUpdate= document.querySelector('#btn-updateTerminal')
    btnFptsUpdate.addEventListener('click', (e) => {
      popup('Обновление подключение к фискальнику')
      devkkm.init()
    })
  }

  // функционал кнопки сброса обновления
  this.btnUptadeTerminalReset = function() {
    // const btnUpdateReset = document.querySelector('#btn-updateTerminal-reset')
    // btnUpdateReset.addEventListener('click', updateTerminal.getBackupFile())
  }
  // информация по рабочему дню
  this.getWorkDayInfo = function() {
    const divUseTerminal = document.querySelector(`.menu__status_terminal`)
    const divUseAtol = document.querySelector(`.menu__status_atol`)
    const infoContainer = document.querySelector('.info')
    const dayInfoContainer = document.querySelector('#info-00')
    const sum = dayInfoContainer.querySelector('.all-revenue');
    const cashSum = dayInfoContainer.querySelector('.cash-revenue')
    const cashLessSum = dayInfoContainer.querySelector('.cashLess-revenue')
    const orders = dayInfoContainer.querySelector('.number-orders');
    const averageOrder = dayInfoContainer.querySelector('.average-order');
    const cashSumReturnItem = dayInfoContainer.querySelector('.cash-revenue-return');
    const cashLessSumReturnItem = dayInfoContainer.querySelector('.cashLess-revenue-return');
    const qrSum = dayInfoContainer.querySelector('.qr-revenue');
    const qrReturn = dayInfoContainer.querySelector('.qr-return');

    const dayliPlanFiller = dayInfoContainer.querySelector('.daily-plan__filler');
    const dayliPlanDisplay = dayInfoContainer.querySelector('.daily-plan__display');
    const toCleanContainer = infoContainer.querySelectorAll('.info__container')
      toCleanContainer.forEach((i) => {
        if(i.id !== 'info-00' && i.id !== 'info-plan-00') {
          infoContainer.removeChild(i)
        } else {
          if(i.id !== 'info-plan-00') {
            i.querySelector('.info-caption').textContent = `Информация за текущий день(${dateStrGlobal})`
          }
        }
      })
    let dailyStat = subfunc.getDailyStat()
    let dayliPlan = Math.ceil(Number(dailyStat.sum) / 100)
    dayliPlanDisplay.textContent = dayliPlan+'%'
    dayliPlanFiller.style.width = dayliPlan+'%'

    qrSum.textContent = `${dailyStat.qrSum} ${currency}`
    qrReturn.textContent = `${dailyStat.qrReturn} ${currency}`
    sum.textContent = dailyStat.sum + ` ${currency}`
    orders.textContent = dailyStat.orders
    averageOrder.textContent = dailyStat.averageOrder + ` ${currency}`
    cashSumReturnItem.textContent = dailyStat.cashSumReturn + ` ${currency}`
    cashLessSumReturnItem.textContent = dailyStat.cashLessSumReturn + ` ${currency}`
    cashSum.textContent = dailyStat.cashSum + ` ${currency}`
    cashLessSum.textContent = dailyStat.cashLessSum + ` ${currency}`
    ordersSumStat = dailyStat.sum;
    ordersSumCashStat = dailyStat.cashSum;
    ordersSumCashLessStat = dailyStat.cashLessSum;
    ordersReturnSumStat = dailyStat.returnSum;
    ordersReturnSumCashStat = dailyStat.cashSumReturn;
    ordersReturnSumCashLessStat = dailyStat.cashLessSumReturn;
    try {
      let workDayListRes = db.query(`SELECT id, tokenWorkdayOffline FROM workday WHERE dateDay = '${dateStrGlobal}'`);
      Object.entries(workDayListRes).forEach(([key, value]) => {
        let tokenWorkday = value.tokenWorkdayOffline
        let stat = subfunc.getDailyStat(tokenWorkday)
        let newItem =  el('div', `info__container`, [
          el('h2', 'info__caption info-caption', `Смена ${value.id}`),
          el('ul', `info__list`, [
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Выручка'),
              el('p', 'info__text all-revenue', `${stat.sum} ${currency}`)
            ]),
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Кол-во чеков:'),
              el('p', 'info__text number-orders', `${stat.orders}`)
            ]),
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Средний чек:'),
              el('p', 'info__text average-order', `${stat.averageOrder} ${currency}`)
            ]),
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Выручка наличный:'),
              el('p', 'info__text cash-revenue', `${stat.cashSum} ${currency}`)
            ]),
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Выручка безнал:'),
              el('p', 'info__text cash-revenue', `${stat.cashLessSum} ${currency}`)
            ]),
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Выручка QR code:'),
              el('p', 'info__text qr-revenue', `${stat.qrSum} ${currency}`)
            ]),
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Возврат наличный:'),
              el('p', 'info__text cash-revenue-return', `${stat.cashSumReturn} ${currency}`)
            ]),
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Возврат безнал:'),
              el('p', 'info__text cashLess-revenue-return', `${stat.cashLessSumReturn} ${currency}`)
            ]),
            el('li', 'info__item' , [
              el('h3', 'info__title', 'Возврат QR code:'),
              el('p', 'info__text qr-return', `${stat.qrReturn} ${currency}`)
            ])
          ]
          ),
        ], { id: `info-${tokenWorkday}`})
        try {
          if(stat.cashSumReturn > 0 || stat.cashLessSumReturn > 0 || stat.cashSum > 0 || stat.cashLessSum > 0) {
            infoContainer.insertBefore(newItem, document.querySelector('#info-00').nextSibling)
          }
        } catch (error) {

        }
      });
    } catch (error) {
      popup('Смена архивирована')
      logger('Ошибка в отрисовке статистики:'+ error.message)
    }
    //скрытие qr-code статистики
    setting.showQRcode(!!useQRcode)
    try {
      if(useTerminal) {
        divUseTerminal.classList.remove('menu__status_error')
      } else {
        divUseTerminal.classList.add('menu__status_error')
      }
    } catch (e) {
    }
  }
  // дропдаун для настроек
  this.dropdownSelect = function(selector) {
    // const selectorWrapper = document.querySelector(selector)
    // const selectDisplay = selectorWrapper.querySelector('.dropdown__btn-text')
    // const selectDropdown = selectorWrapper.querySelector('.dropdown__content-box_select')
    // if(!selectorWrapper) {
    //   alert('Дропдаун не нашел селект по строке')
    // }
    // const btnNodeList = selectorWrapper.querySelector('.dropdown__list')
    // btnNodeList.addEventListener('click', (e) => {
    //   if(e.target.matches('.dropdown__item-btn_select')) {
    //     selectDisplay.textContent = e.target.textContent;
    //     selectDropdown.classList.remove('active')
    //   }
    // })
  }
  this.checklists = function() {

  }
  this.declaration = function() {
    const declarationWrap = document.querySelector('.declaration')
    declarationWrap.addEventListener('click', (()=>{
      declarationWrap.classList.toggle('declaration_active')
    }))
  }
  // функционал возврата
  //Попап на частичный возврат
  this.orderRefund = function (order, productArray) {
    if(!productArray) {
      return
    }
    try {
      const root = document.querySelector(`.body`);
      const clasName = 'order-refund';
      const orderType = order.chtype == 0 ? 'наличными': (order.chtype == 1 ? 'безнал': 'QR-code');
      let toTransactionProdList = [];
      let totalAmount = order.amount;
      let toTransactionOrder = {amount: order.amount, orderSumFinal: order.orderSumFinal, orderHashcode: order.hashcode, idOrder:order.id};
      const productList = productArray.map((product, index) => {
        const input = el('input', 'counter__input keyboard-input keyboard-input_num', '', { type: 'number'});
        input.value = product.amount;
        input.id = `idProd${index}`;
        input.addEventListener('focus', (e) => {
          e.preventDefault()
          keyboardInit(e.target, false)
        });
        input.addEventListener('input', (e) => {
          let btn = e.target
          let checkBox = btn.closest('.item-checkbox').querySelector('.item-checkbox__input')
          clearTimeout(delay);
          delay = setTimeout(() => {
            if(isNaN(input.value)) {
              input.value = 0;
            }
            if(input.value.length > 10) {
              input.value = 999999999
            }
            let newValue = Number(input.value);
            if(newValue >= maxValue) {
              newValue = maxValue
              input.value = newValue
              inputDisplay.textContent = `${newValue}/${maxValue}`
              checkBox.checked = false
              checkBox.click()
            } else if(newValue < 1) {
              input.value = 0
              inputDisplay.textContent = `0/${maxValue}`
              checkBox.checked = true
              checkBox.click()
            } else {
              productArray[index].amount = newValue
              document.querySelector('.item-checkbox .item-info__span_totalSum').textContent = `${productArray[index].interimPrice * productArray[index].amount} ${currency}`
              inputDisplay.textContent = `${newValue}/${maxValue}`
              checkBox.checked = false
              checkBox.click()
            }
          }, 200);
        })

        const maxValue = Number(product.amount);

        const label = el('label', 'counter__input-label', [
          input,
          el('span', 'counter__input-display', `${maxValue}/${maxValue}`),
        ])

        const inputDisplay = label.querySelector('.counter__input-display')


        const plusBtn = el('button', 'counter__btn counter__btn_up btn btn_hover-alternate', '+', {id :`btnPlus${index}`});
        const minusBtn = el('button', 'counter__btn counter__btn_down btn btn_hover-alternate', '-', {id :`btnMinus${index}`});

        plusBtn.addEventListener('click', (e) => {
          e.preventDefault()
          let newValue = Number(input.value) + 1
          let btn = e.target
          let checkBox = btn.closest('.item-checkbox').querySelector('.item-checkbox__input')
          if(newValue <= maxValue) {
            productArray[index].amount = newValue
            inputDisplay.textContent = `${newValue}/${maxValue}`
            input.value = newValue
          } else {
            productArray[index].amount = maxValue
          }
          document.querySelector('.item-checkbox .item-info__span_totalSum').textContent = `${productArray[index].interimPrice * productArray[index].amount} ${currency}`
          checkBox.checked = false
          checkBox.click()
        });

        minusBtn.addEventListener('click', (e) => {
          e.preventDefault()
          let btn = e.target
          let checkBox = btn.closest('.item-checkbox').querySelector('.item-checkbox__input')
          let oldLength = String(input.value).length
          let newValue = Number(input.value) - 1;
          if(String(newValue).length > oldLength) newValue = Number(String(newValue).substring(0, oldLength));
          if(newValue >= 1) {
            productArray[index].amount = newValue
            document.querySelector('.item-checkbox .item-info__span_totalSum').textContent = `${productArray[index].interimPrice * productArray[index].amount} ${currency}`
            inputDisplay.textContent = `${newValue}/${maxValue}`
            input.value = newValue
            checkBox.checked = false
            checkBox.click()
          } else {
            productArray[index].amount = 0;
            input.value = 0
            inputDisplay.textContent = `0/${maxValue}`
            checkBox.checked = true
            checkBox.click()
          }
        });
        return  el('li', `${clasName}__item item-checkbox`, [
          el('input', `item-checkbox__input`, '', {type: "checkbox", id:`proditem-${index}`, name:'order-item', checked:'checked'}),
          el('label', `item-checkbox__label`, [
            el('div', `${clasName}__item-info item-info`,[
              el('div', `item-info__item`, [
                el('span', 'item-info__span', `${product.name} ${product.bulkvalue}${product.bulkuntils}`),
              ]),
              el('div', 'item-info__item item-info__item_counter counter counter_refund', [
                minusBtn,
                label,
                plusBtn
              ]),
              el('div', `item-info__item`, [
                el('span', 'item-info__span', 'Цена:'),
                el('span', 'item-info__span', `${product.priceFinal} ${currency}`),
              ]),
              el('div', `item-info__item`, [
                el('span', 'item-info__span', 'Итого:'),
                el('span', 'item-info__span item-info__span_totalSum', `${product.productSum} ${currency}`),
              ]),
            ]),
            el('span', 'item-checkbox__icon', '')
          ], { for: `proditem-${index}`}),
        ]
      )
      })
      const newPreloader = el('div', 'preloader', [
        el('div', `preloader__content ${clasName}`, [
          el('h2', `${clasName}__title`, `Меню возврата чека ${orderType}: №${order.id}`),
          el('div', `${clasName}__list-wrap scrollbar`,
            el('ul', `${clasName}__list`, productList),
          ),
          el('div', `${clasName}__subtotal-info`, [
            el('button', `${clasName}__btn ${clasName}__btn_toggle btn`, 'Выбрать/Убрать всё'),
            el('div', `${clasName}__subtotal-info-item`, 'Итого к отмене:'),
            el('div', `${clasName}__subtotal-info-item ${clasName}__subtotal-info-item_amount`, `Позиций: ${order.amount}`),
            el('div', `${clasName}__subtotal-info-item ${clasName}__subtotal-info-item_sum`, `На сумму: ${order.orderSumFinal} ${currency}`),
          ]),
          el('div', `${clasName}__btn-group`, [
            el('button', `${clasName}__btn ${clasName}__btn_confirm btn`, 'Подтвердить'),
            el('button', `${clasName}__btn ${clasName}__btn_cancel btn`, 'Отменить'),
          ]),
          el('div', `${clasName}__scroll-btn ${clasName}__scroll-btn_up btn btn_nav btn_nav-up`, ''),
          el('div', `${clasName}__scroll-btn ${clasName}__scroll-btn_down btn btn_nav btn_nav-down`, '')
          ])
        ]
      )
      newPreloader.querySelector(`.btn_nav-up`).innerHTML = `<svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29 1C13.5381 1 0.999999 13.5381 0.999999 29C0.999999 44.4619 13.5381 57 29 57C44.464 57 57 44.4631 57 29C57 13.5369 44.464 1 29 1Z" stroke="white" stroke-width="2"/>
      <path d="M42.2676 22.7889C41.3826 21.8297 40.0004 21.7456 39.0282 22.5344L38.7497 22.7972L29.0033 33.4523L19.2503 22.7972C18.3691 21.8338 16.9873 21.7432 16.0119 22.5274L15.7324 22.7889C14.8473 23.7481 14.7641 25.2521 15.4845 26.3138L15.7248 26.618L27.2372 39.2028C28.1212 40.1691 29.508 40.2569 30.4834 39.4664L30.7628 39.2028L42.2752 26.618C43.2446 25.5583 43.2412 23.844 42.2676 22.7889Z" fill="currentColor"/>
      </svg>`
      newPreloader.querySelector(`.btn_nav-down`).innerHTML = ` <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29 1C13.5381 1 0.999999 13.5381 0.999999 29C0.999999 44.4619 13.5381 57 29 57C44.464 57 57 44.4631 57 29C57 13.5369 44.464 1 29 1Z" stroke="white" stroke-width="2"/>
      <path d="M42.2676 22.7889C41.3826 21.8297 40.0004 21.7456 39.0282 22.5344L38.7497 22.7972L29.0033 33.4523L19.2503 22.7972C18.3691 21.8338 16.9873 21.7432 16.0119 22.5274L15.7324 22.7889C14.8473 23.7481 14.7641 25.2521 15.4845 26.3138L15.7248 26.618L27.2372 39.2028C28.1212 40.1691 29.508 40.2569 30.4834 39.4664L30.7628 39.2028L42.2752 26.618C43.2446 25.5583 43.2412 23.844 42.2676 22.7889Z" fill="currentColor"/>
      </svg>`
      newPreloader.querySelector(`.${clasName}__btn_cancel`).addEventListener('click', (e) => {
        e.preventDefault()
        preloader.preloaderOff()
      })
      const checkBoxList = newPreloader.querySelectorAll(`.${clasName}__item`)
      if(checkBoxList.length > 0) {
        checkBoxList.forEach((item) => {
          const input = item.querySelector('.item-checkbox__input')
          input.addEventListener('change', (e) => {
            e.preventDefault();
            toTransactionProdList = []
            if(input.checked) {
              if(productArray[input.id.split('-')[1]].amount == 0) {
                let counterDisplay = document.querySelector('.item-checkbox .counter__input-display')
                let counterInput= document.querySelector('.item-checkbox .counter__input')
                let maxValue = Number(counterDisplay.textContent.split('/')[1])
                productArray[input.id.split('-')[1]].amount = maxValue
                document.querySelector('.item-checkbox .item-info__span_totalSum').textContent = `${productArray[input.id.split('-')[1]].interimPrice * productArray[input.id.split('-')[1]].amount} ${currency}`
                counterDisplay.textContent = `${maxValue}/${maxValue}`
                counterInput.value = maxValue
              }
            }
            checkBoxList.forEach((j) => {
              const input = j.querySelector('.item-checkbox__input')
              if(input.checked) {
                toTransactionProdList.push(productArray[input.id.split('-')[1]])
              }
            })
            if(toTransactionProdList.length > 0) {
              toTransactionOrder.orderSumFinal = 0;
              toTransactionOrder.amount = 0;
              toTransactionProdList.forEach((i) => {
                toTransactionOrder.amount +=  Number(i.amount);
                toTransactionOrder.orderSumFinal += Number(i.interimPrice) * Number(i.amount)
              })
            } else {
              toTransactionOrder.amount = 0;
              toTransactionOrder.orderSumFinal = 0;
            }
            newPreloader.querySelector(`.${clasName}__subtotal-info-item_amount`).textContent = `Позиций: ${toTransactionOrder.amount}`
            newPreloader.querySelector(`.${clasName}__subtotal-info-item_sum`).textContent = `На сумму: ${toTransactionOrder.orderSumFinal} ${currency}`
          })
        })
      }
      newPreloader.querySelector(`.${clasName}__btn_toggle`).addEventListener('click', (e) => {
        e.preventDefault()
        if(checkBoxList.length > 0) {
          let checked = false
          checkBoxList.forEach((item, index) => {
            const input = item.querySelector('.item-checkbox__input')
            if(index == 0) checked = !input.checked
            input.checked = !checked
            input.click()
          })
        }
      })
      newPreloader.querySelector(`.${clasName}__btn_confirm`).addEventListener('click', (e) => {
        e.preventDefault()
        if(toTransactionOrder.amount == totalAmount) { // стандартный возврат
          const refaundBtn = document.querySelector(`.formed-orders [data-value="${toTransactionOrder.idOrder}"]`);
          if(refaundBtn.dataset.chtype == 0 ) {
            let order = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));
            let productArr = subfunc.getProductArr(order);
            logger(JSON.stringify(order)+'\n'+JSON.stringify(productArr))
            if (useAtol && !troubleAtol) { // если используется атол
              if(devkkm.printReturtOrder(order, productArr)) {
                popup(`Чек ${order.id} успешно отменен`);
                refaundBtn.textContent = 'Отменен';
                refaundBtn.setAttribute("disabled", "disabled");
              } else {
                popup(`Печать возврата чека ${order.id} не удалась`);
                logger(`Печать возврата чека ${order.id} не удалась`);
                troubleAtolCounter += 1;
                if (troubleAtolCounter === 2) {
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
                  let q = `UPDATE orders SET status = -1 WHERE id = ${Number(order.id)}`;
                  try {
                    db.query(q);
                    refaundBtn.textContent = 'Отменен';
                    refaundBtn.setAttribute("disabled", "disabled");
                  } catch (e) {
                    logger(`чек ${Number(order.id)} не удалось записать, чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} ошибка ${e.message}`);
                    popup(`чек ${Number(order.id)} не удалось записать`);
                  }
                };
              }
            } else if (useAtol && troubleAtol) {
              let q = `UPDATE orders SET status = -1 WHERE id = ${Number(order.id)}`;
              try {
                db.query(q);
                refaundBtn.textContent = 'Отменен';
                refaundBtn.setAttribute("disabled", "disabled");
                popup('Печать чеков невозможна, проверьте работу фискальника и выключите аварийный режим');
              } catch(e) {
                try {
                  db.conn.close()
                } catch (error) {

                }
                popup(`фиксация чека после отмены ${order.id} не удалась`);
                logger(`фиксация чека после отмены ${order.id} не удалась чек ${JSON.stringify(order)} товары в нем ${JSON.stringify(productArr)}`+e.message);
              }
            } else {
              let q = `UPDATE orders SET status = -2 WHERE id = ${Number(order.id)}`;
              try {
                db.query(q);
                popup(`Чек ${order.id} успешно отменен`);
                refaundBtn.textContent = 'Отменен';
                refaundBtn.setAttribute("disabled", "disabled");
              } catch (e) {
                try {
                  db.conn.close()
                } catch (error) {

                }
                logger(`чек ${Number(order.id)} не удалось записать, чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} ошибка ${e.message}`);
                popup(`чек ${Number(order.id)} не удалось записать`);
              }
            };
          } else if (refaundBtn.dataset.chtype == 2 && !refaundBtn.classList.contains('ready-payment')) {
            send.cancelQRcode(Number(refaundBtn.dataset.value), refaundBtn);
          } else if(useTerminal && !refaundBtn.classList.contains('ready-payment')) {
            sbbank.refund(Number(refaundBtn.dataset.value), refaundBtn);
          } else if (useAtol === 1 && !troubleAtol) { // если используется атол
            let order = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));
            let productArr = subfunc.getProductArr(order);
            if(devkkm.printReturtOrder(order, productArr)) {
              popup(`Чек ${order.id} успешно отменен`);
              refaundBtn.textContent = 'Отменен';
              refaundBtn.setAttribute("disabled", "disabled");
            } else {
              let order = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));
              let productArr = subfunc.getProductArr(order);
              popup(`Печать возврата чека ${order.id} не удалась`);
              logger(`Печать возврата чека ${order.id} не удалась`);
              troubleAtolCounter += 1;
              if (troubleAtolCounter > 3) {
                troubleAtol = 1;
                document.querySelector('#trouble-atol-toggle').checked = true;
                telegramNote('Аварийный режим атола включён')
                dbMethods.updateDb('settings', {value: 1}, { variable: 'troubleAtol' } );
                popup('Перевод кассы в режим аварийной работы фискального регистратора');
                postman.atolOrder();
                troubleAtolCounter = 0;
                refaundBtn.textContent = 'Отменен';
                refaundBtn.setAttribute("disabled", "disabled");
              };
            }
          } else if (useAtol === 1 && troubleAtol) {
            let order = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));
            let productArr = subfunc.getProductArr(order);
            let q = `UPDATE orders SET status = -1 WHERE id = ${Number(order.id)}`;
            try {
              db.query(q);
              refaundBtn.textContent = 'Отменен';
              refaundBtn.setAttribute("disabled", "disabled");
              popup('Печать чеков невозможна, проверьте работу фискальника и выключите аварийный режим');
            } catch(e) {
              try {
                db.conn.close()
              } catch (error) {

              }
              popup(`фиксация чека после отмены ${order.id} не удалась`);
              logger(`фиксация чека после отмены ${order.id} не удалась чек ${JSON.stringify(order)} товары в нем ${JSON.stringify(productArr)}`+e.message);
            }
          } else {
            let order = subfunc.getOrderObg(7, Number(refaundBtn.dataset.value));
            let productArr = subfunc.getProductArr(order);
            let q = `UPDATE orders SET status = -2 WHERE id = ${Number(order.id)}`;
            refaundBtn.textContent = 'Отменен';
            refaundBtn.setAttribute("disabled", "disabled");
            try {
              db.query(q);
            } catch (e) {
              try {
                db.conn.close()
              } catch (error) {

              }
              logger(`чек ${Number(order.id)} не удалось записать, чек ${JSON.stringify(order)} товары ${JSON.stringify(productArr)} ошибка ${e.message}`);
              popup(`чек ${Number(order.id)} не удалось записать`);
            }
          };
          refaundBtn.textContent = 'Отменен';
          refaundBtn.setAttribute("disabled", "disabled");
          preloader.preloaderOff()
        }
        else {
          if(!toTransactionProdList.length) {
            return
          }
          let q = `INSERT INTO orderrefund (idOrder, amount, orderSumFinal, orderHashcode) VALUES (${toTransactionOrder.idOrder},${toTransactionOrder.amount},${toTransactionOrder.orderSumFinal},'${toTransactionOrder.orderHashcode}')`
          try {
            db.query(q)
          } catch (error) {
            db.conn.close()
            alert(q)
            throw 'Ошибка при добавлении в orderrefund'
          }
          toTransactionProdList.forEach((i) => {
            let q = `UPDATE orderItem SET idOrderRefund = ${toTransactionOrder.idOrder}, amountRefund = ${i.amount} WHERE id = ${Number(i.id)}`;
            try {
              db.query(q)
            } catch (error) {
              db.conn.close()
              throw 'Ошибка при обновлении в orderItem'
            }
          })
          alert('Частичный возврат в разработке \n Выберите все продукты в чеке')
        }
      })

      newPreloader.addEventListener('click', (e) => {
        if(!e.target.closest('.preloader__content')) {
          preloader.preloaderOff()
        }
      })

      root.appendChild(newPreloader)

      new SimpleBar(newPreloader.querySelector(`.scrollbar`), {
        scrollbarMaxSize: 100,
        autoHide : true,
        clickOnTrack: false
      });
      interfaceApp.scrollFuncVert(`.${clasName}`, 38)

    } catch (error) {
      try {
        db.conn.close()
      } catch (e) {

      }
      popup('Ошибка при возврате'+error.message)
      logger('Ошибка при возврате'+error.message)
    }
  }
}
