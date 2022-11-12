"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// api = 'http://cwsystem-free/'
// запрос информации о номере точки и вызов функции создания таблицы с работниками
function getPointInfo(token, subdomain) {
  return new Promise(function (resolve, reject) {
    ieFetch({
      method: 'POST',
      url: api + "api/terminal/info/point/?" + "token=".concat(token, "&subdomain=").concat(subdomain)
    }).then(function (json) {
      var res = JSON.parse(json);
      if (!res) reject('Пустой ответ в geiPoint');

      if (res.type === 'error') {
        reject(res.data.msg);
        return;
      }

      if (res.type === 'success') {
        try {
          var tableArray = dbMethods.objExpandArray(res.data);
          pointCashbox = Number(res.data.point.id);
          addressCashbox = res.data.point.address; // записываем в базу данных номер точки

          dbMethods.updateDb('settings', {
            value: res.data.point.id
          }, {
            variable: 'pointCashbox'
          });
          dbMethods.updateDb('settings', {
            value: res.data.point.address
          }, {
            variable: 'addressCashbox'
          }); // удаляем таблицу с работниками если существует

          db.query("DROP TABLE IF EXISTS employees");

          if (!tableArray) {
            logger("\u0434\u0430\u043D\u043D\u044B\u0435 \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043F\u0440\u0438\u0448\u043B\u0438 \u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 /info/point/".concat(JSON.stringify(json)));
            resolve(res.data);
          } // по массиву работников записываем барист


          tableArray.forEach(function (item) {
            dbWork.addTable('employees', item);
          });
          resolve(res.data);
        } catch (error) {
          popup('Ошибка во время создания таблицы employees\n' + error.message);
          logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0442\u0430\u0431\u043B\u0438\u0446\u044B employees".concat(error.message));
          reject('Ошибка во время создания таблицы employees');
        }
      }
    })["catch"](function (e) {
      reject('Сетевая ошибка в getPointInfo\n' + "".concat(JSON.stringify(e)));
    });
  });
} // запрос на открытие смены (по вводу верного пинкода)


function openWorkDay(token, subdomain, employee, key) {
  return new Promise(function (resolve, reject) {
    ieFetch({
      method: 'POST',
      url: api + "api/terminal/shift/open?" + "token=".concat(token, "&subdomain=").concat(subdomain, "&employee=").concat(employee, "&key=").concat(key, "&subdomain=").concat(subdomain)
    }).then(function (json) {
      var res = JSON.parse(json);

      if (res.code == 633 && useChecklist) {
        checklist.send();
      }

      if (res.code == 634 && useChecklist) {
        checklist.render(1, true);
      }

      if (!res) reject('Пустой ответ в openWorkDay');

      if (res.type === 'error') {
        popup('Ошибка в открытии смены' + JSON.stringify(res) + key);
        reject(res.data.msg);
        return;
      }

      if (res.type === 'success') {
        try {
          resolve(res.data);
        } catch (error) {
          reject('Ошибка при запросе открытия смены');
        }
      }
    })["catch"](function (e) {
      reject('Сетевая ошибка в openWorkDay\n' + "".concat(JSON.stringify(e)));
    });
  });
} // запрос на закрытие смены


function closeWorkDay(token, subdomain, key) {
  return new Promise(function (resolve, reject) {
    ieFetch({
      method: 'POST',
      url: api + "api/terminal/shift/close?" + "token=".concat(token, "&subdomain=").concat(subdomain, "&key=").concat(key, "&subdomain=").concat(subdomain)
    }).then(function (json) {
      var res = JSON.parse(json);
      if (!res) reject('Пустой ответ в openWorkDay');

      if (res.type === 'error') {
        reject(res.data.msg);
        return;
      }

      if (res.type === 'success') {
        try {
          resolve(res.data);
        } catch (error) {
          reject('Ошибка при запросе открытия смены');
        }
      }
    })["catch"](function (e) {
      reject('Ошибка при закрытии смены в closeWorkDay' + "".concat(JSON.stringify(e)));
    });
  });
} // get запрос не доделан, получает информацию о смене открытой онлайн


function checkWorkDay(token, subdomain, key) {
  return new Promise(function (resolve, reject) {
    ieFetch({
      method: 'POST',
      url: api + "api/terminal/checks/shift?" + "token=".concat(token, "&subdomain=").concat(subdomain, "&token=").concat(token, "&subdomain=").concat(subdomain, "&key=").concat(key)
    }).then(function (json) {
      var res = JSON.parse(json);
      if (!res) reject('Пустой ответ в openWorkDay');

      if (res.type === 'error') {
        reject(res.data.msg);
        return;
      }

      if (res.type === 'success') {
        try {
          // alert(JSON.stringify(res.data))
          resolve(res.data);
        } catch (error) {
          reject('Ошибка при запросе');
        }
      }
    })["catch"](function (e) {
      reject('Сетевая ошибка в checkWorkDay\n' + "".concat(JSON.stringify(e)));
    });
  });
} // создать таблицу скидок


