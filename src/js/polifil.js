"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

//полифил для remove()
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
} //полифил для Object.entries

if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array

    while (i--) {
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    }

    return resArray;
  };
} // полифил для  matches и closest

if (!Element.prototype.addEventListener) {
  var oListeners = {};
  function runListeners(oEvent) {
    if (!oEvent) { oEvent = window.event; }
    for (var iLstId = 0, iElId = 0, oEvtListeners = oListeners[oEvent.type]; iElId < oEvtListeners.aEls.length; iElId++) {
      if (oEvtListeners.aEls[iElId] === this) {
        for (iLstId; iLstId < oEvtListeners.aEvts[iElId].length; iLstId++) { oEvtListeners.aEvts[iElId][iLstId].call(this, oEvent); }
        break;
      }
    }
  }
  Element.prototype.addEventListener = function (sEventType, fListener /*, useCapture (will be ignored!) */) {
    if (oListeners.hasOwnProperty(sEventType)) {
      var oEvtListeners = oListeners[sEventType];
      for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
        if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
      }
      if (nElIdx === -1) {
        oEvtListeners.aEls.push(this);
        oEvtListeners.aEvts.push([fListener]);
        this["on" + sEventType] = runListeners;
      } else {
        var aElListeners = oEvtListeners.aEvts[nElIdx];
        if (this["on" + sEventType] !== runListeners) {
          aElListeners.splice(0);
          this["on" + sEventType] = runListeners;
        }
        for (var iLstId = 0; iLstId < aElListeners.length; iLstId++) {
          if (aElListeners[iLstId] === fListener) { return; }
        }
        aElListeners.push(fListener);
      }
    } else {
      oListeners[sEventType] = { aEls: [this], aEvts: [ [fListener] ] };
      this["on" + sEventType] = runListeners;
    }
  };
  Element.prototype.removeEventListener = function (sEventType, fListener /*, useCapture (will be ignored!) */) {
    if (!oListeners.hasOwnProperty(sEventType)) { return; }
    var oEvtListeners = oListeners[sEventType];
    for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
      if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
    }
    if (nElIdx === -1) { return; }
    for (var iLstId = 0, aElListeners = oEvtListeners.aEvts[nElIdx]; iLstId < aElListeners.length; iLstId++) {
      if (aElListeners[iLstId] === fListener) { aElListeners.splice(iLstId, 1); }
    }
  };
}

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;

    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);

    return null;
  };
}

(function (e) {
  var matches = e.matches || e.matchesSelector || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector || e.oMatchesSelector;
  !matches ? e.matches = e.matchesSelector = function matches(selector) {
    var matches = document.querySelectorAll(selector);
    var th = this;
    return Array.prototype.some.call(matches, function (e) {
      return e === th;
    });
  } : e.matches = e.matchesSelector = matches;
})(Element.prototype);

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;

    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);

    return null;
  };
} // полифил вызова события инпут


var inputEvent = document.createEvent("Event");
inputEvent.initEvent("input", false, true);
var submitEvent = document.createEvent("Event");
submitEvent.initEvent("submit", false, true);

function isElement(v) {
  if (_typeof(v) !== 'object') return false;
  if (v === null) return false;
  var c = window.Document;
  return v instanceof c || v instanceof window.HTMLElement;
} // полифил для includes


if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    'use strict';

    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
} // полифил для isArray


if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

