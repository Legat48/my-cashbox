"use strict";

var myWeight = new function () {
  try {
    this.CAS = new ActiveXObject('CAScentre_DLL_printScale.Scale'); //.GetWeight
  } catch (error) {
    logger('Ошибка при инициализации весов' + error.message);
  }

  this.weight = '-1';
  this.IP = '192.168.0.3';

  this.getWeight = function () {
    if (useWeight) {
      try {
        //Задаем основные настройки драйвера для работы с весами
        this.CAS.IP = "127.0.0.1";
        this.CAS.Port = 20304;
        this.CAS.Type = 0; //Подключаемся к весам

        this.CAS.Open(); //this.CAS.ConnectTCP( this.IP, 8111, 0 );
        // Установка соединения с весами

        this.weight = this.CAS.statusWeight; // Получение веса от драйвера
        // Разрыв соединения с весами.

        this.CAS.Close();
      } catch (e) {
        logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0432\u0435\u0441\u0430\u0445".concat(e.message));
        popup("\u043E\u0448\u0438\u0431\u043A\u0430 \u0432 \u0432\u0435\u0441\u0430\u0445".concat(e.message));
      }

      return this.weight;
    }
  };
}();