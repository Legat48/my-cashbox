"use strict";

function _typeof2(obj) { "@babel/helpers - typeof"; return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof2(obj); }

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
} //полифил для remove()


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
  var runListeners = function runListeners(oEvent) {
    if (!oEvent) {
      oEvent = window.event;
    }

    for (var iLstId = 0, iElId = 0, oEvtListeners = oListeners[oEvent.type]; iElId < oEvtListeners.aEls.length; iElId++) {
      if (oEvtListeners.aEls[iElId] === this) {
        for (iLstId; iLstId < oEvtListeners.aEvts[iElId].length; iLstId++) {
          oEvtListeners.aEvts[iElId][iLstId].call(this, oEvent);
        }

        break;
      }
    }
  };

  var oListeners = {};

  Element.prototype.addEventListener = function (sEventType, fListener
  /*, useCapture (will be ignored!) */
  ) {
    if (oListeners.hasOwnProperty(sEventType)) {
      var oEvtListeners = oListeners[sEventType];

      for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
        if (oEvtListeners.aEls[iElId] === this) {
          nElIdx = iElId;
          break;
        }
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
          if (aElListeners[iLstId] === fListener) {
            return;
          }
        }

        aElListeners.push(fListener);
      }
    } else {
      oListeners[sEventType] = {
        aEls: [this],
        aEvts: [[fListener]]
      };
      this["on" + sEventType] = runListeners;
    }
  };

  Element.prototype.removeEventListener = function (sEventType, fListener
  /*, useCapture (will be ignored!) */
  ) {
    if (!oListeners.hasOwnProperty(sEventType)) {
      return;
    }

    var oEvtListeners = oListeners[sEventType];

    for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
      if (oEvtListeners.aEls[iElId] === this) {
        nElIdx = iElId;
        break;
      }
    }

    if (nElIdx === -1) {
      return;
    }

    for (var iLstId = 0, aElListeners = oEvtListeners.aEvts[nElIdx]; iLstId < aElListeners.length; iLstId++) {
      if (aElListeners[iLstId] === fListener) {
        aElListeners.splice(iLstId, 1);
      }
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
} // полифил для промис