// полифил для промис
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t():"function"==typeof define&&define.amd?define(t):t()}(0,function(){"use strict";function e(e){var t=this.constructor;return this.then(function(n){return t.resolve(e()).then(function(){return n})},function(n){return t.resolve(e()).then(function(){return t.reject(n)})})}function t(e){return new this(function(t,n){function o(e,n){if(n&&("object"==typeof n||"function"==typeof n)){var f=n.then;if("function"==typeof f)return void f.call(n,function(t){o(e,t)},function(n){r[e]={status:"rejected",reason:n},0==--i&&t(r)})}r[e]={status:"fulfilled",value:n},0==--i&&t(r)}if(!e||"undefined"==typeof e.length)return n(new TypeError(typeof e+" "+e+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);for(var i=r.length,f=0;r.length>f;f++)o(f,r[f])})}function n(e){return!(!e||"undefined"==typeof e.length)}function o(){}function r(e){if(!(this instanceof r))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=undefined,this._deferreds=[],l(e,this)}function i(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,r._immediateFn(function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var o;try{o=n(e._value)}catch(r){return void u(t.promise,r)}f(t.promise,o)}else(1===e._state?f:u)(t.promise,e._value)})):e._deferreds.push(t)}function f(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof r)return e._state=3,e._value=t,void c(e);if("function"==typeof n)return void l(function(e,t){return function(){e.apply(t,arguments)}}(n,t),e)}e._state=1,e._value=t,c(e)}catch(o){u(e,o)}}function u(e,t){e._state=2,e._value=t,c(e)}function c(e){2===e._state&&0===e._deferreds.length&&r._immediateFn(function(){e._handled||r._unhandledRejectionFn(e._value)});for(var t=0,n=e._deferreds.length;n>t;t++)i(e,e._deferreds[t]);e._deferreds=null}function l(e,t){var n=!1;try{e(function(e){n||(n=!0,f(t,e))},function(e){n||(n=!0,u(t,e))})}catch(o){if(n)return;n=!0,u(t,o)}}var a=setTimeout;r.prototype["catch"]=function(e){return this.then(null,e)},r.prototype.then=function(e,t){var n=new this.constructor(o);return i(this,new function(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}(e,t,n)),n},r.prototype["finally"]=e,r.all=function(e){return new r(function(t,o){function r(e,n){try{if(n&&("object"==typeof n||"function"==typeof n)){var u=n.then;if("function"==typeof u)return void u.call(n,function(t){r(e,t)},o)}i[e]=n,0==--f&&t(i)}catch(c){o(c)}}if(!n(e))return o(new TypeError("Promise.all accepts an array"));var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);for(var f=i.length,u=0;i.length>u;u++)r(u,i[u])})},r.allSettled=t,r.resolve=function(e){return e&&"object"==typeof e&&e.constructor===r?e:new r(function(t){t(e)})},r.reject=function(e){return new r(function(t,n){n(e)})},r.race=function(e){return new r(function(t,o){if(!n(e))return o(new TypeError("Promise.race accepts an array"));for(var i=0,f=e.length;f>i;i++)r.resolve(e[i]).then(t,o)})},r._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e)}||function(e){a(e,0)},r._unhandledRejectionFn=function(e){void 0!==console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};var s=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw Error("unable to locate global object")}();"function"!=typeof s.Promise?s.Promise=r:(s.Promise.prototype["finally"]||(s.Promise.prototype["finally"]=e),s.Promise.allSettled||(s.Promise.allSettled=t))});

//полифил для assign;
if (typeof Object.assign != "function") {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      "use strict";
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

// полифил для find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);
      var len = o.length >>> 0;

      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      var thisArg = arguments[1];
      var k = 0;

      while (k < len) {
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        k++;
      }

      return undefined;
    }
  });
} // полифил на фетч
// myFetch(//parameters...).then(//...... код который у Вас в then).


