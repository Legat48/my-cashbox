"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// универсальная функция отрисовки DOM элемента. Возвращает элемент.
// tag - тэг DOM элемента
// className -все классы,в одну строку передаются
// content - дочерние элементы,  если строка или число, будет текст контент(не value), если объект или массив объектов , то будут дочерние элементы добавлены через appendChild, добавляются по порядку. Если передается массив не только объектов, то строки и числа вписываются как текст контент а объекты добавляются детьми.
// attr - для присваивания data-, value и других атрибутов и свойств (плейсхолдер, чектайп и тд)
function el(tag, className, content, attr) {
  var renderingItem = document.createElement(tag);

  if (className && typeof className === 'string') {
    var classNameArray = className.trim().split(' ');
    classNameArray.forEach(function (e) {
      renderingItem.classList.add(e);
    });
  }

  if (content) {
    if (typeof content === 'string' || typeof content === 'number') {
      renderingItem.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach(function (e) {
        if (isElement(e)) {
          renderingItem.appendChild(e);
        }

        if (typeof e === 'string' || typeof e === 'number') {
          renderingItem.textContent += e;
        }
      });
    } else {
      renderingItem.appendChild(content);
    }
  }

  if (attr) {
    for (var _i = 0, _Object$entries = Object.entries(attr); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      renderingItem.setAttribute("".concat(key), "".concat(value));
    }
  }

  return renderingItem;
}