// неизбежный рудимент. Пользоваться не стоит, менять в коде старом-слишном долго
// методы универсального обращения в базу данных
const dbMethods = new function () {
  this.toNull = function(value) {
    return value = (value === null) ? `is ${value}` : `= '${value}'`;
  }
  this.getterDb = function(table, param, target, limit) {
    let q, resp, data = [], j = 0, paramStr = '', targetStr = (target) ? '' : 'id', getStr = (target) ? target : 'id' ;
    // собираем строку параметров
    for (const [key, value] of Object.entries(param)) {
      j += 1;
      if(`${key}` === 'pin_code') { // шифрование пинкода
        value = MD5(value)
      }
      paramStr += (j > 1) ? ` AND ${key} ${this.toNull(value)}` : `${key} ${this.toNull(value)}`
    }
    // костыль для вертикальной таблицы
    // пока она одна будет только для settings
    paramStr = (table === 'settings') ? `variable = '${param.variable}'`: paramStr;
    // создаем селектор чтобы найти нужную строку
    let targetArray = (target) ? target.split(',') : '';
    if(Array.isArray(targetArray) && targetArray.length > 0) {
      targetArray.forEach((targetItem, targetIndex) => {
        targetStr += (targetIndex > 0) ? `, ${targetItem}` : `${targetItem}`;
      })
    }
    if(limit)   paramStr += ` LIMIT ${limit}`;
    // собранный запрос
    q = `SELECT ${targetStr} FROM ${table} WHERE ${paramStr}`;
    try {
      resp = db.query(q);
      // сбор массива по параметру target если его нет вернет массив обьектов
      // где свойства это столбцы найденых строк
      for (const [key, value] of Object.entries(resp)) {
        if(value.hasOwnProperty(`${getStr}`)) {
          data.push(value[`${getStr}`])
          continue;
        }

        data.push(value)
      }
      return data;
    } catch(error) {
      try {
        db.conn.close()
      } catch (error) {

      }
      return [];
    }
  }
  this.updateDb = function(table, param, target) {
    let q, paramStr = '', targetStr = '', j = 0, k = 0;
    for (const [key, value] of Object.entries(param)) {
      if(`${key}` === 'pin_code') { // шифрование пинкода
        value = MD5(value)
      }
      value = (value === null) ? `${value}` : `'${value}'`;
      j += 1;
      paramStr += (j > 1) ? ` , ${key} = ${value}` : `${key} = ${value}`
    }
    for (const [key, value] of Object.entries(target)) {
      k += 1;
      targetStr += (k > 1) ? ` AND ${key} = '${value}'` : `${key} = '${value}'`
    }
    q = `UPDATE ${table} SET ${paramStr} WHERE ${targetStr}`
    try {
      db.query(q)
    } catch (error) {
      logger('Ошибка во время обновления строки ' + q)
    }
  }
  this.setterDb = function(table, param, orient) {
    let q, headers = ``, values = ``, newParam = param, strokeId;
    // таблица c вертикальной ориентацией
    if(orient && orient === 'vertical') {
      for (const [key, value] of Object.entries(param)) {
        if(table === 'settings') {
          newParam = (value === null) ? {variable: key} : {variable: key, value: value};
        }
        dbMethods.setterDb(table, newParam)
      }
    return true;
    }
    strokeId = dbMethods.getterDb(table, param)
    if(strokeId.length > 0) {
      strokeId.forEach((e) => {
        dbMethods.updateDb(table, param, {id: e})
      })
      return;
    }
    // строки нет и мы добавляем ее в таблицу
    // собираем запрос на создание строки
    let i = 0
    for (const [key, value] of Object.entries(param)) {
      if(value === null){
        continue;
      }
      if(`${key}` === 'pin_code') { // сохранение пинкода
        value = MD5(value)
      }
      i += 1;
      headers += (i > 1) ? `, ${key}` : `${key}`;
      values += (i > 1) ? `, '${value}'` : `'${value}'`;
    }
    // отсюда идут специфичные таблицы где нужно заполнить обязательные поля с дефолтным значением не равным NULL
    // дописываем их в запрос
    if(table === 'orderItem') {
      if(!headers.includes('amount')) { headers += `, amount`; values += `, '1'` }
      if(!headers.includes('sale')) { headers += `, sale`; values += `, '1'` }
      if(!headers.includes('priceFinal') && param.hasOwnProperty('price') ) { headers += `, priceFinal`; values += `, '${param.price}'` }
    }
    q = `INSERT INTO ${table} (${headers}) VALUES (${values});`;
    try {
      db.query(q);
    } catch (error) {
      alert(JSON.stringify('Ошибка при записи строки в бд') + error.message)
    }
    return true;
  }
  this.removeFromDb = function(table, param, orient) {
    let q, j = 0, newParam, paramStr = '';
    if(orient && orient === 'vertical') {
      if(param) {
        for (const [key, value] of Object.entries(param)) {
          if(table === 'settings') {
            newParam = {variable: key, value: value};
          }
          dbMethods.removeFromDb(table, newParam)
        }
      }
    return true;
    }
    // собираем строку параметров
    if(param) {
      for (const [key, value] of Object.entries(param)) {
        j += 1;
        paramStr += (j > 1) ? ` AND ${key} ${this.toNull(value)}` : `${key} ${this.toNull(value)}`
      }
    }
    q = (param) ? `DELETE FROM ${table} WHERE ${paramStr};` : `DELETE FROM ${table}`;
    try {
      db.query(q);
    } catch (error) {
      logger('Ошибка при удалении строки в бд ' + q)
    }
  }
  // развернет обьект по каждому вложенному массиву
  this.objExpandArray = function(obj) {
    let mainArray = [];
    if(Array.isArray(obj)) {
      obj.forEach((valuesItem) => {
        let newObj = dbMethods.objExpandArray(valuesItem);
        if(Array.isArray(newObj)) {
          newObj.forEach((newObjItem) => {
            mainArray.push(dbMethods.objExpandArray(newObjItem))
          })
        } else {
          mainArray.push(dbMethods.objExpandArray(newObj))
        }
      })
      return mainArray;
    }
    // массив values обьекта
    var values = Object.keys(obj).map(function(e) {
      return obj[e]
    })
    let arrayInObj =  values.find(el => Array.isArray(el))
    if(arrayInObj) {  // если есть значение равное массиву то мы развернем этот обьект по массиву внутри
      arrayInObj.forEach((arryaItem) => {
        let mainArrayItem = {};
        for (const [key, value] of Object.entries(obj)) {
          if(!Array.isArray(value)) {
            mainArrayItem = Object.assign(mainArrayItem, {[key]:value})
          }
        }
        mainArrayItem = Object.assign(mainArrayItem, arryaItem)
        mainArray.push(dbMethods.objExpandObjValues(mainArrayItem))
      })
      return mainArray;
    }
    return dbMethods.objExpandObjValues(obj);
  }
  // переименование зарезервированных свойств(id, name...)
  this.renameReserveKey = function(obj) {
    if(obj instanceof Object) {
      for (const [key, value] of Object.entries(obj)) {
        value = dbMethods.renameReserveKey(value)
        if(value  instanceof Object) {
          for (const [expandKey, expandValue] of Object.entries(value)) {
            if(`${expandKey}` === 'id' || `${expandKey}` === 'name') {
              value[`${key}_${expandKey}`] = expandValue;
              delete value[expandKey];
            }
          }
        }
      }
      return obj;
    }
    return obj;
  }
  // развернет свойства-объекты в несколько свойств
  this.objExpandObjValues = function(obj) {
    for (const [key, value] of Object.entries(obj)) { // развертывание свойства-обьекта как нескольких свойств
      if(value  instanceof Object) {
        for (const [expandKey, expandValue] of Object.entries(value)) {
          obj[`${key}_${expandKey}`] = expandValue;
        }
        delete obj[key];
      }
    }
    return dbMethods.renameReserveKey(obj);
  }
}








