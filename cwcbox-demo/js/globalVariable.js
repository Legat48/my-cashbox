"use strict";

// const btnCash = document.querySelector('.interaction__btn_cash'); /*кнопка оплаты наличными*/
var btnClear = document.querySelector('.surrender__btn_clear');
/*кнопка очистки ввода наличных*/

var surrenderWrap = document.querySelector('.surrender');
/*родитель счетчика сдачи*/

var clearOrderBtn = document.getElementById('clearOrder');
var wrapReceipt = document.querySelector(".receipt__list");
/*контейнер куда вписываются товары*/
// вывод значения сдачи

var outputValueSurrenderArr = document.querySelectorAll('.surrender-value'); // вывод значения суммы оплаты

var outputValuePaymentArr = document.querySelectorAll('.payment-value'); // вывод значения введенной суммы наличных

var outputValueStockArr = document.querySelectorAll('.stock-value'); // кнопки ввода наличных

var btnDenominationArr = document.querySelectorAll('.surrender__btn_denomination'); // итпуты ввода промокода и карты

var inputHeaderArr = document.querySelectorAll('.header__card-input'); // обработчик ввода клиента

var clientBtn = document.querySelector('#client-btn');
var clientInput = document.querySelector('#client-card-input');
var clientWrap = document.querySelector('.header__card_client');
var cashbackWrap = clientWrap.querySelector('.client__cashback');
var cardValue = cashbackWrap.querySelector('.client__value');
var btnWriteOff = document.querySelector('#client-btn-write-off');
var q, ans; // переменные промокода

var promocodeBtn = document.querySelector('#promocode-btn');
var promocodeInput = document.querySelector('#promocode-input');
var promocodeWrap = document.querySelector('.header__card_promocode');
var promoValue = document.querySelector('.promocode__value');
var certValue = document.querySelector('.certificate__value'); // скрытие и проявление настроек

var settingBtn = document.querySelector('#setting-btn');
var settingRoot = document.querySelector('.header__menu');
var settingBox = document.querySelector('.setting__box'); // кнопки

var btnCashNon = document.querySelector('.interaction__btn_noncash'); //оплата безналом

var btnCash = document.querySelector('.interaction__btn_cash'); //оплата налом

var btnQRcode = document.querySelector('.interaction__btn_QR-code'); //оплата налом

var btnLastOrder = document.querySelector('#last-order'); //последний чек

var btnReportX = document.querySelector('#ReportX'); // X отчет

var btnReportZ = document.querySelector('#ReportZ'); // Z отчет

var btnBankReconciliation = document.querySelector('#bankReconciliation'); //сверка банка

var btnUpdate = document.querySelector('.header__btn-update'); // кнопка обновления

var closeWorkDayPinBtn = document.querySelector('.pin__exit'); // чеклисты

var checklistWrap = document.querySelector('.checklist');
var checklistList = document.querySelector('.checklist__list');
var checklistBtnCollapse = document.querySelector('#checklist-collapse');
var checklistBtnExpand = document.querySelector('#checklist-expand'); // qr code

var qrSumGlobal = document.querySelectorAll('.qr-revenue');
var qrReturnGlobal = document.querySelectorAll('.qr-return');
var qrButtonGlobal = document.querySelector('#btn-qr-code');