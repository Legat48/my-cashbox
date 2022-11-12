"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var checklist = new function () {
  this.send = function () {
    if (useChecklist) {
      var url = "http://checklist/checklist/get?token=".concat(tokenPoint, "&key=nokey");

      if (onlineSystem) {
        return new Promise(function (resolve, reject) {
          ieFetch({
            method: 'POST',
            url: url,
            headerType: "Content-Type",
            type: "application/json",
            send: tokenPoint
          }).then(function (json) {
            var ans = JSON.parse(json);
            var data = ans.data; //массив пунктов

            logger("\u041F\u0443\u043D\u043A\u0442\u044B \u0447\u0435\u043A\u043B\u0438\u0441\u0442\u0430".concat(json));

            if (ans.type === 'success') {
              var queryArr = '';
              checklistParttime = 0;
              data.forEach(function (item) {
                if (queryArr) {
                  queryArr = "".concat(queryArr, ",(").concat(item.id, ", '").concat(item.text, "','").concat(item.parttime, "',").concat(item.status, ")");
                } else {
                  queryArr = "(".concat(item.id, ", '").concat(item.text, "','").concat(item.parttime, "',").concat(item.status, ")");
                }
              });
              var q = "delete from checklist where id > 0";
              db.query(q);
              q = "INSERT into checklist (id,text,parttime,status) values ".concat(queryArr);
              logger("\u041F\u043E\u043F\u044B\u0442\u043A\u0430 \u044D\u0442\u043E \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C ".concat(q));
              db.query(q);
              checklist.render(0);
              popup('Чек лист получен');
            }

            return;
          })["catch"](function (e) {
            popup('Чек лист не получен');
            return;
          });
        });
      }
    }
  };

  this.updateObg = function () {
    var ans, q;
    q = "SELECT id,text,parttime,status from checklist where 1";

    try {
      ans = db.query(q);
    } catch (e) {
      db.conn.close();
    }

    var checklistObgArr = []; // преобразование ответа в массив

    if (ans) {
      for (var i = 0; ans[i] != undefined; i++) {
        var checklistItem = new ChecklistItem(ans[i].id, ans[i].text, ans[i].parttime, ans[i].status);
        checklistObgArr.push(checklistItem);
      } // обновление глобольного объекта


      checklistObg = {};
      checklistObgArr.forEach(function (e) {
        checklistObg[e.id] = {
          id: e.id,
          parttime: e.parttime,
          text: e.text,
          status: e.status
        };
      });
    }
  };

  this.render = function (parttime) {
    var notFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (useChecklist) {
      checklist.updateObg();
      checklistWrap.classList.add('checklist_active');
      var checklistObgArr = [];

      for (var _i = 0, _Object$entries = Object.entries(checklistObg); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];

        checklistObgArr.push(value);
      }

      if (checklistObgArr.length === 0) {
        checklist.send();
      }

      while (checklistList.firstChild) {
        checklistList.removeChild(checklistList.firstChild);
      }

      checklistObgArr.forEach(function (e) {
        if (parttime == e.parttime) {
          var item = el('button', "checklist__item btn", "".concat(e.text), {
            'data-idchlst': "".concat(e.id)
          });
          checklistList.appendChild(item);
        }
      });
      var itemArr = document.querySelectorAll('.checklist__item');
      itemArr.forEach(function (item) {
        item.addEventListener('click', function (e) {
          var passed = true;
          item.classList.add('checklist__item_active'); // кнопка возврата и алгоритм возврата чека

          var q = "UPDATE checklist SET status = 1 WHERE id = ".concat(Number(e.target.dataset.idchlst));

          try {
            db.query(q);
          } catch (message) {
            logger("\u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0447\u0435\u043A\u043B\u0438\u0441\u0442\u0430 ".concat(message.message));
          }

          itemArr.forEach(function (e) {
            if (!e.classList.contains('checklist__item_active')) {
              passed = false;
            }
          });

          if (passed) {
            checklistWrap.classList.remove('checklist_active');

            if (notFirst) {
              checklist.reportServer();
            } else {
              checklist.reportServer(true);
            }
          }
        });
      });
    }
  };

  this.tracking = function () {
    if (useChecklist) {
      checklistBtnCollapse.addEventListener('click', function () {
        checklistWrap.classList.remove('checklist_active');
      });
      checklistBtnExpand.addEventListener('click', function () {
        checklistWrap.classList.add('checklist_active');
      });
    }
  };

  this.reportServer = function (parttimeMid) {
    if (useChecklist) {
      checklist.updateObg();
      var url = "http://checklist/checklist/set?token=".concat(tokenPoint, "&key=nokey");
      var sendArr = [];

      for (var _i2 = 0, _Object$entries2 = Object.entries(checklistObg); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            key = _Object$entries2$_i[0],
            value = _Object$entries2$_i[1];

        var item = {
          id: value.id,
          status: value.status
        };
        sendArr.push(item);
      }

      send = {
        checklist: sendArr
      };

      if (onlineSystem) {
        return new Promise(function (resolve, reject) {
          ieFetch({
            method: 'POST',
            url: url,
            headerType: "Content-Type",
            type: "application/json",
            send: JSON.stringify(send)
          }).then(function (json) {
            var ans = JSON.parse(json);

            if (ans.type === 'success') {
              popup('Отчет по чеклистам отправлен');

              if (parttimeMid) {
                // setTimeout(checklist.render(1), 14400000)\
                var reportFunc = checklist.render(1, true);
                setTimeout(reportFunc, 1);
              }
            } else {
              var _reportFunc = checklist.reportServer();

              if (parttimeMid) {
                _reportFunc = checklist.reportServer(1);
              } // setTimeout(reportFunc, 360000)


              setTimeout(_reportFunc, 1);
            }

            return;
          })["catch"](function (e) {
            alert('Ошибка отправки отчета по чеклистам' + JSON.stringify(e));
            popup('Ошибка отправки отчета по чеклистам');
            return;
          });
        });
      }
    }
  };
}();