function createDiscountsTable(data) {
  // alert(data)
  if (data == '') {
    try {
      db.query("CREATE TABLE IF NOT EXISTS discounts (id Integer PRIMARY KEY AUTOINCREMENT, time_from Integer, time_to Integer, weekdays, discount, type, categories, temp, techcards_id )");
      return;
    } catch (e) {
      popup('ошибка в создании пустой таблицы скидок');
      logger('ошибка в создании пустой таблицы скидок' + e.message);
      return;
    }
  }

  var tableArray = data;
  tableArray.forEach(function (item) {
    item.weekdays = item.weekdays.join('');
    var newValue = [];

    for (var _i = 0, _Object$entries = Object.entries(item["technical_cards"]); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      newValue.push(_defineProperty({}, "techcards_id", Number(value)));
    }

    item["technical_cards"] = newValue;
    item["time_from"] = Number(item["time_from"].split(':').join(''));

    if (item["time_from"].length < 1) {
      item["time_from"] = 0;
    }

    item["time_to"] = Number(item["time_to"].split(':').join(''));

    if (item["time_to"].length < 1) {
      item["time_to"] = 2400;
    }

    item["discount"] = 1 - Number(item["discount"]) / 100;
    item["temp"] = 0;
    var newArray = dbMethods.objExpandArray(item);

    try {
      var query = '';
      newArray.forEach(function (e) {
        if (query.length > 0) {
          query = "".concat(query, ",(").concat(e.time_from, ",").concat(e.time_to, ",'").concat(e.weekdays, "',").concat(e.discount, ",").concat(e.type, ",").concat(e.temp, ",").concat(e.techcards_id, ")");
        } else {
          query = "(".concat(e.time_from, ",").concat(e.time_to, ",'").concat(e.weekdays, "',").concat(e.discount, ",").concat(e.type, ",").concat(e.temp, ",").concat(e.techcards_id, ")");
        }
      });
      var q = "INSERT into discounts (time_from, time_to, weekdays, discount, type, temp, techcards_id) values ".concat(query);
      logger(q);
      db.query("DROP TABLE IF EXISTS discounts");
      db.query("CREATE TABLE IF NOT EXISTS discounts (id Integer PRIMARY KEY AUTOINCREMENT, time_from Integer, time_to Integer, weekdays, discount, type, categories, temp, techcards_id)");
      db.query(q);
    } catch (error) {
      try {
        db.conn.close();
      } catch (error) {}

      var errorStr = JSON.stringify(error.message);
      logger("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u0441\u043A\u0438\u0434\u043E\u043A" + errorStr);
      alert("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u0441\u043A\u0438\u0434\u043E\u043A " + errorStr);
    }
  });
} // проверка промо


function checkPromo(token, subdomain, code) {
  return new Promise(function (resolve, reject) {
    // 13327953
    ieFetch({
      method: 'POST',
      url: "https://bridge.cwsystem.ru/engine/kassa/sertificate/backend/info?token=".concat(token, "&code=").concat(code, "&key=Njim99") // поменять адрес

    }).then(function (json) {
      // alert('ответ' + json)
      var res = JSON.parse(json);
      if (!res) reject('Пустой ответ в checkPromo');

      if (res.type === 'error') {
        // popup('Неверный промокод')
        reject(false);
        return;
      }

      if (res.type === 'success') {
        if (res.data.hasOwnProperty('sertificate_code')) {
          resolve({
            offreckoning: Number(res.data.amount),
            certificate: Number(res.data['sertificate_code'])
          });
          return;
        }

        try {
          var newArray = dbMethods.objExpandArray(res.data);
          var queryArr = '';
          newArray.forEach(function (item) {
            item.percent = Math.floor(100 - Number(item.percent)) / 100;

            if (queryArr) {
              queryArr = "".concat(queryArr, ",(0, 2400,'").concat(weekDay, "',").concat(item.percent, ",1,").concat(item.id, ")");
            } else {
              queryArr = "(0, 2400,'".concat(weekDay, "',").concat(item.percent, ",1,").concat(item.id, ")");
            }
          });
          db.query("INSERT into discounts (time_from,time_to,weekdays,discount,temp,techcards_id) values ".concat(queryArr));
          update.saleObg();
          resolve({
            percent: Number(res.data.percent)
          }); // dbMethods.setterDb('discounts', {time_from: 0, time_to: 24, weekdays:weekDay, discount: item.percent, temp: 1, techcards_id: item.id});
        } catch (error) {
          logger('Ошибка при проверке промо \n' + error.message + '\n');
          reject('Ошибка при проверке промо');
        }
      }
    })["catch"](function (e) {
      alert('Сетевая ошибка в checkPromo\n' + "".concat(JSON.stringify(e)));
      reject('Сетевая ошибка в checkPromo\n' + "".concat(JSON.stringify(e)));
    });
  });
} // проверить скидки


function getDiscounts(token, subdomain) {
  return new Promise(function (resolve, reject) {
    ieFetch({
      method: 'POST',
      url: api + "api/terminal/discounts/get?" + "token=".concat(token, "&subdomain=").concat(subdomain)
    }).then(function (json) {
      var res = JSON.parse(json);
      if (!res) reject('Пустой ответ в getDiscounts');

      if (res.type === 'error') {
        reject(res.data.msg);
        return;
      }

      if (res.type === 'success') {
        try {
          var message = "getDiscounts ".concat(JSON.stringify(res));
          logger(message);
          createDiscountsTable(res.data);
          resolve(res.data);
        } catch (error) {
          reject('Ошибка при получении скидок');
        }
      }
    })["catch"](function (e) {
      reject('Сетевая ошибка в getDiscounts\n' + "".concat(JSON.stringify(e)));
    });
  });
}

; // создать оффлайн токен

function generateToken() {
  var emplName = dbMethods.getterDb('settings', {
    variable: 'barista'
  }, 'value')[0];
  var emplId = dbMethods.getterDb('employees', _defineProperty({}, "employees_name", emplName), 'employees_id')[0];
  var unix = Math.floor(Date.now() / 1000);
  var key = sha512(unix + 'CWSystem' + emplId);
  return key;
} // Закрытие смены


