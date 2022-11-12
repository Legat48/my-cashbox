const menuApp = new function Menu() {
  //открытие файла меню.
  this.openJson = function (name) {
    try {
      let iStream = fso.OpenTextFile(`resourses\\${name}.JSON`,1,false);
      if( ! iStream ) {
        alert( "ошибка открытия файла меню. Дальнейшая работа кассы невозможна"+`resourses\\${name}.JSON` );
        logger(`ошибка открытия файла меню: resourses\\${name}.JSON` );
        return;
      }
      let data = iStream.ReadLine(); // Usually looped for several lines
      iStream.Close();
      return data;
    } catch (error) {
      logger(`Ошибка при открытии файлы меню${error.message}`)
    }
  }

  // перезапись меню, вызывается если пришел ответ с сервера с массивом меню
   this.writeJson = function(name, content) {
    if(!content) {
      logger('Пришло пустое меню')
      return
    }
    try {
      let iStream = fso.OpenTextFile(`resourses\\${name}.JSON`,2,true);
      if( ! iStream ) { alert( "Can't open file"+`resourses\\${name}.JSON` ); return; }
      iStream.WriteLine(content);
      iStream.Close();
      carrentArray = []; //обнуление глобального массива
    } catch (error) {
      logger(`ошибка в функции writeJson ${error.message}`)
    }
  }
  //подгрузка массива
  this.load = function(fileName,filterByParent,filterByName) {
    try {
      //если глобальный массив существует возвращаем массив меню
      if(carrentArray.length > 0) {
        if(filterByName) {
          let data = carrentArray.filter((el) => el.name.toString().toLowerCase().includes(filterByName) && (el.type === 'product' || el.type === 'promotion'))
          return  data;
        }
        let data = carrentArray.filter((el) => el.parent === filterByParent)
        return data
      }
      // открытие меню из файла
      var mdata = this.openJson(fileName);
      var jsn = JSON.parse(mdata);
      var menu = jsn.data;
      carrentArray = menu || []; //присваивание к глобальной переменной меню
      scannerObg = {}; // обновление массива меню для сканера
      // коррекция меню от лишних символов
      if(carrentArray.length > 0) {
        carrentArray.forEach((e) => {
          e.name = e.name.split('\t').join('') //очитска меню по \t
          e.name = e.name.split('\n').join('') //очитска меню по \n
          e.name = e.name.split('"').join('')  //очитска меню по "
          e.name = e.name.split('\\').join('/')  //очитска меню по /
        })
      }
      //создание объекта меню для сканера
      if(carrentArray.length > 0) {
        carrentArray.forEach((e) => {
          try {
            if(e.cards) {
              if (e.cards[0].code) {
                e.cards.forEach((j) => {
                  let id = j.id;
                  let name = e.name;
                  let parent = e.parent;
                  let product = j.product;
                  let subname = j.subname;
                  let weighted = j.weighted;
                  let bulk_value = j.bulk_value;
                  let bulk_untils = j.bulk_untils;
                  let cashback_percent = j.cashback_percent;
                  let price = j.price;
                  scannerObg[`${j.code}`] = {id , name, parent, product, subname, weighted, bulk_value, bulk_untils, cashback_percent, price}
                })
              }
            }
          } catch(e) {
            logger('Ошибка в load'+e.message)
          }
        })
      }
      // поиск по значению импута поиска
      if(filterByName) {
        let data = menu.filter((el) => el.name.toString().toLowerCase().includes(filterByName) && (el.type === 'product' || el.type === 'promotion'))
        return  data;
      }
      // фильтр по родителю для отрисовки товаров и подкатегорий
      let data = menu.filter((el) => el.parent === filterByParent) || []
      let dataCategory = menu.filter((el) => el.type === 'category' )
      if(dataCategory.length > 0) {
        dataCategory.forEach(element => {
          // создание массивоподобного объета для отрисовки категорий
          if(!allCategoryList.hasOwnProperty(`${element.id}`)) {
            allCategoryList[`${element.id}`] = element.name
          }
        });
      }
      if(!data && !filterByName) {
        logger('Пустое меню в load')
      }
      return  data || [];
    } catch (error) {
      logger(`Ошибка в функции загрузки меню ${error.message}`)
    }
  }
  // универсальная функция отрисовки меню
  this.renderList = function(selector, data) {
    if(!data) {
      let message = JSON.stringify(data)
      logger(`Ошибка в функции загрузки меню пустое меню: ${message}`)
      return
    } else {
     try {
      if(data.length <= 0) {
        return
      }
     } catch (error) {
      return
     }
    }
    const root = document.querySelector(`.${selector}`);
    if (!root) {
      popup(`корневой элемент по селектору ${selector} не найден`);
      return;
    }
    const itemList = root.querySelector(`.${selector}__list`)
    itemList.innerHTML = ''; //очистка меню
    // отрисовка слайдера категорий и меню по кнопке все категории
    if (selector === 'category' || selector === 'allCategory') {
      data.unshift({
        name: 'Популярное',
        id: 'popular',
      })
      data.forEach(element => {
      const newItem = el('button', `${selector}__item btn`, `${element.name}`, { id: `${selector}${element.id}`})
      if(element.id == 1 || element.name == 'Кофейное меню' || element.id === 'popular') {
        newItem.classList.add(`${selector}__item_first`)
      }
      // событие отрисовки товаров из категории в интерфейс
      newItem.addEventListener('click', () => {
          if(selector === 'allCategory') {
            document.getElementById('burger').click();
          }
          if(element.id === 'popular') {
            menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
          } else {
            menuApp.renderList('content', menuApp.load('menuDb', element.id));
          }
        });
        itemList.appendChild(newItem)
      });
      return;
    }
    // отрисовка каточек в интерфейс
    if (selector === 'content') {
      data.forEach(element => {
        //отрисовка в интерфейс подкатегории
        if(element.type === 'category') {
        const newItem =
        el('div', `${selector}__item`, [
          el('button', `${selector}__title btn`, `${element.name}`),
        ], { id: `subCategory-${element.id}`})
        newItem.addEventListener('click', (e) => {
          interfaceApp.focusReset(); //сброс фокуса
          menuApp.renderList('content', menuApp.load('menuDb', element.id));
        });
        itemList.appendChild(newItem)
        }
        // отрисовка в интерфейс товара
        if(element.type === 'product' || element.type === 'promotion' ) {
          const buttonsWrapper = el('div', `${selector}__box-unit`)
          const newItem =
          el('div', `${selector}__item`,[
            el('button', `${selector}__title btn`, `${element.name}`),
            buttonsWrapper
          ],{ id: `product-${element.id}`})
          // если это техкарта в категории акци
          if(element.hasOwnProperty('products')) {
            if(!element.enable) return;
            element.products.forEach((card, i) => {
              if(i > 0) return;
              const newItemButton = el('button', `${selector}__unit btn btn_hover`, [
                el('div', `${selector}__unit-value`, `${element.price}${currency}`),
                el('div', `${selector}__unit-price`, ``)
              ])
              newItemButton.addEventListener('click', (e) => {
                interfaceApp.focusReset(); //сброс фокуса
                if(card.weighted) {
                  card.name = element.name;
                  card.parent = element.parent
                  try {

                    interfaceApp.weigher(card);
                  } catch (error) {
                    alert(error.message)
                  }
                  return;
                }
                let amount = 1;
                let maxSale = 1;
                //запись в базу данных и в глобальный объект товара
                entry.product(Number(element.id), element.name, card.bulk_value || 1, card.bulk_untils || 'шт', Number(element.price), Number(amount), 0, Number(element.parent), maxSale)
              });
              buttonsWrapper.appendChild(newItemButton);
            })
            itemList.appendChild(newItem);
            return;
          }
          element.cards.forEach((card) => {
            const newItemButton = el('button', `${selector}__unit btn btn_hover`, [
              el('div', `${selector}__unit-value`, `${card.bulk_value} ${card.bulk_untils}`),
              el('div', `${selector}__unit-price`, `${card.price}${currency}`)
            ])
            newItemButton.addEventListener('click', (e) => {
              interfaceApp.focusReset();
              if(card.weighted) {
                card.name = element.name;
                card.parent = element.parent
                try {
                  interfaceApp.weigher(card);
                } catch (error) {
                  alert(error.message)
                }
                return;
              }
              let amount = 1;
              // На какой тех карте отобразится экран выбора сиропа
              if((element.id == 186 || element.id == 187 ||  element.id == 13 || element.id == 1438) && useToppingMenu == 1) {
                this.toppingSelect({
                  element,
                  card
                })
                return
              }
              entry.product(Number(card.id), element.name, card.bulk_value, card.bulk_untils, Number(card.price), Number(amount), Number(card.cashback_percent), Number(element.parent))
            });
            buttonsWrapper.appendChild(newItemButton);
          });
          itemList.appendChild(newItem)
        }
      });
    }
  }

  // меню по айдишникам
  this.loadById = function(fileName, arrId) {
    try {
      //если глобальный массив существует возвращаем массив меню
      if(carrentArray.length > 0) {
        popCarrentArray = carrentArray;
        return popCarrentArray.filter((el) => arrId.indexOf(`${el.id}`) != '-1' && (el.type === 'product' || el.type === 'promotion'));
      }
      // открытие меню из файла
      var mdata = this.openJson(fileName);
      var jsn = JSON.parse(mdata);
      var menu = jsn.data;
      popCarrentArray = menu || []; //присваивание к глобальной переменной меню
      // коррекция меню от лишних символов
      popCarrentArray = popCarrentArray.filter((el) => arrId.indexOf(`${el.id}`) != '-1' && (el.type === 'product' || el.type === 'promotion'));
      if(popCarrentArray.length > 0) {
        popCarrentArray.forEach((e) => {
          e.name = e.name.split('\t').join('') //очитска меню по \t
          e.name = e.name.split('\n').join('') //очитска меню по \n
          e.name = e.name.split('"').join('')  //очитска меню по "
          e.name = e.name.split('\\').join('/')  //очитска меню по /
        })
      }
      return popCarrentArray || [];
    } catch (error) {
      logger(`Ошибка в функции загрузки меню популярных товаров ${error.message}`)
    }
  }

  this.toppingSelect = function (param) {
    let card = param.card
    let element = param.element
    let amount = 1;
    let productArray = []
    let type = element.id == 187 ? 1:0;
    let menuType = type == 1 ? 'топпинга': 'сиропа';

    try {
      const root = document.querySelector(`.body`);
      const clasName = 'topping-select';
      try {
        let resp = db.query(`SELECT id, name FROM toppinglist WHERE type = ${type}`);
        Object.entries(resp).forEach(([key, value]) => {
          productArray.push(value)
        });
      } catch (error) {
        db.conn.close()
        popup('Ошибка в получении меню сиропов/топпинга'+error.message)
        logger('Ошибка в получении меню сиропов/топпинга'+error.message)
      }
      productArray.sort((a, b) => {
        return b - a;
      });
      function addNewLi(product) {
        const newLi = el('li', `${clasName}__item`, [
          product.name,
          el('div', `${clasName}__delete-wrapper`, el('button', `${clasName}__delete-item`, 'X'))
        ]);
        newLi.querySelector(`.${clasName}__delete-item`).addEventListener('click', (e) => {
          e.preventDefault()
          e.target.closest(`.${clasName}__item`).remove()
          let q = `DELETE FROM toppinglist WHERE name = '${product.name}'`
          try {
            db.query(q)
          } catch (error) {
            db.conn.close()
            popup('Ошибка при добавлении добавки'+error.message)
            logger('Ошибка при добавлении добавки'+error.message)
          }
        })
        newLi.addEventListener('click', (e) => {
          e.preventDefault();
          if(!!e.target.closest(`.${clasName}__delete-wrapper`)) {
            return
          }
          let newName = element.name+': '+product.name
          popup(product.name)
          entry.product(Number(card.id), newName, card.bulk_value, card.bulk_untils, Number(card.price), Number(amount), Number(card.cashback_percent), Number(element.parent))
          preloader.preloaderOff()
        })
        return newLi
      }
      const productList = productArray.map((product) => {
        return addNewLi(product)
      })

      const newPreloader = el('div', 'preloader', [
        el('div', `preloader__content ${clasName}`, [
          el('h2', `${clasName}__title`, `Меню выбора ${menuType}`),
          el('div', `${clasName}__list-wrap scrollbar`,
            el('ul', `${clasName}__list`, productList),
          ),
          el('div', `${clasName}__btn-group`, [
            el('lable', `${clasName}__lable ${clasName}__btn_add`, [
              el('input', `${clasName}__input`, '', {placeholder: 'Введите наименование'}),
              el('button', `${clasName}__btn ${clasName}__btn_confirm btn`, 'Создать+'),
              el('button', `${clasName}__btn ${clasName}__btn_delete btn`, 'Удалить-'),
            ]),
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
      const nodeList = newPreloader.querySelector(`.${clasName}__list`)
      newPreloader.querySelector(`.${clasName}__btn_confirm`).addEventListener('click', (e) => {
        e.preventDefault()
        let newItem = newPreloader.querySelector(`.${clasName}__input`).value;
        if(newItem.length <= 2) {
          return
        }
        newPreloader.querySelector(`.${clasName}__input`).value = '';
        nodeList.insertBefore(addNewLi({ name : newItem}), nodeList.firstChild)
        let q = `INSERT into toppinglist (name, type) values ('${newItem}',${type})`
        try {
          db.query(q)
        } catch (error) {
          db.conn.close()
          popup('Ошибка при добавлении добавки'+error.message)
          logger('Ошибка при добавлении добавки'+error.message)
        }
      })
      newPreloader.querySelector(`.${clasName}__btn_delete`).addEventListener('click', (e) => {
        nodeList.classList.toggle(`${clasName}__list_delete`)
      })
      newPreloader.addEventListener('click', (e) => {
        if(!e.target.closest('.preloader__content') && !e.target.closest(`.${clasName}__delete-wrapper`)) {
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
      popup('Ошибка при отрисовке меню добавок'+error.message)
      logger('Ошибка при отрисовке меню добавок'+error.message)
    }
  }
}