function ieFetch(params) {
  // logger(`параметры отправки ${JSON.stringify(params)}`)
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(params.method, params.url, true);
    if(params.headerApikey){
      xhr.setRequestHeader(params.headerApikey, params.key);
    }
    if(params.headerUserToken){
      xhr.setRequestHeader(params.headerUserToken, params.token);
    }
    if(params.headerType) {
      xhr.setRequestHeader(params.headerType, params.type);
    }
    if(params.send) {
      xhr.send(params.send);
    } else {
      xhr.send();
    }
    // popup(JSON.stringify(params))
    xhr.addEventListener('readystatechange', function (e) {
      if (xhr.readyState !== 4) return;
      if (xhr.status == 200) {
        resolve(xhr.responseText);
      //  alert(JSON.stringify(xhr.responseText))

      } else {
        reject('Не получен ответ от сервера'+xhr.statusText);
      //  alert(JSON.stringify(xhr.statusText))
      }
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb2xpZmlsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbi8v0L/QvtC70LjRhNC40Lsg0LTQu9GPIHJlbW92ZSgpXG5pZiAoISgncmVtb3ZlJyBpbiBFbGVtZW50LnByb3RvdHlwZSkpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG4gIH07XG59IC8v0L/QvtC70LjRhNC40Lsg0LTQu9GPIE9iamVjdC5lbnRyaWVzXG5cblxuaWYgKCFPYmplY3QuZW50cmllcykge1xuICBPYmplY3QuZW50cmllcyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgb3duUHJvcHMgPSBPYmplY3Qua2V5cyhvYmopLFxuICAgICAgICBpID0gb3duUHJvcHMubGVuZ3RoLFxuICAgICAgICByZXNBcnJheSA9IG5ldyBBcnJheShpKTsgLy8gcHJlYWxsb2NhdGUgdGhlIEFycmF5XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICByZXNBcnJheVtpXSA9IFtvd25Qcm9wc1tpXSwgb2JqW293blByb3BzW2ldXV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc0FycmF5O1xuICB9O1xufSAvLyDQv9C+0LvQuNGE0LjQuyDQtNC70Y8gIG1hdGNoZXMg0LggY2xvc2VzdFxuXG5cbmlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xufVxuXG5pZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgdmFyIGVsID0gdGhpcztcblxuICAgIGRvIHtcbiAgICAgIGlmIChFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzLmNhbGwoZWwsIHMpKSByZXR1cm4gZWw7XG4gICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQgfHwgZWwucGFyZW50Tm9kZTtcbiAgICB9IHdoaWxlIChlbCAhPT0gbnVsbCAmJiBlbC5ub2RlVHlwZSA9PT0gMSk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbn1cblxuKGZ1bmN0aW9uIChlKSB7XG4gIHZhciBtYXRjaGVzID0gZS5tYXRjaGVzIHx8IGUubWF0Y2hlc1NlbGVjdG9yIHx8IGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8IGUubXNNYXRjaGVzU2VsZWN0b3IgfHwgZS5vTWF0Y2hlc1NlbGVjdG9yO1xuICAhbWF0Y2hlcyA/IGUubWF0Y2hlcyA9IGUubWF0Y2hlc1NlbGVjdG9yID0gZnVuY3Rpb24gbWF0Y2hlcyhzZWxlY3Rvcikge1xuICAgIHZhciBtYXRjaGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgdmFyIHRoID0gdGhpcztcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNvbWUuY2FsbChtYXRjaGVzLCBmdW5jdGlvbiAoZSkge1xuICAgICAgcmV0dXJuIGUgPT09IHRoO1xuICAgIH0pO1xuICB9IDogZS5tYXRjaGVzID0gZS5tYXRjaGVzU2VsZWN0b3IgPSBtYXRjaGVzO1xufSkoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5pZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uIChzKSB7XG4gICAgdmFyIGVsID0gdGhpcztcblxuICAgIGRvIHtcbiAgICAgIGlmIChFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzLmNhbGwoZWwsIHMpKSByZXR1cm4gZWw7XG4gICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQgfHwgZWwucGFyZW50Tm9kZTtcbiAgICB9IHdoaWxlIChlbCAhPT0gbnVsbCAmJiBlbC5ub2RlVHlwZSA9PT0gMSk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbn0gLy8g0L/QvtC70LjRhNC40Lsg0LLRi9C30L7QstCwINGB0L7QsdGL0YLQuNGPINC40L3Qv9GD0YJcblxuXG52YXIgaW5wdXRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG5pbnB1dEV2ZW50LmluaXRFdmVudChcImlucHV0XCIsIGZhbHNlLCB0cnVlKTtcbnZhciBzdWJtaXRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG5zdWJtaXRFdmVudC5pbml0RXZlbnQoXCJzdWJtaXRcIiwgZmFsc2UsIHRydWUpO1xuXG5mdW5jdGlvbiBpc0VsZW1lbnQodikge1xuICBpZiAoX3R5cGVvZih2KSAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgaWYgKHYgPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgdmFyIGMgPSB3aW5kb3cuRG9jdW1lbnQ7XG4gIHJldHVybiB2IGluc3RhbmNlb2YgYyB8fCB2IGluc3RhbmNlb2Ygd2luZG93LkhUTUxFbGVtZW50O1xufSAvLyDQv9C+0LvQuNGE0LjQuyDQtNC70Y8gaW5jbHVkZXNcblxuXG5pZiAoIVN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMpIHtcbiAgU3RyaW5nLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIChzZWFyY2gsIHN0YXJ0KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgaWYgKHR5cGVvZiBzdGFydCAhPT0gJ251bWJlcicpIHtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgKyBzZWFyY2gubGVuZ3RoID4gdGhpcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuaW5kZXhPZihzZWFyY2gsIHN0YXJ0KSAhPT0gLTE7XG4gICAgfVxuICB9O1xufSAvLyDQv9C+0LvQuNGE0LjQuyDQtNC70Y8gaXNBcnJheVxuXG5cbmlmICghQXJyYXkuaXNBcnJheSkge1xuICBBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24gKGFyZykge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcbn0gLy8g0L/QvtC70LjRhNC40Lsg0LTQu9GPINC/0YDQvtC80LjRgVxuXG5cbiFmdW5jdGlvbiAoZSwgdCkge1xuICBcIm9iamVjdFwiID09ICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKGV4cG9ydHMpKSAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBtb2R1bGUgPyB0KCkgOiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKHQpIDogdCgpO1xufSgwLCBmdW5jdGlvbiAoKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGZ1bmN0aW9uIGUoZSkge1xuICAgIHZhciB0ID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uIChuKSB7XG4gICAgICByZXR1cm4gdC5yZXNvbHZlKGUoKSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuO1xuICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24gKG4pIHtcbiAgICAgIHJldHVybiB0LnJlc29sdmUoZSgpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHQucmVqZWN0KG4pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB0KGUpIHtcbiAgICByZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24gKHQsIG4pIHtcbiAgICAgIGZ1bmN0aW9uIG8oZSwgbikge1xuICAgICAgICBpZiAobiAmJiAoXCJvYmplY3RcIiA9PSBfdHlwZW9mKG4pIHx8IFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgbikpIHtcbiAgICAgICAgICB2YXIgZiA9IG4udGhlbjtcbiAgICAgICAgICBpZiAoXCJmdW5jdGlvblwiID09IHR5cGVvZiBmKSByZXR1cm4gdm9pZCBmLmNhbGwobiwgZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIG8oZSwgdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIHJbZV0gPSB7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICByZWFzb246IG5cbiAgICAgICAgICAgIH0sIDAgPT0gLS1pICYmIHQocik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByW2VdID0ge1xuICAgICAgICAgIHN0YXR1czogXCJmdWxmaWxsZWRcIixcbiAgICAgICAgICB2YWx1ZTogblxuICAgICAgICB9LCAwID09IC0taSAmJiB0KHIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWUgfHwgXCJ1bmRlZmluZWRcIiA9PSB0eXBlb2YgZS5sZW5ndGgpIHJldHVybiBuKG5ldyBUeXBlRXJyb3IoX3R5cGVvZihlKSArIFwiIFwiICsgZSArIFwiIGlzIG5vdCBpdGVyYWJsZShjYW5ub3QgcmVhZCBwcm9wZXJ0eSBTeW1ib2woU3ltYm9sLml0ZXJhdG9yKSlcIikpO1xuICAgICAgdmFyIHIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChlKTtcbiAgICAgIGlmICgwID09PSByLmxlbmd0aCkgcmV0dXJuIHQoW10pO1xuXG4gICAgICBmb3IgKHZhciBpID0gci5sZW5ndGgsIGYgPSAwOyByLmxlbmd0aCA+IGY7IGYrKykge1xuICAgICAgICBvKGYsIHJbZl0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbihlKSB7XG4gICAgcmV0dXJuICEoIWUgfHwgXCJ1bmRlZmluZWRcIiA9PSB0eXBlb2YgZS5sZW5ndGgpO1xuICB9XG5cbiAgZnVuY3Rpb24gbygpIHt9XG5cbiAgZnVuY3Rpb24gcihlKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIHIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJvbWlzZXMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB2aWEgbmV3XCIpO1xuICAgIGlmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIGUpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJub3QgYSBmdW5jdGlvblwiKTtcbiAgICB0aGlzLl9zdGF0ZSA9IDAsIHRoaXMuX2hhbmRsZWQgPSAhMSwgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQsIHRoaXMuX2RlZmVycmVkcyA9IFtdLCBsKGUsIHRoaXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gaShlLCB0KSB7XG4gICAgZm9yICg7IDMgPT09IGUuX3N0YXRlOykge1xuICAgICAgZSA9IGUuX3ZhbHVlO1xuICAgIH1cblxuICAgIDAgIT09IGUuX3N0YXRlID8gKGUuX2hhbmRsZWQgPSAhMCwgci5faW1tZWRpYXRlRm4oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG4gPSAxID09PSBlLl9zdGF0ZSA/IHQub25GdWxmaWxsZWQgOiB0Lm9uUmVqZWN0ZWQ7XG5cbiAgICAgIGlmIChudWxsICE9PSBuKSB7XG4gICAgICAgIHZhciBvO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbyA9IG4oZS5fdmFsdWUpO1xuICAgICAgICB9IGNhdGNoIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHZvaWQgdSh0LnByb21pc2UsIHIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZih0LnByb21pc2UsIG8pO1xuICAgICAgfSBlbHNlICgxID09PSBlLl9zdGF0ZSA/IGYgOiB1KSh0LnByb21pc2UsIGUuX3ZhbHVlKTtcbiAgICB9KSkgOiBlLl9kZWZlcnJlZHMucHVzaCh0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGYoZSwgdCkge1xuICAgIHRyeSB7XG4gICAgICBpZiAodCA9PT0gZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkEgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuXCIpO1xuXG4gICAgICBpZiAodCAmJiAoXCJvYmplY3RcIiA9PSBfdHlwZW9mKHQpIHx8IFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgdCkpIHtcbiAgICAgICAgdmFyIG4gPSB0LnRoZW47XG4gICAgICAgIGlmICh0IGluc3RhbmNlb2YgcikgcmV0dXJuIGUuX3N0YXRlID0gMywgZS5fdmFsdWUgPSB0LCB2b2lkIGMoZSk7XG4gICAgICAgIGlmIChcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIG4pIHJldHVybiB2b2lkIGwoZnVuY3Rpb24gKGUsIHQpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZS5hcHBseSh0LCBhcmd1bWVudHMpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0obiwgdCksIGUpO1xuICAgICAgfVxuXG4gICAgICBlLl9zdGF0ZSA9IDEsIGUuX3ZhbHVlID0gdCwgYyhlKTtcbiAgICB9IGNhdGNoIChvKSB7XG4gICAgICB1KGUsIG8pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHUoZSwgdCkge1xuICAgIGUuX3N0YXRlID0gMiwgZS5fdmFsdWUgPSB0LCBjKGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gYyhlKSB7XG4gICAgMiA9PT0gZS5fc3RhdGUgJiYgMCA9PT0gZS5fZGVmZXJyZWRzLmxlbmd0aCAmJiByLl9pbW1lZGlhdGVGbihmdW5jdGlvbiAoKSB7XG4gICAgICBlLl9oYW5kbGVkIHx8IHIuX3VuaGFuZGxlZFJlamVjdGlvbkZuKGUuX3ZhbHVlKTtcbiAgICB9KTtcblxuICAgIGZvciAodmFyIHQgPSAwLCBuID0gZS5fZGVmZXJyZWRzLmxlbmd0aDsgbiA+IHQ7IHQrKykge1xuICAgICAgaShlLCBlLl9kZWZlcnJlZHNbdF0pO1xuICAgIH1cblxuICAgIGUuX2RlZmVycmVkcyA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBsKGUsIHQpIHtcbiAgICB2YXIgbiA9ICExO1xuXG4gICAgdHJ5IHtcbiAgICAgIGUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgbiB8fCAobiA9ICEwLCBmKHQsIGUpKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIG4gfHwgKG4gPSAhMCwgdSh0LCBlKSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChvKSB7XG4gICAgICBpZiAobikgcmV0dXJuO1xuICAgICAgbiA9ICEwLCB1KHQsIG8pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBhID0gc2V0VGltZW91dDtcbiAgci5wcm90b3R5cGVbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBlKTtcbiAgfSwgci5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChlLCB0KSB7XG4gICAgdmFyIG4gPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvKTtcbiAgICByZXR1cm4gaSh0aGlzLCBuZXcgZnVuY3Rpb24gKGUsIHQsIG4pIHtcbiAgICAgIHRoaXMub25GdWxmaWxsZWQgPSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGUgPyBlIDogbnVsbCwgdGhpcy5vblJlamVjdGVkID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiB0ID8gdCA6IG51bGwsIHRoaXMucHJvbWlzZSA9IG47XG4gICAgfShlLCB0LCBuKSksIG47XG4gIH0sIHIucHJvdG90eXBlW1wiZmluYWxseVwiXSA9IGUsIHIuYWxsID0gZnVuY3Rpb24gKGUpIHtcbiAgICByZXR1cm4gbmV3IHIoZnVuY3Rpb24gKHQsIG8pIHtcbiAgICAgIGZ1bmN0aW9uIHIoZSwgbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChuICYmIChcIm9iamVjdFwiID09IF90eXBlb2YobikgfHwgXCJmdW5jdGlvblwiID09IHR5cGVvZiBuKSkge1xuICAgICAgICAgICAgdmFyIHUgPSBuLnRoZW47XG4gICAgICAgICAgICBpZiAoXCJmdW5jdGlvblwiID09IHR5cGVvZiB1KSByZXR1cm4gdm9pZCB1LmNhbGwobiwgZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgcihlLCB0KTtcbiAgICAgICAgICAgIH0sIG8pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlbZV0gPSBuLCAwID09IC0tZiAmJiB0KGkpO1xuICAgICAgICB9IGNhdGNoIChjKSB7XG4gICAgICAgICAgbyhjKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIW4oZSkpIHJldHVybiBvKG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlLmFsbCBhY2NlcHRzIGFuIGFycmF5XCIpKTtcbiAgICAgIHZhciBpID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZSk7XG4gICAgICBpZiAoMCA9PT0gaS5sZW5ndGgpIHJldHVybiB0KFtdKTtcblxuICAgICAgZm9yICh2YXIgZiA9IGkubGVuZ3RoLCB1ID0gMDsgaS5sZW5ndGggPiB1OyB1KyspIHtcbiAgICAgICAgcih1LCBpW3VdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSwgci5hbGxTZXR0bGVkID0gdCwgci5yZXNvbHZlID0gZnVuY3Rpb24gKGUpIHtcbiAgICByZXR1cm4gZSAmJiBcIm9iamVjdFwiID09IF90eXBlb2YoZSkgJiYgZS5jb25zdHJ1Y3RvciA9PT0gciA/IGUgOiBuZXcgcihmdW5jdGlvbiAodCkge1xuICAgICAgdChlKTtcbiAgICB9KTtcbiAgfSwgci5yZWplY3QgPSBmdW5jdGlvbiAoZSkge1xuICAgIHJldHVybiBuZXcgcihmdW5jdGlvbiAodCwgbikge1xuICAgICAgbihlKTtcbiAgICB9KTtcbiAgfSwgci5yYWNlID0gZnVuY3Rpb24gKGUpIHtcbiAgICByZXR1cm4gbmV3IHIoZnVuY3Rpb24gKHQsIG8pIHtcbiAgICAgIGlmICghbihlKSkgcmV0dXJuIG8obmV3IFR5cGVFcnJvcihcIlByb21pc2UucmFjZSBhY2NlcHRzIGFuIGFycmF5XCIpKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGYgPSBlLmxlbmd0aDsgZiA+IGk7IGkrKykge1xuICAgICAgICByLnJlc29sdmUoZVtpXSkudGhlbih0LCBvKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSwgci5faW1tZWRpYXRlRm4gPSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHNldEltbWVkaWF0ZSAmJiBmdW5jdGlvbiAoZSkge1xuICAgIHNldEltbWVkaWF0ZShlKTtcbiAgfSB8fCBmdW5jdGlvbiAoZSkge1xuICAgIGEoZSwgMCk7XG4gIH0sIHIuX3VuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gKGUpIHtcbiAgICB2b2lkIDAgIT09IGNvbnNvbGUgJiYgY29uc29sZSAmJiBjb25zb2xlLndhcm4oXCJQb3NzaWJsZSBVbmhhbmRsZWQgUHJvbWlzZSBSZWplY3Rpb246XCIsIGUpO1xuICB9O1xuXG4gIHZhciBzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBzZWxmKSByZXR1cm4gc2VsZjtcbiAgICBpZiAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2Ygd2luZG93KSByZXR1cm4gd2luZG93O1xuICAgIGlmIChcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBnbG9iYWwpIHJldHVybiBnbG9iYWw7XG4gICAgdGhyb3cgRXJyb3IoXCJ1bmFibGUgdG8gbG9jYXRlIGdsb2JhbCBvYmplY3RcIik7XG4gIH0oKTtcblxuICBcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIHMuUHJvbWlzZSA/IHMuUHJvbWlzZSA9IHIgOiAocy5Qcm9taXNlLnByb3RvdHlwZVtcImZpbmFsbHlcIl0gfHwgKHMuUHJvbWlzZS5wcm90b3R5cGVbXCJmaW5hbGx5XCJdID0gZSksIHMuUHJvbWlzZS5hbGxTZXR0bGVkIHx8IChzLlByb21pc2UuYWxsU2V0dGxlZCA9IHQpKTtcbn0pOyAvL9C/0L7Qu9C40YTQuNC7INC00LvRjyBhc3NpZ247XG5cbmlmICh0eXBlb2YgT2JqZWN0LmFzc2lnbiAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdCwgXCJhc3NpZ25cIiwge1xuICAgIHZhbHVlOiBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCB2YXJBcmdzKSB7XG4gICAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgICAgaWYgKHRhcmdldCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3RcIik7XG4gICAgICB9XG5cbiAgICAgIHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuXG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XG5cbiAgICAgICAgaWYgKG5leHRTb3VyY2UgIT0gbnVsbCkge1xuICAgICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gbmV4dFNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChuZXh0U291cmNlLCBuZXh0S2V5KSkge1xuICAgICAgICAgICAgICB0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0bztcbiAgICB9LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbn0gLy8g0L/QvtC70LjRhNC40Lsg0LTQu9GPIGZpbmRcblxuXG5pZiAoIUFycmF5LnByb3RvdHlwZS5maW5kKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICdmaW5kJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZShwcmVkaWNhdGUpIHtcbiAgICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ0aGlzXCIgaXMgbnVsbCBvciBub3QgZGVmaW5lZCcpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbyA9IE9iamVjdCh0aGlzKTtcbiAgICAgIHZhciBsZW4gPSBvLmxlbmd0aCA+Pj4gMDtcblxuICAgICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncHJlZGljYXRlIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIHZhciBrID0gMDtcblxuICAgICAgd2hpbGUgKGsgPCBsZW4pIHtcbiAgICAgICAgdmFyIGtWYWx1ZSA9IG9ba107XG5cbiAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKHRoaXNBcmcsIGtWYWx1ZSwgaywgbykpIHtcbiAgICAgICAgICByZXR1cm4ga1ZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaysrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSk7XG59IC8vINC/0L7Qu9C40YTQuNC7INC90LAg0YTQtdGC0Ydcbi8vIG15RmV0Y2goLy9wYXJhbWV0ZXJzLi4uKS50aGVuKC8vLi4uLi4uINC60L7QtCDQutC+0YLQvtGA0YvQuSDRgyDQktCw0YEg0LIgdGhlbikuXG5cblxuZnVuY3Rpb24gaWVGZXRjaChwYXJhbXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4ocGFyYW1zLm1ldGhvZCwgcGFyYW1zLnVybCwgdHJ1ZSk7XG4gICAgeGhyLnNlbmQoKTtcbiAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigncmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgIT0gNCkgcmV0dXJuO1xuXG4gICAgICBpZiAoeGhyLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgcmVzb2x2ZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdCh4aHIuc3RhdHVzVGV4dCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSJdLCJmaWxlIjoicG9saWZpbC5qcyJ9

Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value;
};