function closeWorkDayClick() {
  preloader.preloader('body');

  if (useAtol === 1) {
    // если используется атол
    try {
      subfunc.qualitativeSynchronizer();
    } catch (e) {
      logger("\u043E\u0448\u0438\u0431\u043A\u0430 qualitativeSynchronizer ".concat(e.message));
    }

    try {
      devkkm.printWorcdayInfo();
      devkkm.closeWorkday();
    } catch (e) {
      alert('Не удалось закрыть смену на фискальнике, нажмите ок что бы продолжить закрытие на сервере(на фисклаьнике закрыто не будет) \n или закройте кассу');
      logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0441\u043C\u0435\u043D\u044B \u043D\u0430 \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u0438\u043A\u0435 ".concat(e.message));
    }
  }

  var token = dbMethods.getterDb('settings', {
    variable: 'tokenPoint'
  }, 'value')[0];
  var subdomain = dbMethods.getterDb('settings', {
    variable: 'subdomain'
  }, 'value')[0];
  var tokenWorkdayOnline = dbMethods.getterDb('settings', {
    variable: 'tokenWorkdayOnline'
  }, 'value')[0];
  var tokenWorkdayOffline = dbMethods.getterDb('settings', {
    variable: 'tokenWorkdayOffline'
  }, 'value')[0];
  var loaded = false;
  var unix = Math.floor(Date.now() / 1000);
  var resp = false;
  var revenue = null;

  try {
    resp = db.query("SELECT sum(orderSumFinal) as 'orderSum', count(id) as 'count', avg(orderSumFinal) as 'orderSumAvg' FROM orders WHERE status in(1,2,3) and idworkdayOffline = '".concat(idworkdayOffline, "'"));
  } catch (e) {
    db.conn.close();
    logger('Ошибка в closeWorkDayClick' + e.message);
  }

  if (resp) {
    revenue = resp[0].orderSum > 0 ? resp[0].orderSum : 0;
  }

  closeWorkDay(token, subdomain, tokenWorkdayOnline).then(function (res) {
    dbMethods.updateDb('workday', _defineProperty({}, "status", '2'), _defineProperty({}, "tokenWorkdayOnline", tokenWorkdayOnline));
    dbMethods.updateDb('workday', _defineProperty({}, "workDay_to", "".concat(unix)), _defineProperty({}, "tokenWorkdayOnline", tokenWorkdayOnline));
    dbMethods.updateDb('workday', _defineProperty({}, "revenue", "".concat(revenue)), _defineProperty({}, "tokenWorkdayOnline", tokenWorkdayOnline));
    loaded = true;
  })["catch"](function () {
    dbMethods.updateDb('workday', _defineProperty({}, "status", '1'), _defineProperty({}, "tokenWorkdayOffline", tokenWorkdayOffline));
    dbMethods.updateDb('workday', _defineProperty({}, "workDay_to", "".concat(unix)), _defineProperty({}, "tokenWorkdayOnline", tokenWorkdayOnline));
    dbMethods.updateDb('workday', _defineProperty({}, "revenue", "".concat(revenue)), _defineProperty({}, "tokenWorkdayOnline", tokenWorkdayOnline));
    loaded = false;
  })["finally"](function () {
    dbMethods.updateDb('settings', {
      value: null
    }, {
      variable: 'tokenWorkdayOnline'
    });
    dbMethods.updateDb('settings', {
      value: null
    }, {
      variable: 'tokenWorkdayOffline'
    });
    dbMethods.updateDb('settings', {
      value: null
    }, {
      variable: 'barista'
    });
    dbMethods.updateDb('settings', {
      value: null
    }, {
      variable: 'pincode'
    });
    dbMethods.updateDb('settings', {
      value: null
    }, {
      variable: 'employed'
    });
    dbMethods.removeFromDb('orders', {
      status: 0
    });

    try {
      var openOrder = dbMethods.getterDb('orders', {
        status: 0
      }, 'id')[0];
      dbMethods.removeFromDb('orderItem', _defineProperty({}, "idOrder", openOrder));
    } catch (error) {}

    initapp();

    if (loaded) {
      popup('Смена закрыта');
    } else {
      popup('Смена закрыта но не отправлена на сервер');
    }

    closeWorkDayPinBtn.classList.add('hidden');
    preloader.preloaderOff();

    if (useTerminal) {
      sbbank.reconciliation();
    }
  });
} // Открытие/продление/закрытие смены sync - запускается ли функция во время синхронизации


