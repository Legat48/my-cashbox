"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// неизбежный рудимент. Пользоваться не стоит, менять в коде старом-слишном долго
// методы универсального обращения в базу данных
var dbMethods = new function () {
  this.toNull = function (value) {
    return value = value === null ? "is ".concat(value) : "= '".concat(value, "'");
  };

  this.getterDb = function (table, param, target, limit) {
    var q,
        resp,
        data = [],
        j = 0,
        paramStr = '',
        targetStr = target ? '' : 'id',
        getStr = target ? target : 'id'; // собираем строку параметров

    for (var _i = 0, _Object$entries = Object.entries(param); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      j += 1;

      if ("".concat(key) === 'pin_code') {
        // шифрование пинкода
        value = MD5(value);
      }

      paramStr += j > 1 ? " AND ".concat(key, " ").concat(this.toNull(value)) : "".concat(key, " ").concat(this.toNull(value));
    } // костыль для вертикальной таблицы
    // пока она одна будет только для settings


    paramStr = table === 'settings' ? "variable = '".concat(param.variable, "'") : paramStr; // создаем селектор чтобы найти нужную строку

    var targetArray = target ? target.split(',') : '';

    if (Array.isArray(targetArray) && targetArray.length > 0) {
      targetArray.forEach(function (targetItem, targetIndex) {
        targetStr += targetIndex > 0 ? ", ".concat(targetItem) : "".concat(targetItem);
      });
    }

    if (limit) paramStr += " LIMIT ".concat(limit); // собранный запрос

    q = "SELECT ".concat(targetStr, " FROM ").concat(table, " WHERE ").concat(paramStr);

    try {
      resp = db.query(q); // сбор массива по параметру target если его нет вернет массив обьектов
      // где свойства это столбцы найденых строк

      for (var _i2 = 0, _Object$entries2 = Object.entries(resp); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            _key = _Object$entries2$_i[0],
            _value = _Object$entries2$_i[1];

        if (_value.hasOwnProperty("".concat(getStr))) {
          data.push(_value["".concat(getStr)]);
          continue;
        }

        data.push(_value);
      }

      return data;
    } catch (error) {
      try {
        db.conn.close();
      } catch (error) {}

      return [];
    }
  };

  this.updateDb = function (table, param, target) {
    var q,
        paramStr = '',
        targetStr = '',
        j = 0,
        k = 0;

    for (var _i3 = 0, _Object$entries3 = Object.entries(param); _i3 < _Object$entries3.length; _i3++) {
      var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          key = _Object$entries3$_i[0],
          value = _Object$entries3$_i[1];

      if ("".concat(key) === 'pin_code') {
        // шифрование пинкода
        value = MD5(value);
      }

      value = value === null ? "".concat(value) : "'".concat(value, "'");
      j += 1;
      paramStr += j > 1 ? " , ".concat(key, " = ").concat(value) : "".concat(key, " = ").concat(value);
    }

    for (var _i4 = 0, _Object$entries4 = Object.entries(target); _i4 < _Object$entries4.length; _i4++) {
      var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
          _key2 = _Object$entries4$_i[0],
          _value2 = _Object$entries4$_i[1];

      k += 1;
      targetStr += k > 1 ? " AND ".concat(_key2, " = '").concat(_value2, "'") : "".concat(_key2, " = '").concat(_value2, "'");
    }

    q = "UPDATE ".concat(table, " SET ").concat(paramStr, " WHERE ").concat(targetStr);

    try {
      db.query(q);
    } catch (error) {
      logger('Ошибка во время обновления строки ' + q);
    }
  };

  this.setterDb = function (table, param, orient) {
    var q,
        headers = "",
        values = "",
        newParam = param,
        strokeId; // таблица c вертикальной ориентацией

    if (orient && orient === 'vertical') {
      for (var _i5 = 0, _Object$entries5 = Object.entries(param); _i5 < _Object$entries5.length; _i5++) {
        var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i5], 2),
            key = _Object$entries5$_i[0],
            value = _Object$entries5$_i[1];

        if (table === 'settings') {
          newParam = value === null ? {
            variable: key
          } : {
            variable: key,
            value: value
          };
        }

        dbMethods.setterDb(table, newParam);
      }

      return true;
    }

    strokeId = dbMethods.getterDb(table, param);

    if (strokeId.length > 0) {
      strokeId.forEach(function (e) {
        dbMethods.updateDb(table, param, {
          id: e
        });
      });
      return;
    } // строки нет и мы добавляем ее в таблицу
    // собираем запрос на создание строки


    var i = 0;

    for (var _i6 = 0, _Object$entries6 = Object.entries(param); _i6 < _Object$entries6.length; _i6++) {
      var _Object$entries6$_i = _slicedToArray(_Object$entries6[_i6], 2),
          _key3 = _Object$entries6$_i[0],
          _value3 = _Object$entries6$_i[1];

      if (_value3 === null) {
        continue;
      }

      if ("".concat(_key3) === 'pin_code') {
        // сохранение пинкода
        _value3 = MD5(_value3);
      }

      i += 1;
      headers += i > 1 ? ", ".concat(_key3) : "".concat(_key3);
      values += i > 1 ? ", '".concat(_value3, "'") : "'".concat(_value3, "'");
    } // отсюда идут специфичные таблицы где нужно заполнить обязательные поля с дефолтным значением не равным NULL
    // дописываем их в запрос


    if (table === 'orderItem') {
      if (!headers.includes('amount')) {
        headers += ", amount";
        values += ", '1'";
      }

      if (!headers.includes('sale')) {
        headers += ", sale";
        values += ", '1'";
      }

      if (!headers.includes('priceFinal') && param.hasOwnProperty('price')) {
        headers += ", priceFinal";
        values += ", '".concat(param.price, "'");
      }
    }

    q = "INSERT INTO ".concat(table, " (").concat(headers, ") VALUES (").concat(values, ");");

    try {
      db.query(q);
    } catch (error) {
      alert(JSON.stringify('Ошибка при записи строки в бд') + error.message);
    }

    return true;
  };

  this.removeFromDb = function (table, param, orient) {
    var q,
        j = 0,
        newParam,
        paramStr = '';

    if (orient && orient === 'vertical') {
      if (param) {
        for (var _i7 = 0, _Object$entries7 = Object.entries(param); _i7 < _Object$entries7.length; _i7++) {
          var _Object$entries7$_i = _slicedToArray(_Object$entries7[_i7], 2),
              key = _Object$entries7$_i[0],
              value = _Object$entries7$_i[1];

          if (table === 'settings') {
            newParam = {
              variable: key,
              value: value
            };
          }

          dbMethods.removeFromDb(table, newParam);
        }
      }

      return true;
    } // собираем строку параметров


    if (param) {
      for (var _i8 = 0, _Object$entries8 = Object.entries(param); _i8 < _Object$entries8.length; _i8++) {
        var _Object$entries8$_i = _slicedToArray(_Object$entries8[_i8], 2),
            _key4 = _Object$entries8$_i[0],
            _value4 = _Object$entries8$_i[1];

        j += 1;
        paramStr += j > 1 ? " AND ".concat(_key4, " ").concat(this.toNull(_value4)) : "".concat(_key4, " ").concat(this.toNull(_value4));
      }
    }

    q = param ? "DELETE FROM ".concat(table, " WHERE ").concat(paramStr, ";") : "DELETE FROM ".concat(table);

    try {
      db.query(q);
    } catch (error) {
      logger('Ошибка при удалении строки в бд ' + q);
    }
  }; // развернет обьект по каждому вложенному массиву


  this.objExpandArray = function (obj) {
    var mainArray = [];

    if (Array.isArray(obj)) {
      obj.forEach(function (valuesItem) {
        var newObj = dbMethods.objExpandArray(valuesItem);

        if (Array.isArray(newObj)) {
          newObj.forEach(function (newObjItem) {
            mainArray.push(dbMethods.objExpandArray(newObjItem));
          });
        } else {
          mainArray.push(dbMethods.objExpandArray(newObj));
        }
      });
      return mainArray;
    } // массив values обьекта


    var values = Object.keys(obj).map(function (e) {
      return obj[e];
    });
    var arrayInObj = values.find(function (el) {
      return Array.isArray(el);
    });

    if (arrayInObj) {
      // если есть значение равное массиву то мы развернем этот обьект по массиву внутри
      arrayInObj.forEach(function (arryaItem) {
        var mainArrayItem = {};

        for (var _i9 = 0, _Object$entries9 = Object.entries(obj); _i9 < _Object$entries9.length; _i9++) {
          var _Object$entries9$_i = _slicedToArray(_Object$entries9[_i9], 2),
              key = _Object$entries9$_i[0],
              value = _Object$entries9$_i[1];

          if (!Array.isArray(value)) {
            mainArrayItem = Object.assign(mainArrayItem, _defineProperty({}, key, value));
          }
        }

        mainArrayItem = Object.assign(mainArrayItem, arryaItem);
        mainArray.push(dbMethods.objExpandObjValues(mainArrayItem));
      });
      return mainArray;
    }

    return dbMethods.objExpandObjValues(obj);
  }; // переименование зарезервированных свойств(id, name...)


  this.renameReserveKey = function (obj) {
    if (obj instanceof Object) {
      for (var _i10 = 0, _Object$entries10 = Object.entries(obj); _i10 < _Object$entries10.length; _i10++) {
        var _Object$entries10$_i = _slicedToArray(_Object$entries10[_i10], 2),
            key = _Object$entries10$_i[0],
            value = _Object$entries10$_i[1];

        value = dbMethods.renameReserveKey(value);

        if (value instanceof Object) {
          for (var _i11 = 0, _Object$entries11 = Object.entries(value); _i11 < _Object$entries11.length; _i11++) {
            var _Object$entries11$_i = _slicedToArray(_Object$entries11[_i11], 2),
                expandKey = _Object$entries11$_i[0],
                expandValue = _Object$entries11$_i[1];

            if ("".concat(expandKey) === 'id' || "".concat(expandKey) === 'name') {
              value["".concat(key, "_").concat(expandKey)] = expandValue;
              delete value[expandKey];
            }
          }
        }
      }

      return obj;
    }

    return obj;
  }; // развернет свойства-объекты в несколько свойств


  this.objExpandObjValues = function (obj) {
    for (var _i12 = 0, _Object$entries12 = Object.entries(obj); _i12 < _Object$entries12.length; _i12++) {
      var _Object$entries12$_i = _slicedToArray(_Object$entries12[_i12], 2),
          key = _Object$entries12$_i[0],
          value = _Object$entries12$_i[1];

      // развертывание свойства-обьекта как нескольких свойств
      if (value instanceof Object) {
        for (var _i13 = 0, _Object$entries13 = Object.entries(value); _i13 < _Object$entries13.length; _i13++) {
          var _Object$entries13$_i = _slicedToArray(_Object$entries13[_i13], 2),
              expandKey = _Object$entries13$_i[0],
              expandValue = _Object$entries13$_i[1];

          obj["".concat(key, "_").concat(expandKey)] = expandValue;
        }

        delete obj[key];
      }
    }

    return dbMethods.renameReserveKey(obj);
  };
}();