!function (e, t) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof2(exports)) && "undefined" != typeof module ? t() : "function" == typeof define && define.amd ? define(t) : t();
}(0, function () {
  "use strict";

  function e(e) {
    var t = this.constructor;
    return this.then(function (n) {
      return t.resolve(e()).then(function () {
        return n;
      });
    }, function (n) {
      return t.resolve(e()).then(function () {
        return t.reject(n);
      });
    });
  }

  function t(e) {
    return new this(function (t, n) {
      function o(e, n) {
        if (n && ("object" == _typeof2(n) || "function" == typeof n)) {
          var f = n.then;
          if ("function" == typeof f) return void f.call(n, function (t) {
            o(e, t);
          }, function (n) {
            r[e] = {
              status: "rejected",
              reason: n
            }, 0 == --i && t(r);
          });
        }

        r[e] = {
          status: "fulfilled",
          value: n
        }, 0 == --i && t(r);
      }

      if (!e || "undefined" == typeof e.length) return n(new TypeError(_typeof2(e) + " " + e + " is not iterable(cannot read property Symbol(Symbol.iterator))"));
      var r = Array.prototype.slice.call(e);
      if (0 === r.length) return t([]);

      for (var i = r.length, f = 0; r.length > f; f++) {
        o(f, r[f]);
      }
    });
  }

  function n(e) {
    return !(!e || "undefined" == typeof e.length);
  }

  function o() {}

  function r(e) {
    if (!(this instanceof r)) throw new TypeError("Promises must be constructed via new");
    if ("function" != typeof e) throw new TypeError("not a function");
    this._state = 0, this._handled = !1, this._value = undefined, this._deferreds = [], l(e, this);
  }

  function i(e, t) {
    for (; 3 === e._state;) {
      e = e._value;
    }

    0 !== e._state ? (e._handled = !0, r._immediateFn(function () {
      var n = 1 === e._state ? t.onFulfilled : t.onRejected;

      if (null !== n) {
        var o;

        try {
          o = n(e._value);
        } catch (r) {
          return void u(t.promise, r);
        }

        f(t.promise, o);
      } else (1 === e._state ? f : u)(t.promise, e._value);
    })) : e._deferreds.push(t);
  }

  function f(e, t) {
    try {
      if (t === e) throw new TypeError("A promise cannot be resolved with itself.");

      if (t && ("object" == _typeof2(t) || "function" == typeof t)) {
        var n = t.then;
        if (t instanceof r) return e._state = 3, e._value = t, void c(e);
        if ("function" == typeof n) return void l(function (e, t) {
          return function () {
            e.apply(t, arguments);
          };
        }(n, t), e);
      }

      e._state = 1, e._value = t, c(e);
    } catch (o) {
      u(e, o);
    }
  }

  function u(e, t) {
    e._state = 2, e._value = t, c(e);
  }

  function c(e) {
    2 === e._state && 0 === e._deferreds.length && r._immediateFn(function () {
      e._handled || r._unhandledRejectionFn(e._value);
    });

    for (var t = 0, n = e._deferreds.length; n > t; t++) {
      i(e, e._deferreds[t]);
    }

    e._deferreds = null;
  }

  function l(e, t) {
    var n = !1;

    try {
      e(function (e) {
        n || (n = !0, f(t, e));
      }, function (e) {
        n || (n = !0, u(t, e));
      });
    } catch (o) {
      if (n) return;
      n = !0, u(t, o);
    }
  }

  var a = setTimeout;
  r.prototype["catch"] = function (e) {
    return this.then(null, e);
  }, r.prototype.then = function (e, t) {
    var n = new this.constructor(o);
    return i(this, new function (e, t, n) {
      this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof t ? t : null, this.promise = n;
    }(e, t, n)), n;
  }, r.prototype["finally"] = e, r.all = function (e) {
    return new r(function (t, o) {
      function r(e, n) {
        try {
          if (n && ("object" == _typeof2(n) || "function" == typeof n)) {
            var u = n.then;
            if ("function" == typeof u) return void u.call(n, function (t) {
              r(e, t);
            }, o);
          }

          i[e] = n, 0 == --f && t(i);
        } catch (c) {
          o(c);
        }
      }

      if (!n(e)) return o(new TypeError("Promise.all accepts an array"));
      var i = Array.prototype.slice.call(e);
      if (0 === i.length) return t([]);

      for (var f = i.length, u = 0; i.length > u; u++) {
        r(u, i[u]);
      }
    });
  }, r.allSettled = t, r.resolve = function (e) {
    return e && "object" == _typeof2(e) && e.constructor === r ? e : new r(function (t) {
      t(e);
    });
  }, r.reject = function (e) {
    return new r(function (t, n) {
      n(e);
    });
  }, r.race = function (e) {
    return new r(function (t, o) {
      if (!n(e)) return o(new TypeError("Promise.race accepts an array"));

      for (var i = 0, f = e.length; f > i; i++) {
        r.resolve(e[i]).then(t, o);
      }
    });
  }, r._immediateFn = "function" == typeof setImmediate && function (e) {
    setImmediate(e);
  } || function (e) {
    a(e, 0);
  }, r._unhandledRejectionFn = function (e) {
    void 0 !== console && console && console.warn("Possible Unhandled Promise Rejection:", e);
  };

  var s = function () {
    if ("undefined" != typeof self) return self;
    if ("undefined" != typeof window) return window;
    if ("undefined" != typeof global) return global;
    throw Error("unable to locate global object");
  }();

  "function" != typeof s.Promise ? s.Promise = r : (s.Promise.prototype["finally"] || (s.Promise.prototype["finally"] = e), s.Promise.allSettled || (s.Promise.allSettled = t));
}); //полифил для assign;

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
} // полифил для find


if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function value(predicate) {
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

    if (params.headerApikey) {
      xhr.setRequestHeader(params.headerApikey, params.key);
    }

    if (params.headerUserToken) {
      xhr.setRequestHeader(params.headerUserToken, params.token);
    }

    if (params.headerType) {
      xhr.setRequestHeader(params.headerType, params.type);
    }

    if (params.send) {
      xhr.send(params.send);
    } else {
      xhr.send();
    } // popup(JSON.stringify(params))


    xhr.addEventListener('readystatechange', function (e) {
      if (xhr.readyState !== 4) return;

      if (xhr.status == 200) {
        resolve(xhr.responseText); //  alert(JSON.stringify(xhr.responseText))
      } else {
        reject('Не получен ответ от сервера' + xhr.statusText); //  alert(JSON.stringify(xhr.statusText))
      }
    });
  });
}

Number.isInteger = Number.isInteger || function (value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};