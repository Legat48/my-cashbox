var pincode = "";
var hashcode = "";

// функционал окна с пинкодом
function pinManual() {
  const pinN = document.querySelectorAll('.pin__item-value');
  const btnnumberN = document.querySelectorAll('.pin__btn_number');// создает нодлист
  const btnnumber = Array.prototype.slice.call(btnnumberN) // делает привычный массив из нодлиста
  const pin = Array.prototype.slice.call(pinN)
  const btnReset = document.querySelector('.pin__btn_reset');
  const btnDel = document.querySelector('.pin__btn_del');

  // каждый запуск стирает из сеттинга баристу чтобы ввели пин
  dbMethods.updateDb('settings', {value: null}, {variable: 'barista'})
  dbMethods.updateDb('settings', {value: null}, {variable: 'employed'})

  initapp();
  // без реиспользования сделаем(ломает)
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://bridge.cwsystem.ru/dbtest', true);
  xhr.send();
  xhr.addEventListener('readystatechange', function (e) {
    if (xhr.readyState !== 4) return;
    if (xhr.status !== 0) {
      if (xhr.responseText == 1){
        updateOnlineStatus(true)
      } else {
        updateOnlineStatus(false)
      }
    preloader.preloaderOff()
    } else {
    preloader.preloaderOff()
      updateOnlineStatus(false)
    }
  });
  let pinValue = [];

 // проверка пинкода
  function chekpincode(value) {
    preloader.preloader('body')
    try {
      let localPin = dbMethods.getterDb('settings', {variable: 'pincode'}, 'value')[0] // записан ли работник в сеттингс
      if(`${localPin}` === `null`) { // код не вводили
        if(!dbMethods.getterDb('employees', {[`pin_code`]: value}, 'employees_name').length) {
         preloader.preloaderOff()
          alert('Неверный ПИН-код')
          return false;
        }
        dbMethods.updateDb('settings', {value: MD5(value)}, {variable: 'pincode'})
      } else {
        if(`${MD5(value)}` !== `${localPin}`) { // код не совпал с тем что уже ввели
         preloader.preloaderOff()
          alert('Смена уже была открыта другим пользователем')
          closeWorkDayPinBtn.classList.remove('hidden')
          return false;
        }
      }
      let barista = dbMethods.getterDb('employees', {[`pin_code`]: value}, 'employees_name')[0]
      let partner = dbMethods.getterDb('employees', {[`pin_code`]: value}, 'partner_id')[0]
      parntnerId = partner; // айди партнера
      if(parntnerId != 1) {
        supplies.style.display = 'none'
        reloadMenu.style.display = 'block'
      }
      const url = `http://bridge.cwsystem.ru/engine/?class=API&method=getkeyfororder&key=FagoE956Ji9546&p=${pointCashbox}`
      // ключ для заказа поставки
      ieFetch({
        method : 'POST',
        url: url
      })
      .then((json) => {
        let res = JSON.parse(json);
        suppliesKey = res.supply_key
        logger('Получен ключ поставки:'+JSON.stringify(res))
      })
      .catch((e) => {logger('Ошибка получения ключа поставки' + e.message+'запрос:'+url)})
      let employed =`${dbMethods.getterDb('employees', {[`pin_code`]: value}, 'employed')[0]}` === 'true' ? 1 : 0;
      dbMethods.updateDb('settings', {value: barista}, {variable: 'barista'})
      dbMethods.updateDb('settings', {value: employed}, {variable: 'employed'})
      dbMethods.updateDb('settings', {value: weekDay}, {variable: 'weekDay'})
      return true;
    } catch (error) {
      throw(`Ошибка в обработке ПИН-кода`);
    }
  }

  btnReset.addEventListener('click', () => {
    pin.forEach((e) => {
      e.textContent = '✱';
      pinValue = [];
    });
  });

  btnDel.addEventListener('click', () => {
    pin.forEach((e) => {
      e.textContent = '✱';
    });
    pinValue = pinValue.slice(0, (pinValue.length - 1));
    for (const i of pinValue) {
      for (const e of pin) {
        if (e.textContent === '✱') {
          e.textContent = i;
          break;
        }
      }
    }
  });

  function checkPass() {
    if (pinValue.length === 6) {
      var promise = new Promise(function(resolve) {
        resolve(chekpincode(pinValue.join('')))
      });
      promise
      .then(function(result) {
        if(result) {
          oldShift = undefined;
          workDay();
        }
        initapp();
      })
      .catch((error) => {
        preloader.preloaderOff()
        alert('Ошибка в pinManual>checkPass'+JSON.stringify(error))
      })
      pin.forEach((e) => {
        e.textContent = '✱';
        pinValue = [];
      });
    }
  }

  btnnumber.forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = Number(btn.textContent);
      for (const e of pin) {
        if (e.textContent === '✱') {
          e.textContent = value;
          pinValue.push(value);
          pincode = pinValue.join('');
          break;
        }
      }
      checkPass();
    });
  });
}
pinManual()