function workDay(sync) {
  var token = dbMethods.getterDb('settings', {
    variable: 'tokenPoint'
  }, 'value')[0];
  var subdomain = dbMethods.getterDb('settings', {
    variable: 'subdomain'
  }, 'value')[0];
  var tokenWorkdayOnline = dbMethods.getterDb('settings', {
    variable: 'tokenWorkdayOnline'
  }, 'value')[0];
  var emplName = dbMethods.getterDb('settings', {
    variable: 'barista'
  }, 'value')[0];
  var emplId = dbMethods.getterDb('employees', _defineProperty({}, "employees_name", emplName), 'employees_id')[0];
  var offlineWorkDayList = dbMethods.getterDb('workday', {
    status: 1
  }, 'id');
  tokenPoint = dbMethods.getterDb('settings', {
    variable: 'tokenPoint'
  }, 'value')[0];
  setting.globalVariables();

  function syncWorkDays() {
    try {
      var ans, q;

      try {
        q = "SELECT id, status, currentTable, fiscalPrint, time, date, unix, orderSum, promo, idClient, accumClientPoints, clientPoints, globalCashback, interimSum, offreckoning, amount, orderSumFinal, barista, idworkdayOffline, idworkdayOnline, email,  chtype, tokenPoint, hashcode, initiallyPoints, qrtoken, certificate, endPointsCert, nameClient FROM orders WHERE id = (SELECT MIN(id) from orders WHERE status in (-1 , 2))";
        ans = db.query(q);
      } catch (error) {
        db.conn.close();
        ans = undefined;
      } // в базе есть чеки со статусом -1 или 2


      if (ans) {
        setting.globalVariables();
        var e = ans[0];
        var newOrder = new Order(e.id, e.status, e.currentTable, e.fiscalPrint, e.time, e.date, e.unix, e.orderSum, e.promo, e.idClient, e.accumClientPoints, e.clientPoints, e.globalCashback, e.email, e.interimSum, e.offreckoning, e.amount, e.orderSumFinal, e.barista, e.idworkdayOffline, e.idworkdayOnline, e.chtype, e.tokenPoint, e.hashcode, e.initiallyPoints, e.qrtoken, e.certificate, e.endPointsCert, e.nameClient); // alert('Последний чек: \n' + JSON.stringify(newOrder))

        var param = new Transaction(newOrder); // создание объекта транзакции

        var onlineToken = dbMethods.getterDb('settings', {
          variable: 'tokenWorkdayOnline'
        }, 'value')[0]; // онлайн токен

        var key = newOrder.idworkdayOffline; // alert(onlineToken + `\n ${`${onlineToken}` === 'null'}`)

        if ("".concat(onlineToken) === 'null') {
          // если это вызов функции при открытии смены
          // alert('Проверка айди смен: \n ' +  oldShift  + '\n' + newOrder.idworkdayOffline + '\n' + `${`${oldShift}` !== `${newOrder.idworkdayOffline}` && oldShift != undefined}`)
          if ("".concat(oldShift) !== "".concat(newOrder.idworkdayOffline) || typeof oldShift === 'undefined') {
            // новая для функции смена
            // alert('новая для функции смена')
            if (oldShift) {
              // alert('Закрытие предидущей смены: ' + oldShift)
              closeWorkDay(tokenPoint, subdomain, oldShift) // закрыть смену предидущей итерации
              .then(function () {
                dbMethods.updateDb('workday', _defineProperty({}, "status", '2'), _defineProperty({}, "tokenWorkdayOnline", oldShift)); // alert(`test ${oldShift}`)

                openWorkDay(tokenPoint, subdomain, emplId, newOrder.idworkdayOffline) // открытие следующей смены
                .then(function (res) {
                  var prolongWorkday = res.shift; // смена продлена, это ошибка

                  if (prolongWorkday) {
                    // alert("Ошибка синхронизации, смена уже была открыта: " + newOrder.idworkdayOffline)
                    return;
                  }

                  dbMethods.updateDb('workday', _defineProperty({}, "tokenWorkdayOnline", newOrder.idworkdayOffline), _defineProperty({}, "tokenWorkdayOffline", newOrder.idworkdayOffline)); // обновляем токен в таблице смен
                  // alert(`Смена открыта ${newOrder.idworkdayOffline} , транзакция: ${newOrder.id}`)

                  return new Promise(function (resolve, reject) {
                    ieFetch({
                      method: 'POST',
                      url: "https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain, "&point=").concat(pointCashbox),
                      headerType: "Content-Type",
                      type: "application/json",
                      send: "".concat(JSON.stringify(param))
                    }).then(function (json) {
                      var ans = JSON.parse(json);
                      resolve(ans); // alert(`Ответ с сервера: транзакция: ${newOrder.id}` + JSON.stringify(ans))

                      if (ans.type === 'success') {
                        var _dbMethods$updateDb17;

                        // если все удалось, вызов следующей итерации
                        dbMethods.updateDb('orders', {
                          status: 3
                        }, {
                          id: newOrder.id
                        }); // сменить статус текущего чека
                        //новое в 1.2:

                        dbMethods.updateDb('orders', (_dbMethods$updateDb17 = {}, _defineProperty(_dbMethods$updateDb17, "idworkdayOnline", newOrder.idworkdayOffline), _defineProperty(_dbMethods$updateDb17, "idworkdayOffline", newOrder.idworkdayOffline), _dbMethods$updateDb17), {
                          id: newOrder.id
                        }); // обновить токен смены по синхонизации

                        oldShift = newOrder.idworkdayOffline; // обновить айди смены по текущему чеку

                        setTimeout(syncWorkDays, 500); // вызов следующей итерации
                      }

                      return;
                    })["catch"](function (e) {
                      setTimeout(syncWorkDays, 4000); // повторный вызов текущей итерации
                    });
                  });
                })["catch"](function (e) {// alert(`Ошибка при синхронизации, ошибка открытия смены: ${newOrder.idworkdayOffline} \n`+e.message);
                });
              })["catch"](function (e) {
                logger("Ошибка закрытия смены при синхронизации: \n" + e.message);
                alert("Ошибка закрытия смены при синхронизации: \n" + e.message);
              });
            }

            openWorkDay(tokenPoint, subdomain, emplId, newOrder.idworkdayOffline) // первая транзакция в смене
            .then(function (res) {
              var prolongWorkday = res.shift; // продлилась не закрытая онлайн смена

              if (prolongWorkday) {
                oldShift = prolongWorkday;
                newOrder.idworkdayOffline = prolongWorkday;
                newOrder.idworkdayOnline = prolongWorkday;

                var _param = new Transaction(newOrder); // создание объекта транзакции


                return new Promise(function (resolve, reject) {
                  ieFetch({
                    method: 'POST',
                    url: "https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain, "&point=").concat(pointCashbox),
                    headerType: "Content-Type",
                    type: "application/json",
                    send: "".concat(JSON.stringify(_param))
                  }).then(function (json) {
                    var ans = JSON.parse(json); // alert(`транзакция: ${newOrder.id}` + `ответ: ${JSON.stringify(ans)}`)
                    // вызываем себя же

                    if (ans.type === 'success') {
                      // если все удалось, вызов следующей итерации
                      popup("\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F \u2116:".concat(newOrder.id, " \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430"));

                      var _q;

                      if (ordersArr[0].status == 2) {
                        _q = "UPDATE orders SET status = 3 WHERE id = ".concat(Number(newOrder.id));

                        try {
                          db.query(_q);
                        } catch (e) {
                          db.conn.close();
                          setTimeout(syncWorkDays, 4000);
                        }
                      } else if (ordersArr[0].status == -2) {
                        _q = "UPDATE orders SET status = 4 WHERE id = ".concat(Number(newOrder.id));

                        try {
                          db.query(_q);
                        } catch (e) {
                          db.conn.close();
                          setTimeout(syncWorkDays, 4000);
                        }
                      }

                      oldShift = newOrder.idworkdayOffline; // обновить айди смены по текущему чеку

                      setTimeout(syncWorkDays, 500); // вызов следующей итерации
                    }

                    return;
                  })["catch"](function (e) {
                    setTimeout(syncWorkDays, 4000); // повторный вызов текущей итерации
                  });
                });
              }

              newOrder.idworkdayOnline = newOrder.idworkdayOffline;
              dbMethods.updateDb('workday', _defineProperty({}, "tokenWorkdayOnline", newOrder.idworkdayOffline), _defineProperty({}, "tokenWorkdayOffline", newOrder.idworkdayOffline)); // обновляем токен в таблице смен
              // alert(`Смена открыта ${newOrder.idworkdayOffline} , транзакция: ${newOrder.id}`+ JSON.stringify(param))

              return new Promise(function (resolve, reject) {
                ieFetch({
                  method: 'POST',
                  url: "https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain, "&point=").concat(pointCashbox),
                  headerType: "Content-Type",
                  type: "application/json",
                  send: "".concat(JSON.stringify(param))
                }).then(function (json) {
                  var ans = JSON.parse(json);
                  resolve(ans); // alert(`транзакция: ${newOrder.id}` + `ответ: ${JSON.stringify(ans)}`)
                  // вызываем себя же

                  if (ans.type === 'success') {
                    var _dbMethods$updateDb20;

                    // если все удалось, вызов следующей итерации
                    dbMethods.updateDb('orders', {
                      status: 3
                    }, {
                      id: newOrder.id
                    }); // сменить статус текущего чека
                    //новое в 1.2:

                    dbMethods.updateDb('orders', (_dbMethods$updateDb20 = {}, _defineProperty(_dbMethods$updateDb20, "idworkdayOnline", newOrder.idworkdayOffline), _defineProperty(_dbMethods$updateDb20, "idworkdayOffline", newOrder.idworkdayOffline), _dbMethods$updateDb20), {
                      id: newOrder.id
                    }); // обновить токен смены по синхонизации

                    oldShift = newOrder.idworkdayOffline; // обновить айди обрабатываемой смены по текущему чеку

                    setTimeout(syncWorkDays, 500); // вызов следующей итерации
                  }

                  return;
                })["catch"](function (e) {
                  setTimeout(syncWorkDays, 4000); // повторный вызов текущей итерации
                });
              });
            })["catch"](function (e) {
              //  открыта онлайн смена грузим транзакции
              var prolongWorkday = newOrder.idworkdayOffline; // продлилась не закрытая онлайн смена

              if (prolongWorkday) {
                oldShift = prolongWorkday;
                newOrder.idworkdayOffline = prolongWorkday;
                newOrder.idworkdayOnline = prolongWorkday;

                var _param2 = new Transaction(newOrder); // создание объекта транзакции


                return new Promise(function (resolve, reject) {
                  ieFetch({
                    method: 'POST',
                    url: "https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain, "&point=").concat(pointCashbox),
                    headerType: "Content-Type",
                    type: "application/json",
                    send: "".concat(JSON.stringify(_param2))
                  }).then(function (json) {
                    var ans = JSON.parse(json); // alert(`транзакция: ${newOrder.id}` + `ответ: ${JSON.stringify(ans)}`)
                    // вызываем себя же

                    if (ans.type === 'success') {
                      // если все удалось, вызов следующей итерации
                      popup("\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F \u2116:".concat(newOrder.id, " \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430"));

                      var _q2;

                      if (ordersArr[0].status == 2) {
                        _q2 = "UPDATE orders SET status = 3 WHERE id = ".concat(Number(newOrder.id));

                        try {
                          db.query(_q2);
                        } catch (e) {
                          db.conn.close();
                          setTimeout(syncWorkDays, 4000);
                        }
                      } else if (ordersArr[0].status == -2) {
                        _q2 = "UPDATE orders SET status = 4 WHERE id = ".concat(Number(newOrder.id));

                        try {
                          db.query(_q2);
                        } catch (e) {
                          db.conn.close();
                          setTimeout(syncWorkDays, 4000);
                        }
                      }

                      oldShift = newOrder.idworkdayOffline; // обновить айди смены по текущему чеку

                      setTimeout(syncWorkDays, 500); // вызов следующей итерации
                    }

                    return;
                  })["catch"](function (e) {
                    setTimeout(syncWorkDays, 4000); // повторный вызов текущей итерации
                  });
                });
              }

              newOrder.idworkdayOnline = newOrder.idworkdayOffline;
            });
            return;
          }

          if ("".concat(oldShift) === "".concat(newOrder.idworkdayOffline)) {
            // повторная итерация в одной с предидущим чеком смене
            return new Promise(function (resolve, reject) {
              ieFetch({
                method: 'POST',
                url: "https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain, "&point=").concat(pointCashbox),
                headerType: "Content-Type",
                type: "application/json",
                send: "".concat(JSON.stringify(param))
              }).then(function (json) {
                var ans = JSON.parse(json);
                resolve(ans); // alert(`транзакция: ${newOrder.id}` + `ответ: ${ans}`)
                // вызываем себя же

                if (ans.type === 'success') {
                  var _dbMethods$updateDb21;

                  // если все удалось, вызов следующей итерации
                  popup("\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F: ".concat(newOrder.id, " \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430"));
                  dbMethods.updateDb('orders', {
                    status: 3
                  }, {
                    id: newOrder.id
                  }); // сменить статус текущего чека
                  //новое в 1.2:

                  dbMethods.updateDb('orders', (_dbMethods$updateDb21 = {}, _defineProperty(_dbMethods$updateDb21, "idworkdayOnline", newOrder.idworkdayOffline), _defineProperty(_dbMethods$updateDb21, "idworkdayOffline", newOrder.idworkdayOffline), _dbMethods$updateDb21), {
                    id: newOrder.id
                  }); // обновить токен смены по синхонизации

                  oldShift = newOrder.idworkdayOffline; // обновить айди смены по текущему чеку

                  setTimeout(syncWorkDays, 500); // вызов следующей итерации
                }

                return;
              })["catch"](function (e) {
                setTimeout(syncWorkDays, 4000); // повторный вызов текущей итерации
              });
            });
          } // alert('ТРАНЗАКЦИЯ'+ JSON.stringify(param))


          return new Promise(function (resolve, reject) {
            ieFetch({
              method: 'POST',
              url: "https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain, "&point=").concat(pointCashbox),
              headerType: "Content-Type",
              type: "application/json",
              send: JSON.stringify(param)
            }).then(function (json) {
              // alert('ответ: ' + json)
              var ans = JSON.parse(json);

              if (ans.type === 'success') {
                var _dbMethods$updateDb22;

                // вызываем себя же
                dbMethods.updateDb('orders', {
                  status: 3
                }, {
                  id: newOrder.id
                }); //новое в 1.2:

                dbMethods.updateDb('orders', (_dbMethods$updateDb22 = {}, _defineProperty(_dbMethods$updateDb22, "idworkdayOnline", newOrder.idworkdayOffline), _defineProperty(_dbMethods$updateDb22, "idworkdayOffline", newOrder.idworkdayOffline), _dbMethods$updateDb22), {
                  id: newOrder.id
                }); // обновить токен смены по синхонизации

                if ("".concat(oldShift) !== "".concat(newOrder.idworkdayOffline) && typeof oldShift === 'undefined') {} else {
                  oldShift = newOrder.idworkdayOffline;
                  syncWorkDays();
                  return;
                }
              }

              return;
            })["catch"](function (e) {
              // alert('ошибка при синхронизации, ошибка связи')
              logger('ошибка при синхронизации, ошибка связи');
              setTimeout(syncWorkDays, 4000);
              return;
            });
          });
        } // alert('ТРАНЗАКЦИЯ'+ JSON.stringify(param))


        return new Promise(function (resolve, reject) {
          ieFetch({
            method: 'POST',
            url: "https://cwflow.apiloc.ru/api/integrations/transaction/create?token=".concat(tokenPoint, "&subdomain=").concat(subdomain, "&point=").concat(pointCashbox),
            headerType: "Content-Type",
            type: "application/json",
            send: JSON.stringify(param)
          }).then(function (json) {
            // alert('ответ: ' + json)
            var ans = JSON.parse(json);

            if (ans.type === 'success') {
              var _dbMethods$updateDb23;

              // вызываем себя же
              dbMethods.updateDb('orders', {
                status: 3
              }, {
                id: newOrder.id
              }); //новое в 1.2:

              dbMethods.updateDb('orders', (_dbMethods$updateDb23 = {}, _defineProperty(_dbMethods$updateDb23, "idworkdayOnline", newOrder.idworkdayOffline), _defineProperty(_dbMethods$updateDb23, "idworkdayOffline", newOrder.idworkdayOffline), _dbMethods$updateDb23), {
                id: newOrder.id
              }); // обновить токен смены по синхонизации

              if ("".concat(oldShift) !== "".concat(newOrder.idworkdayOffline) && typeof oldShift === 'undefined') {} else {
                oldShift = newOrder.idworkdayOffline;
                syncWorkDays();
                return;
              }
            }

            return;
          })["catch"](function (e) {
            logger('Ошибка связи в синхронизации: 650 строка');
            setTimeout(syncWorkDays, 4000);
            return;
          });
        });
      }

      if ("".concat(dbMethods.getterDb('settings', {
        variable: 'tokenWorkdayOnline'
      }, 'value')[0]) === 'null') {
        // если итерации были запущены  до октрытия смены
        // alert('закрыть последнию смену и открыть новую')
        oldShift = dbMethods.getterDb('workday', {
          status: 1
        }, 'tokenWorkdayOnline'); // alert(tokenPoint +'\n'+subdomain +'\n'+ oldShift)

        closeWorkDay(tokenPoint, subdomain, oldShift) // закрыть смену предидущей итерации
        .then(function () {
          dbMethods.updateDb('workday', _defineProperty({}, "status", '2'), _defineProperty({}, "tokenWorkdayOnline", oldShift));
          workDay(true);
        })["catch"](function (e) {
          // alert("Ошибка закрытия смены при синхронизации: \n"+JSON.stringify(e));
          logger("Ошибка закрытия смены при синхронизации: \n" + JSON.stringify(e));
        });
      } else {
        workDay(true);
      }

      return true;
    } catch (e) {
      // alert("Ошибка отправки чеков на сервер \n"+JSON.stringify(e.message));
      logger("Ошибка отправки чеков на сервер \n" + JSON.stringify(e.message));
      return false;
    }
  }

  if (offlineWorkDayList.length) {
    if (!sync && onlineSystem) {
      popup('Синхронизация смен, ожидайте...', false, 'preloader');
      syncWorkDays();
      return;
    }
  } // висячая функция сеньора коммитов


  setting.globalVariables();
  postman.serverOrder();
  postman.loyalityOrder();
  postman.certificateOrder();
  postman.serverOrderCancel();

  if ("".concat(tokenWorkdayOnline) === "null") {
    // нет онлайн токена
    var tokenWorkdayOffline = dbMethods.getterDb('settings', {
      variable: 'tokenWorkdayOffline'
    }, 'value')[0]; // есть ли оффлайн токен

    var prolong = true;

    if ("".concat(tokenWorkdayOffline) === "null") {
      // создали оффлайн токен(нет смен со статусом 0)
      prolong = false;
      tokenWorkdayOffline = generateToken();
      dbMethods.updateDb('settings', {
        value: tokenWorkdayOffline
      }, {
        variable: 'tokenWorkdayOffline'
      });
      var unix = Math.floor(Date.now() / 1000);
      dbMethods.setterDb('workday', {
        status: 0,
        tokenWorkdayOnline: null,
        tokenWorkdayOffline: tokenWorkdayOffline,
        workDay_from: unix,
        workDay_to: null,
        revenue: 0,
        hours: 0,
        salary: 0,
        premium: 0,
        dateDay: dateStrGlobal
      });
    }

    if (!onlineSystem) {
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
      menuApp.renderList('category', menuApp.load('menuDb', null));
      preloader.preloader('body');
      logger("\u0417\u0430\u043F\u0443\u0441\u043A \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439");
      setting.globalVariables();
      update.idOrder();
      update.productArr();
      update.saleObg(); //  alert(`Обновились следующие переменные:
      //  ${JSON.stringify(productArr)}`)
      //  ${JSON.stringify(idOrderGlobal)}
      //  ${JSON.stringify(ordersArr)}

      orderCalc.renderReceipt();
      if (prolong) return popup('Смена продлена автономно');
      popup('Сменя открыта автономно');
      return;
    }

    openWorkDay(token, subdomain, emplId, tokenWorkdayOffline).then(function (result) {
      tokenWorkdayOnline = result.shift; // если он есть продолжена онлайн смена с сервера

      dbMethods.updateDb('workday', _defineProperty({}, "tokenWorkdayOnline", tokenWorkdayOffline), _defineProperty({}, "tokenWorkdayOffline", tokenWorkdayOffline)); // онлайн токен приравнивается к оффлайн токену

      dbMethods.updateDb('settings', {
        value: tokenWorkdayOffline
      }, {
        variable: 'tokenWorkdayOnline'
      });

      if (tokenWorkdayOnline) {
        var _dbMethods$updateDb28;

        // но если в ответе был онлайн токен, оффлайн и онлайн перепишутся на полученный из запроса(предидущая смена на сервере не была закрыта)
        dbMethods.updateDb('workday', (_dbMethods$updateDb28 = {}, _defineProperty(_dbMethods$updateDb28, "tokenWorkdayOnline", tokenWorkdayOnline), _defineProperty(_dbMethods$updateDb28, "tokenWorkdayOffline", tokenWorkdayOnline), _dbMethods$updateDb28), _defineProperty({}, "tokenWorkdayOffline", tokenWorkdayOffline));
        dbMethods.updateDb('settings', {
          value: tokenWorkdayOnline
        }, {
          variable: 'tokenWorkdayOffline'
        });
        dbMethods.updateDb('settings', {
          value: tokenWorkdayOnline
        }, {
          variable: 'tokenWorkdayOnline'
        });
      } else {
        // новая смена - архивация бд
        dbWork.archiveDb(); // updateTerminal.updateTerminalInit();
      }

      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
      menuApp.renderList('category', menuApp.load('menuDb', null));
      return;
    })["catch"](function () {
      // онлайн токен не создан смена автономна
      openWorkDay(token, subdomain, emplId, generateToken()) // проверить нет ли открытой смены на сервере
      .then(function (result) {
        tokenWorkdayOnline = result.shift;

        if (tokenWorkdayOnline) {
          // запишет онлайн токен если это продление смены открытой на сервере
          dbMethods.updateDb('settings', {
            value: tokenWorkdayOnline
          }, {
            variable: 'tokenWorkdayOffline'
          });
          dbMethods.updateDb('settings', {
            value: tokenWorkdayOnline
          }, {
            variable: 'tokenWorkdayOnline'
          });
        } else {
          // архивация дб
          dbWork.archiveDb(); // updateTerminal.updateTerminalInit();
        }

        setting.globalVariables();
        update.idOrder();
        update.productArr();
        update.saleObg();
        getDiscounts(token, subdomain)["catch"](function () {
          // получение скидок и обновление дб
          popup('Ошибка при обновлении скидок');
        });
        menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
        menuApp.renderList('category', menuApp.load('menuDb', null));
        return;
      })["catch"](function (error) {
        // Сетевая ошибка при открытии смены
        try {
          menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
          menuApp.renderList('category', menuApp.load('menuDb', null));
        } catch (error) {
          logger('Ошибка при открытии смены в workDay' + error.message);
          alert('Ошибка при открытии смены в workDay' + error.message);
        }

        preloader.preloaderOff();
        popup('Смена продлена автономно');
      })["finally"](function () {
        preloader.preloaderOff();
        setting.globalVariables();
        update.idOrder();
        update.productArr();
        update.saleObg();
        popup('Смена продлена');
        orderCalc.renderReceipt();
      });

      try {
        menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
        menuApp.renderList('category', menuApp.load('menuDb', null));
      } catch (error) {
        logger('Ошибка при открытии смены в workDay' + error.message);
        alert('Ошибка при открытии смены в workDay' + error.message);
      }

      preloader.preloaderOff();
      if (prolong) return popup('Смена продлена автономно');
      popup('Сменя открыта автономно');
    })["finally"](function () {
      preloader.preloaderOff();
      setting.globalVariables();
      update.idOrder();
      update.productArr();
      update.saleObg();
      orderCalc.renderReceipt();
      getDiscounts(token, subdomain).then(function () {})["catch"](function () {
        popup('Ошибка при обновлении скидок');
      });
    });
    return;
  }

  if (!onlineSystem) {
    menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
    menuApp.renderList('category', menuApp.load('menuDb', null));
    preloader.preloader('body');
    popup('Смена продлена автономно');
    setting.globalVariables();
    update.idOrder();
    update.productArr();
    update.saleObg();
    orderCalc.renderReceipt();
    return;
  }

  openWorkDay(token, subdomain, emplId, generateToken()) // проверить нет ли открытой смены на сервере
  .then(function (result) {
    tokenWorkdayOnline = result.shift;

    if (tokenWorkdayOnline) {
      // запишет онлайн токен если это продление смены открытой на сервере
      dbMethods.updateDb('settings', {
        value: tokenWorkdayOnline
      }, {
        variable: 'tokenWorkdayOffline'
      });
      dbMethods.updateDb('settings', {
        value: tokenWorkdayOnline
      }, {
        variable: 'tokenWorkdayOnline'
      });
    } else {
      dbWork.archiveDb();
    }

    setting.globalVariables();
    update.idOrder();
    update.productArr();
    update.saleObg();
    getDiscounts(token, subdomain)["catch"](function () {
      // получение скидок и обновление дб
      popup('Ошибка при обновлении скидок');
    });
    menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
    menuApp.renderList('category', menuApp.load('menuDb', null));
    return;
  })["catch"](function (error) {
    // Сетевая ошибка при открытии смены
    try {
      menuApp.renderList('content', menuApp.loadById('menuDb', popularArray));
      menuApp.renderList('category', menuApp.load('menuDb', null));
    } catch (error) {
      alert('Ошибка в openWorkDay \n' + error.message);
      logger('Ошибка в openWorkDay \n' + error.message);
    }

    preloader.preloaderOff();
    popup('Смена продлена автономно');
  })["finally"](function () {
    preloader.preloaderOff();
    setting.globalVariables();
    update.idOrder();
    update.productArr();
    update.saleObg();
    popup('Смена продлена');
    orderCalc.renderReceipt();
  });
  return;
} // опредление онлайн/оффлайн через запрос


