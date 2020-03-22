/*
**  HUDS -- Head-Up-Display Server (HUDS)
**  Copyright (c) 2020 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.HUDS = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
"use strict";var has=Object.prototype.hasOwnProperty,prefix="~";function Events(){}function EE(e,t,n){this.fn=e,this.context=t,this.once=n||!1}function addListener(e,t,n,r,i){if("function"!=typeof n)throw new TypeError("The listener must be a function");var o=new EE(n,r||e,i),s=prefix?prefix+t:t;return e._events[s]?e._events[s].fn?e._events[s]=[e._events[s],o]:e._events[s].push(o):(e._events[s]=o,e._eventsCount++),e}function clearEvent(e,t){0==--e._eventsCount?e._events=new Events:delete e._events[t]}function EventEmitter(){this._events=new Events,this._eventsCount=0}Object.create&&(Events.prototype=Object.create(null),(new Events).__proto__||(prefix=!1)),EventEmitter.prototype.eventNames=function(){var e,t,n=[];if(0===this._eventsCount)return n;for(t in e=this._events)has.call(e,t)&&n.push(prefix?t.slice(1):t);return Object.getOwnPropertySymbols?n.concat(Object.getOwnPropertySymbols(e)):n},EventEmitter.prototype.listeners=function(e){var t=prefix?prefix+e:e,n=this._events[t];if(!n)return[];if(n.fn)return[n.fn];for(var r=0,i=n.length,o=new Array(i);r<i;r++)o[r]=n[r].fn;return o},EventEmitter.prototype.listenerCount=function(e){var t=prefix?prefix+e:e,n=this._events[t];return n?n.fn?1:n.length:0},EventEmitter.prototype.emit=function(e,t,n,r,i,o){var s=prefix?prefix+e:e;if(!this._events[s])return!1;var f,c,v=this._events[s],a=arguments.length;if(v.fn){switch(v.once&&this.removeListener(e,v.fn,void 0,!0),a){case 1:return v.fn.call(v.context),!0;case 2:return v.fn.call(v.context,t),!0;case 3:return v.fn.call(v.context,t,n),!0;case 4:return v.fn.call(v.context,t,n,r),!0;case 5:return v.fn.call(v.context,t,n,r,i),!0;case 6:return v.fn.call(v.context,t,n,r,i,o),!0}for(c=1,f=new Array(a-1);c<a;c++)f[c-1]=arguments[c];v.fn.apply(v.context,f)}else{var p,l=v.length;for(c=0;c<l;c++)switch(v[c].once&&this.removeListener(e,v[c].fn,void 0,!0),a){case 1:v[c].fn.call(v[c].context);break;case 2:v[c].fn.call(v[c].context,t);break;case 3:v[c].fn.call(v[c].context,t,n);break;case 4:v[c].fn.call(v[c].context,t,n,r);break;default:if(!f)for(p=1,f=new Array(a-1);p<a;p++)f[p-1]=arguments[p];v[c].fn.apply(v[c].context,f)}}return!0},EventEmitter.prototype.on=function(e,t,n){return addListener(this,e,t,n,!1)},EventEmitter.prototype.once=function(e,t,n){return addListener(this,e,t,n,!0)},EventEmitter.prototype.removeListener=function(e,t,n,r){var i=prefix?prefix+e:e;if(!this._events[i])return this;if(!t)return clearEvent(this,i),this;var o=this._events[i];if(o.fn)o.fn!==t||r&&!o.once||n&&o.context!==n||clearEvent(this,i);else{for(var s=0,f=[],c=o.length;s<c;s++)(o[s].fn!==t||r&&!o[s].once||n&&o[s].context!==n)&&f.push(o[s]);f.length?this._events[i]=1===f.length?f[0]:f:clearEvent(this,i)}return this},EventEmitter.prototype.removeAllListeners=function(e){var t;return e?(t=prefix?prefix+e:e,this._events[t]&&clearEvent(this,t)):(this._events=new Events,this._eventsCount=0),this},EventEmitter.prototype.off=EventEmitter.prototype.removeListener,EventEmitter.prototype.addListener=EventEmitter.prototype.on,EventEmitter.prefixed=prefix,EventEmitter.EventEmitter=EventEmitter,"undefined"!=typeof module&&(module.exports=EventEmitter);
},{}],2:[function(_dereq_,module,exports){
"use strict";var extendStatics=function(e,t){return(extendStatics=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)};function __extends(e,t){function n(){this.constructor=e}extendStatics(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}function __values(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}}function __read(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var o,r,i=n.call(e),s=[];try{for(;(void 0===t||t-- >0)&&!(o=i.next()).done;)s.push(o.value)}catch(e){r={error:e}}finally{try{o&&!o.done&&(n=i.return)&&n.call(i)}finally{if(r)throw r.error}}return s}function __spread(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(__read(arguments[t]));return e}var Event=function(){return function(e,t){this.target=t,this.type=e}}(),ErrorEvent=function(e){function t(t,n){var o=e.call(this,"error",n)||this;return o.message=t.message,o.error=t,o}return __extends(t,e),t}(Event),CloseEvent=function(e){function t(t,n,o){void 0===t&&(t=1e3),void 0===n&&(n="");var r=e.call(this,"close",o)||this;return r.wasClean=!0,r.code=t,r.reason=n,r}return __extends(t,e),t}(Event),getGlobalWebSocket=function(){if("undefined"!=typeof WebSocket)return WebSocket},isWebSocket=function(e){return void 0!==e&&!!e&&2===e.CLOSING},DEFAULT={maxReconnectionDelay:1e4,minReconnectionDelay:1e3+4e3*Math.random(),minUptime:5e3,reconnectionDelayGrowFactor:1.3,connectionTimeout:4e3,maxRetries:1/0,maxEnqueuedMessages:1/0,startClosed:!1,debug:!1},ReconnectingWebSocket=function(){function e(e,t,n){var o=this;void 0===n&&(n={}),this._listeners={error:[],message:[],open:[],close:[]},this._retryCount=-1,this._shouldReconnect=!0,this._connectLock=!1,this._binaryType="blob",this._closeCalled=!1,this._messageQueue=[],this.onclose=null,this.onerror=null,this.onmessage=null,this.onopen=null,this._handleOpen=function(e){o._debug("open event");var t=o._options.minUptime,n=void 0===t?DEFAULT.minUptime:t;clearTimeout(o._connectTimeout),o._uptimeTimeout=setTimeout(function(){return o._acceptOpen()},n),o._ws.binaryType=o._binaryType,o._messageQueue.forEach(function(e){return o._ws.send(e)}),o._messageQueue=[],o.onopen&&o.onopen(e),o._listeners.open.forEach(function(t){return o._callEventListener(e,t)})},this._handleMessage=function(e){o._debug("message event"),o.onmessage&&o.onmessage(e),o._listeners.message.forEach(function(t){return o._callEventListener(e,t)})},this._handleError=function(e){o._debug("error event",e.message),o._disconnect(void 0,"TIMEOUT"===e.message?"timeout":void 0),o.onerror&&o.onerror(e),o._debug("exec error listeners"),o._listeners.error.forEach(function(t){return o._callEventListener(e,t)}),o._connect()},this._handleClose=function(e){o._debug("close event"),o._clearTimeouts(),o._shouldReconnect&&o._connect(),o.onclose&&o.onclose(e),o._listeners.close.forEach(function(t){return o._callEventListener(e,t)})},this._url=e,this._protocols=t,this._options=n,this._options.startClosed&&(this._shouldReconnect=!1),this._connect()}return Object.defineProperty(e,"CONNECTING",{get:function(){return 0},enumerable:!0,configurable:!0}),Object.defineProperty(e,"OPEN",{get:function(){return 1},enumerable:!0,configurable:!0}),Object.defineProperty(e,"CLOSING",{get:function(){return 2},enumerable:!0,configurable:!0}),Object.defineProperty(e,"CLOSED",{get:function(){return 3},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"CONNECTING",{get:function(){return e.CONNECTING},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"OPEN",{get:function(){return e.OPEN},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"CLOSING",{get:function(){return e.CLOSING},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"CLOSED",{get:function(){return e.CLOSED},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"binaryType",{get:function(){return this._ws?this._ws.binaryType:this._binaryType},set:function(e){this._binaryType=e,this._ws&&(this._ws.binaryType=e)},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"retryCount",{get:function(){return Math.max(this._retryCount,0)},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"bufferedAmount",{get:function(){return this._messageQueue.reduce(function(e,t){return"string"==typeof t?e+=t.length:t instanceof Blob?e+=t.size:e+=t.byteLength,e},0)+(this._ws?this._ws.bufferedAmount:0)},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"extensions",{get:function(){return this._ws?this._ws.extensions:""},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"protocol",{get:function(){return this._ws?this._ws.protocol:""},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"readyState",{get:function(){return this._ws?this._ws.readyState:this._options.startClosed?e.CLOSED:e.CONNECTING},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"url",{get:function(){return this._ws?this._ws.url:""},enumerable:!0,configurable:!0}),e.prototype.close=function(e,t){void 0===e&&(e=1e3),this._closeCalled=!0,this._shouldReconnect=!1,this._clearTimeouts(),this._ws?this._ws.readyState!==this.CLOSED?this._ws.close(e,t):this._debug("close: already closed"):this._debug("close enqueued: no ws instance")},e.prototype.reconnect=function(e,t){this._shouldReconnect=!0,this._closeCalled=!1,this._retryCount=-1,this._ws&&this._ws.readyState!==this.CLOSED?(this._disconnect(e,t),this._connect()):this._connect()},e.prototype.send=function(e){if(this._ws&&this._ws.readyState===this.OPEN)this._debug("send",e),this._ws.send(e);else{var t=this._options.maxEnqueuedMessages,n=void 0===t?DEFAULT.maxEnqueuedMessages:t;this._messageQueue.length<n&&(this._debug("enqueue",e),this._messageQueue.push(e))}},e.prototype.addEventListener=function(e,t){this._listeners[e]&&this._listeners[e].push(t)},e.prototype.dispatchEvent=function(e){var t,n,o=this._listeners[e.type];if(o)try{for(var r=__values(o),i=r.next();!i.done;i=r.next()){var s=i.value;this._callEventListener(e,s)}}catch(e){t={error:e}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(t)throw t.error}}return!0},e.prototype.removeEventListener=function(e,t){this._listeners[e]&&(this._listeners[e]=this._listeners[e].filter(function(e){return e!==t}))},e.prototype._debug=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];this._options.debug&&console.log.apply(console,__spread(["RWS>"],e))},e.prototype._getNextDelay=function(){var e=this._options,t=e.reconnectionDelayGrowFactor,n=void 0===t?DEFAULT.reconnectionDelayGrowFactor:t,o=e.minReconnectionDelay,r=void 0===o?DEFAULT.minReconnectionDelay:o,i=e.maxReconnectionDelay,s=void 0===i?DEFAULT.maxReconnectionDelay:i,c=0;return this._retryCount>0&&(c=r*Math.pow(n,this._retryCount-1))>s&&(c=s),this._debug("next delay",c),c},e.prototype._wait=function(){var e=this;return new Promise(function(t){setTimeout(t,e._getNextDelay())})},e.prototype._getNextUrl=function(e){if("string"==typeof e)return Promise.resolve(e);if("function"==typeof e){var t=e();if("string"==typeof t)return Promise.resolve(t);if(t.then)return t}throw Error("Invalid URL")},e.prototype._connect=function(){var e=this;if(!this._connectLock&&this._shouldReconnect){this._connectLock=!0;var t=this._options,n=t.maxRetries,o=void 0===n?DEFAULT.maxRetries:n,r=t.connectionTimeout,i=void 0===r?DEFAULT.connectionTimeout:r,s=t.WebSocket,c=void 0===s?getGlobalWebSocket():s;if(this._retryCount>=o)this._debug("max retries reached",this._retryCount,">=",o);else{if(this._retryCount++,this._debug("connect",this._retryCount),this._removeListeners(),!isWebSocket(c))throw Error("No valid WebSocket class provided");this._wait().then(function(){return e._getNextUrl(e._url)}).then(function(t){e._closeCalled||(e._debug("connect",{url:t,protocols:e._protocols}),e._ws=e._protocols?new c(t,e._protocols):new c(t),e._ws.binaryType=e._binaryType,e._connectLock=!1,e._addListeners(),e._connectTimeout=setTimeout(function(){return e._handleTimeout()},i))})}}},e.prototype._handleTimeout=function(){this._debug("timeout event"),this._handleError(new ErrorEvent(Error("TIMEOUT"),this))},e.prototype._disconnect=function(e,t){if(void 0===e&&(e=1e3),this._clearTimeouts(),this._ws){this._removeListeners();try{this._ws.close(e,t),this._handleClose(new CloseEvent(e,t,this))}catch(e){}}},e.prototype._acceptOpen=function(){this._debug("accept open"),this._retryCount=0},e.prototype._callEventListener=function(e,t){"handleEvent"in t?t.handleEvent(e):t(e)},e.prototype._removeListeners=function(){this._ws&&(this._debug("removeListeners"),this._ws.removeEventListener("open",this._handleOpen),this._ws.removeEventListener("close",this._handleClose),this._ws.removeEventListener("message",this._handleMessage),this._ws.removeEventListener("error",this._handleError))},e.prototype._addListeners=function(){this._ws&&(this._debug("addListeners"),this._ws.addEventListener("open",this._handleOpen),this._ws.addEventListener("close",this._handleClose),this._ws.addEventListener("message",this._handleMessage),this._ws.addEventListener("error",this._handleError))},e.prototype._clearTimeouts=function(){clearTimeout(this._connectTimeout),clearTimeout(this._uptimeTimeout)},e}();module.exports=ReconnectingWebSocket;
},{}],3:[function(_dereq_,module,exports){
"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function _slicedToArray(t,e){return _arrayWithHoles(t)||_iterableToArrayLimit(t,e)||_unsupportedIterableToArray(t,e)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(t,e){if(t){if("string"==typeof t)return _arrayLikeToArray(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(r):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(t,e):void 0}}function _arrayLikeToArray(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function _iterableToArrayLimit(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var r=[],n=!0,o=!1,i=void 0;try{for(var c,a=t[Symbol.iterator]();!(n=(c=a.next()).done)&&(r.push(c.value),!e||r.length!==e);n=!0);}catch(t){o=!0,i=t}finally{try{n||null==a.return||a.return()}finally{if(o)throw i}}return r}}function _arrayWithHoles(t){if(Array.isArray(t))return t}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function _createClass(t,e,r){return e&&_defineProperties(t.prototype,e),r&&_defineProperties(t,r),t}function _createSuper(t){return function(){var e,r=_getPrototypeOf(t);if(_isNativeReflectConstruct()){var n=_getPrototypeOf(this).constructor;e=Reflect.construct(r,arguments,n)}else e=r.apply(this,arguments);return _possibleConstructorReturn(this,e)}}function _possibleConstructorReturn(t,e){return!e||"object"!==_typeof(e)&&"function"!=typeof e?_assertThisInitialized(t):e}function _assertThisInitialized(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],function(){})),!0}catch(t){return!1}}function _getPrototypeOf(t){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&_setPrototypeOf(t,e)}function _setPrototypeOf(t,e){return(_setPrototypeOf=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var EventEmitter=_dereq_("eventemitter3"),WebSocket=_dereq_("reconnecting-websocket"),HUDS=function(t){_inherits(r,EventEmitter);var e=_createSuper(r);function r(){var t;_classCallCheck(this,r),t=e.call(this);var n="";"http:"===document.location.protocol?n+="ws:":"https:"===document.location.protocol&&(n+="wss:"),n+="//",n+=document.location.host,n+=document.location.pathname,n+="event",t.url=n;var o=document.location.pathname.match(/([^/]+)\/$/);return t.id=o[1],t.ws=null,t.data={},t}return _createClass(r,[{key:"connect",value:function(){var t=this;this.disconnect(),this.emit("connect",this.url),this.ws=new WebSocket(this.url),this.ws.addEventListener("open",function(e){t.emit("open",e)}),this.ws.addEventListener("close",function(e){t.emit("close",e)}),this.ws.addEventListener("error",function(e){t.emit("error",e)}),this.ws.addEventListener("message",function(e){""!==e.data&&t.emit("receive",e.data)})}},{key:"disconnect",value:function(){this.emit("disconnect",this.url),null!==this.ws&&this.ws.close()}},{key:"send",value:function(t,e){if(null===this.ws)throw new Error("not connected");this.emit("send","".concat(t,"=").concat(e)),this.ws.send("".concat(t,"=").concat(e))}},{key:"bind",value:function(t,e,r){this.on("receive",function(n){var o=n.match(/^([^.]+)\.([^=]+)=(.*)$/);if(null!==o){var i=_slicedToArray(o,4),c=i[1],a=i[2],s=i[3];c===t&&e.indexOf(a)>=0&&r(a,s)}})}},{key:"config",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if((t=Object.assign({},{flat:!1,sep:"."},t)).flat){var e={};return function r(n,o){if("object"===_typeof(o)&&o instanceof Array&&null!==o)for(var i=0;i<o.length;i++)r(n.concat([i]),o[i]);else if("object"===_typeof(o)&&null!==o)for(var c=0,a=Object.keys(o);c<a.length;c++){var s=a[c];r(n.concat([s]),o[s])}else e[n.join(t.sep)]=o}([],r._config),e}return r._config}}],[{key:"config",value:function(t){r._config=t}}]),r}();module.exports=HUDS;
},{"eventemitter3":1,"reconnecting-websocket":2}]},{},[3])(3)
});
