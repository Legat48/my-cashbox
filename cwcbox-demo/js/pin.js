"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var pincode = "";
var hashcode = ""; // функционал окна с пинкодом

function pinManual() {
  var pinN = document.querySelectorAll('.pin__item-value');
  var btnnumberN = document.querySelectorAll('.pin__btn_number'); // создает нодлист

  var btnnumber = Array.prototype.slice.call(btnnumberN); // делает привычный массив из нодлиста

  var pin = Array.prototype.slice.call(pinN);
  var btnReset = document.querySelector('.pin__btn_reset');
  var btnDel = document.querySelector('.pin__btn_del'); // каждый запуск стирает из сеттинга баристу чтобы ввели пин

  dbMethods.updateDb('settings', {
    value: null
  }, {
    variable: 'barista'
  });
  dbMethods.updateDb('settings', {
    value: null
  }, {
    variable: 'employed'
  });
  initapp(); // без реиспользования сделаем(ломает)

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://bridge.cwsystem.ru/dbtest', true);
  xhr.send();
  xhr.addEventListener('readystatechange', function (e) {
    if (xhr.readyState !== 4) return;

    if (xhr.status !== 0) {
      if (xhr.responseText == 1) {
        updateOnlineStatus(true);
      } else {
        updateOnlineStatus(false);
      }

      preloader.preloaderOff();
    } else {
      preloader.preloaderOff();
      updateOnlineStatus(false);
    }
  });
  var pinValue = []; // проверка пинкода

  function chekpincode(value) {
    preloader.preloader('body');

    try {
      var localPin = dbMethods.getterDb('settings', {
        variable: 'pincode'
      }, 'value')[0]; // записан ли работник в сеттингс

      if ("".concat(localPin) === "null") {
        // код не вводили
        if (!dbMethods.getterDb('employees', _defineProperty({}, "pin_code", value), 'employees_name').length) {
          preloader.preloaderOff();
          alert('Неверный ПИН-код');
          return false;
        }

        dbMethods.updateDb('settings', {
          value: MD5(value)
        }, {
          variable: 'pincode'
        });
      } else {
        if ("".concat(MD5(value)) !== "".concat(localPin)) {
          // код не совпал с тем что уже ввели
          preloader.preloaderOff();
          alert('Смена уже была открыта другим пользователем');
          closeWorkDayPinBtn.classList.remove('hidden');
          return false;
        }
      }

      var barista = dbMethods.getterDb('employees', _defineProperty({}, "pin_code", value), 'employees_name')[0];
      var partner = dbMethods.getterDb('employees', _defineProperty({}, "pin_code", value), 'partner_id')[0];
      parntnerId = partner; // айди партнера

      if (parntnerId != 1) {
        supplies.style.display = 'none';
        reloadMenu.style.display = 'block';
      }

      var url = "http://bridge.cwsystem.ru/engine/?class=API&method=getkeyfororder&key=nokey&p=".concat(pointCashbox); // ключ для заказа поставки

      ieFetch({
        method: 'POST',
        url: url
      }).then(function (json) {
        var res = JSON.parse(json);
        suppliesKey = res.supply_key;
        logger('Получен ключ поставки:' + JSON.stringify(res));
      })["catch"](function (e) {
        logger('Ошибка получения ключа поставки' + e.message + 'запрос:' + url);
      });
      var employed = "".concat(dbMethods.getterDb('employees', _defineProperty({}, "pin_code", value), 'employed')[0]) === 'true' ? 1 : 0;
      dbMethods.updateDb('settings', {
        value: barista
      }, {
        variable: 'barista'
      });
      dbMethods.updateDb('settings', {
        value: employed
      }, {
        variable: 'employed'
      });
      dbMethods.updateDb('settings', {
        value: weekDay
      }, {
        variable: 'weekDay'
      });
      return true;
    } catch (error) {
      throw "\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u041F\u0418\u041D-\u043A\u043E\u0434\u0430";
    }
  }

  btnReset.addEventListener('click', function () {
    pin.forEach(function (e) {
      e.textContent = '✱';
      pinValue = [];
    });
  });
  btnDel.addEventListener('click', function () {
    pin.forEach(function (e) {
      e.textContent = '✱';
    });
    pinValue = pinValue.slice(0, pinValue.length - 1);

    var _iterator = _createForOfIteratorHelper(pinValue),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var i = _step.value;

        var _iterator2 = _createForOfIteratorHelper(pin),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var e = _step2.value;

            if (e.textContent === '✱') {
              e.textContent = i;
              break;
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });

  function checkPass() {
    if (pinValue.length === 6) {
      var promise = new Promise(function (resolve) {
        resolve(chekpincode(pinValue.join('')));
      });
      promise.then(function (result) {
        if (result) {
          oldShift = undefined;
          workDay();
        }

        initapp();
      })["catch"](function (error) {
        preloader.preloaderOff();
        alert('Ошибка в pinManual>checkPass' + JSON.stringify(error));
      });
      pin.forEach(function (e) {
        e.textContent = '✱';
        pinValue = [];
      });
    }
  }

  btnnumber.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = Number(btn.textContent);

      var _iterator3 = _createForOfIteratorHelper(pin),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var e = _step3.value;

          if (e.textContent === '✱') {
            e.textContent = value;
            pinValue.push(value);
            pincode = pinValue.join('');
            break;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      checkPass();
    });
  });
}

pinManual();