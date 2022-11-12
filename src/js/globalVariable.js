// const btnCash = document.querySelector('.interaction__btn_cash'); /*кнопка оплаты наличными*/
const btnClear = document.querySelector('.surrender__btn_clear'); /*кнопка очистки ввода наличных*/
const surrenderWrap = document.querySelector('.surrender');  /*родитель счетчика сдачи*/
const clearOrderBtn = document.getElementById('clearOrder');
const wrapReceipt = document.querySelector(`.receipt__list`); /*контейнер куда вписываются товары*/
// вывод значения сдачи
const outputValueSurrenderArr = document.querySelectorAll('.surrender-value');
// вывод значения суммы оплаты
const outputValuePaymentArr = document.querySelectorAll('.payment-value');
// вывод значения введенной суммы наличных
const outputValueStockArr = document.querySelectorAll('.stock-value');
// кнопки ввода наличных
const btnDenominationArr = document.querySelectorAll('.surrender__btn_denomination');
// итпуты ввода промокода и карты
const inputHeaderArr = document.querySelectorAll('.header__card-input');
// обработчик ввода клиента
const clientBtn = document.querySelector('#client-btn');
const clientInput = document.querySelector('#client-card-input');
const clientWrap = document.querySelector('.header__card_client');
const cashbackWrap = clientWrap.querySelector('.client__cashback');
const cardValue = cashbackWrap.querySelector('.client__value');
const btnWriteOff = document.querySelector('#client-btn-write-off')

let q, ans;
// переменные промокода
const promocodeBtn = document.querySelector('#promocode-btn');
const promocodeInput = document.querySelector('#promocode-input');
const promocodeWrap = document.querySelector('.header__card_promocode');
const promoValue = document.querySelector('.promocode__value');
const certValue = document.querySelector('.certificate__value');

// скрытие и проявление настроек
const settingBtn = document.querySelector('#setting-btn')
const settingRoot = document.querySelector('.header__menu')
const settingBox = document.querySelector('.setting__box')
// кнопки
const btnCashNon = document.querySelector('.interaction__btn_noncash') //оплата безналом
const btnCash = document.querySelector('.interaction__btn_cash') //оплата налом
const btnQRcode = document.querySelector('.interaction__btn_QR-code') //оплата налом
const btnLastOrder = document.querySelector('#last-order') //последний чек
const btnReportX = document.querySelector('#ReportX') // X отчет
const btnReportZ = document.querySelector('#ReportZ') // Z отчет
const btnBankReconciliation = document.querySelector('#bankReconciliation') //сверка банка
const btnUpdate = document.querySelector('.header__btn-update'); // кнопка обновления
const closeWorkDayPinBtn = document.querySelector('.pin__exit');

// чеклисты
const checklistWrap = document.querySelector('.checklist')
const checklistList = document.querySelector('.checklist__list')
const checklistBtnCollapse = document.querySelector('#checklist-collapse');
const checklistBtnExpand = document.querySelector('#checklist-expand')
// qr code
const qrSumGlobal = document.querySelectorAll('.qr-revenue');
const qrReturnGlobal = document.querySelectorAll('.qr-return');
const qrButtonGlobal = document.querySelector('#btn-qr-code');