function checkOnlineStatus() {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://bridge.cwsystem.ru/dbtest', true);
    xhr.send();
    xhr.addEventListener('readystatechange', function (e) {
      if (xhr.readyState !== 4) return;

      if (xhr.status !== 0) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.statusText);
      }
    });
  });
} // оповещение о соединении


function updateOnlineStatus(online) {
  if (online != onlineSystem) {
    onlineSystem = online;
    var updateOnline = document.querySelector('.header__btn-update-descr');

    if (onlineSystem) {
      popup('Соединение с интернетом восстановлено');
      updateOnline.style.opacity = '0';

      if ("".concat(idworkdayOnline) === 'null') {
        dbMethods.updateDb('settings', {
          value: null
        }, {
          variable: 'barista'
        });
        dbMethods.updateDb('settings', {
          value: null
        }, {
          variable: 'pincode'
        });
        dbMethods.updateDb('settings', {
          value: null
        }, {
          variable: 'employed'
        });
        initapp();
      }

      setTimeout(function () {
        updateOnline.textContent = 'Online';
        updateOnline.style.opacity = '1';
        updateOnline.classList.remove('header__btn-update-descr_offline');
      }, 300);
      return;
    }

    popup('Соединение с интернетом прервано');
    updateOnline.style.opacity = '0';
    setTimeout(function () {
      updateOnline.textContent = 'Offline';
      updateOnline.style.opacity = '1';
      updateOnline.classList.add('header__btn-update-descr_offline');
    }, 300);
  }
} // запрос для проверки онлайна


setInterval(function () {
  var todayGlobal = new Date();
  dateStrGlobal = todayGlobal.getFullYear() + '-' + AddLeftG(todayGlobal.getMonth() + 1, '0', 2) + '-' + AddLeftG(todayGlobal.getDate(), '0', 2);
  checkOnlineStatus().then(function (e) {
    if (e == 1) {
      updateOnlineStatus(true);
    } else {
      popup('соединение с сервером потерено');
      preloader.preloaderOff();
      updateOnlineStatus(false);
    }
  })["catch"](function () {
    preloader.preloaderOff();
    updateOnlineStatus(false);
  });
}, 7500);

if (!onlineSystem) {
  var promocodeWrap = document.querySelector('.header__card_promocode');
  promocodeWrap.classList.add('imperfection');
} // qualitativeSynchronizer


setInterval(function () {
  if (useAtol === 1) {
    try {
      subfunc.qualitativeSynchronizer(true);
    } catch (e) {
      logger("\u043E\u0448\u0438\u0431\u043A\u0430 qualitativeSynchronizer ".concat(e.message));
    }
  }
}, 3612345);