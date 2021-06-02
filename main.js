/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/App.js":
/*!********************!*\
  !*** ./src/App.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./component */ "./src/component.js");
/* harmony import */ var _pages__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages */ "./src/pages/index.js");
/* harmony import */ var _Router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Router */ "./src/Router.js");




const routes = [
  {
    path: '/',
    name: 'Home',
    component: _pages__WEBPACK_IMPORTED_MODULE_1__.Home,
  },
  {
    path: '/menu',
    name: 'Menu',
    component: _pages__WEBPACK_IMPORTED_MODULE_1__.Menu,
  },
  {
    path: '/contact',
    name: 'Contact',
    component: _pages__WEBPACK_IMPORTED_MODULE_1__.Contact,
  },
];

const App = () => _component__WEBPACK_IMPORTED_MODULE_0__.html`<div>
    <ul>
      ${routes.map(
        (route) => `<li><a href="#${route.path}">${route.name}</a></li>`
      )}
    </ul>
  </div>
  ${(0,_Router__WEBPACK_IMPORTED_MODULE_2__.default)(routes, _pages__WEBPACK_IMPORTED_MODULE_1__.Error)}`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);


/***/ }),

/***/ "./src/Router.js":
/*!***********************!*\
  !*** ./src/Router.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./component */ "./src/component.js");
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event */ "./src/event.js");



// Will only render one component at a time
const Router = (routes, error) => {
  const currentLocation = (0,_component__WEBPACK_IMPORTED_MODULE_0__.createState)(
    window.location.hash.replace('#', '') || '/'
  );

  _event__WEBPACK_IMPORTED_MODULE_1__.default.on('hashchange', (path) => {
    currentLocation.value = path;
  });

  const changeContent = (path) => {
    const route = routes.find((route) => route.path === path);

    if (!route || !route.component) {
      return error.call(null);
    }

    return route.component.call(null);
  };

  return _component__WEBPACK_IMPORTED_MODULE_0__.html`
    <div ${{ $content: currentLocation.bindValue(changeContent) }}></div>
  `;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Router);


/***/ }),

/***/ "./src/component.js":
/*!**************************!*\
  !*** ./src/component.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "html": () => (/* binding */ html),
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "createElementFromString": () => (/* binding */ createElementFromString),
/* harmony export */   "createState": () => (/* binding */ createState)
/* harmony export */ });
const uuid = (length = 12) => Math.random().toString(36).substr(2, length);

const stateStore = new Map();
const defaultProps = ['textContent', 'innerHTML', 'outerHTML', 'innerText'];
const booleanAttributes = [
  'checked',
  'selected',
  'disabled',
  'readonly',
  'multiple',
  'ismap',
  'noresize',
  'reversed',
  'autocomplete',
];

const isObject = (val) => typeof val === 'object';
const isArray = (val) => Array.isArray(val);
const isTemplate = (val) => val._type && val._type === 'template';
const isEventListeners = (val) =>
  isObject(val) && Object.keys(val).every((key) => key.startsWith('on'));
const isState = (val) =>
  isObject(val) && Object.keys(val).every((key) => key.startsWith('$'));
const isBooleanAttribute = (val) => booleanAttributes.includes(val);
const isStyleAttribute = (str) => str.startsWith('$style:');
const isDefaultProps = (val) =>
  isObject(val) && Object.keys(val).every((key) => defaultProps.includes(key));

const _handlerTypeReducer = (str) => {
  let type;
  if (defaultProps.includes(str.replace('$', ''))) {
    type = 'prop';
  } else if (isStyleAttribute(str)) {
    type = 'style';
  } else if (str.replace('$', '') === 'content') {
    type = 'content';
  } else {
    type = 'attr';
  }

  return type;
};

const _handlerValueReducer = (type, obj) => {
  switch (type) {
    case 'listener':
      return {
        name: obj[0].replace('on', '').toLowerCase(),
        value: obj[1],
      };
    case 'prop':
      return {
        name: obj[0].replace('$', ''),
        value: obj[1],
      };
    case 'attr':
      return {
        name: obj[0].replace('$', ''),
        value: obj[1],
      };
    case 'style':
      return {
        name: obj[0],
        value: obj[1],
      };
    case 'text':
      return {
        value: obj[1],
      };
    case 'content':
      return {
        value: obj[1],
      };
    default:
      throw new Error('Invalid handler type.');
  }
};

const _generateHandler = (type, obj) => {
  const arr = [];
  const id = uuid();
  const attrName = `data-${type}-id`;
  const dataAttr = `${attrName}="${id}"`;

  Object.entries(obj).forEach((item) => {
    arr.push({
      type,
      query: `[${dataAttr}]`,
      data: _handlerValueReducer(type, item),
      attr: attrName,
      remove: false,
    });
  });

  arr[arr.length - 1].remove = true;

  return [arr, dataAttr];
};

const _bindState = (state) => {
  const id = uuid();
  const proxyId = `data-proxy-id="${id}"`;
  const handlers = {};

  Object.entries(state).forEach(([key, handler]) => {
    const bindedElements = stateStore.get(handler._id);
    const existingHandlers = bindedElements.get(id) || [];

    const finalValue = handler.trap
      ? handler.trap.call(null, handler.value)
      : handler.value;
    const target = key.replace('$style:', '').replace('$', '');
    const type = _handlerTypeReducer(key);

    // Store the new handlers
    bindedElements.set(id, [
      ...existingHandlers,
      {
        type,
        target,
        propName: handler.propName,
        trap: handler.trap,
      },
    ]);

    if (!handlers[type]) {
      handlers[type] = {};
    }

    handlers[type][target] = finalValue;
  });

  const [allHandlers, str] = Object.entries(handlers)
    .map(([type, obj]) => _generateHandler(type, obj))
    .reduce(
      (prev, current) => [
        [...prev[0], ...current[0]],
        [...prev[1], current[1]],
      ],
      [[], []]
    );

  return [allHandlers, `${proxyId} ${str.join(' ')}`];
};

// return value is [str, array]
const _parser = (expr, handlers = []) => {
  // if expr is array, map and parse each item
  // items must be all strings after parsing
  if (isArray(expr)) {
    const [strArray, handlersArray] = expr
      .map((item) => _parser(item, handlers))
      .reduce(
        (prev, current) => [
          [...prev[0], current[0]],
          [...prev[1], ...current[1]],
        ],
        [[], []]
      );

    return [strArray.join(''), handlersArray];
  }

  // if template
  // add its handlers to ours
  // then return the string
  if (isTemplate(expr)) {
    return [expr[0], [...handlers, ...expr[1]]];
  }

  // if Object and that object contains only keys which name is an event
  // generate a temporary id and replace the object with it
  // then add the event listeners to our handlers
  if (isEventListeners(expr)) {
    const [eventHandlers, id] = _generateHandler('listener', expr);

    return [id, [...handlers, ...eventHandlers]];
  }

  if (isState(expr)) {
    const [propHandlers, id] = _bindState(expr);
    return [id, [...handlers, ...propHandlers]];
  }

  if (isDefaultProps(expr)) {
    const [defaultPropHandlers, id] = _generateHandler('prop', expr);
    return [id, [...handlers, ...defaultPropHandlers]];
  }

  // if none of our accepted types, assume it is string
  // then just return it
  return [`${expr}`, []];
};

const _createTemplate = (arr) => {
  const arrayLikeObj = {};

  arr.forEach((i, idx) => {
    arrayLikeObj[idx] = arr[idx];
  });

  arrayLikeObj.length = arr.length;
  arrayLikeObj._type = 'template';

  Object.defineProperty(arrayLikeObj, '_type', {
    enumerable: false,
  });

  return arrayLikeObj;
};

const _replacePlaceholders = (str) => {
  let newString = str;
  let match = newString.match(/{%\s*(.*)\s*%}/);
  const handlers = [];

  while (match) {
    const [textHandlers, id] = _generateHandler('text', {
      text: match[1].trim(),
    });

    handlers.push(...textHandlers);

    newString = newString.replace(match[0], `<i ${id}></i>`);

    match = newString.slice(match.index).match(/{%\s*(.*)\s*%}/);
  }

  return [newString, handlers];
};

const parseString = (strings, ...exprs) => {
  const [evaluatedExprs, handlers] = exprs
    .map((expr) => _parser(expr))
    .reduce(
      (prev, current) => [
        [...prev[0], current[0]],
        [...prev[1], ...current[1]],
      ],
      [[], []]
    );

  const htmlString = evaluatedExprs.reduce(
    (fullString, expr, i) => `${fullString}${expr}${strings[i + 1]}`,
    strings[0]
  );

  const [sanitizedString, textHandlers] = _replacePlaceholders(htmlString);
  handlers.push(...textHandlers);

  return _createTemplate([sanitizedString, handlers]);
};

const html = (strings, ...exprs) => parseString(strings, ...exprs);

const _modifyElement = ({ element, type, data, context = document }) => {
  const el = context.querySelector(element);

  switch (type) {
    case 'prop':
      el[data.name] = data.value;
      break;
    case 'attr':
      if (isBooleanAttribute(data.name)) {
        if (data.value) {
          el.setAttribute(data.name, '');
        } else {
          el.removeAttribute(data.name);
        }
      } else {
        el.setAttribute(data.name, data.value);
      }

      break;
    case 'listener':
      el.addEventListener(data.name, data.value);
      break;
    case 'text':
      el.replaceWith(document.createTextNode(data.value));
      break;
    case 'style':
      el.style[data.name] = data.value;
      break;
    case 'content':
      [...el.children].map((child) => child.remove());

      el.appendChild(
        data.value instanceof HTMLElement
          ? data.value
          : render(html`${data.value}`)
      );

      break;
    default:
      throw new Error('Invalid type.');
  }
};

const createElementFromString = (str, handlers = []) => {
  const createdElement = document.createRange().createContextualFragment(str);

  handlers.forEach((handler) => {
    const el = createdElement.querySelector(handler.query);

    if (!el) return;

    _modifyElement({
      element: handler.query,
      type: handler.type,
      data: handler.data,
      context: createdElement,
    });

    if (handler.remove) {
      el.removeAttribute(handler.attr);
    }
  });

  return createdElement;
};

const render = (template) => createElementFromString(...Array.from(template));

const _setHandler = (stateId) => ({
  set: (target, prop, value, receiver) => {
    const bindedElements = stateStore.get(stateId);

    bindedElements.forEach((handlers, id) => {
      const query = `[data-proxy-id="${id}"]`;
      const el = document.querySelector(query);

      if (el) {
        handlers.forEach((handler) => {
          if (prop !== handler.propName) return;

          const finalValue = handler.trap
            ? handler.trap.call(null, value)
            : value;

          _modifyElement({
            element: query,
            type: handler.type,
            data: { name: handler.target, value: finalValue },
          });
        });
      } else {
        // delete handler when the target is unreachable (most likely deleted)
        bindedElements.delete(id);
      }
    });

    return Reflect.set(target, prop, value, receiver);
  },
});

const createState = (initValue = null) => {
  const _id = uuid();
  // Map contains id keys
  // id keys are proxy ids of elements binded to the state
  stateStore.set(_id, new Map());

  const state = {
    bindValue: (trap = null) => ({
      propName: 'value',
      trap,
      _id,
      value: state.value,
    }),
    bind: (propName = 'value', trap = null) => ({
      propName,
      trap,
      _id,
      value: propName === 'value' ? state.value : state.value[propName],
    }),
  };

  if (isObject(initValue)) {
    state.value = new Proxy(initValue, _setHandler(_id));
  } else {
    state.value = initValue;
  }

  return new Proxy(state, _setHandler(_id));
};




/***/ }),

/***/ "./src/event.js":
/*!**********************!*\
  !*** ./src/event.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(eventName, fn, options) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    this.events.get(eventName).push({ fn, options });
  }

  off(eventName, fn) {
    let handlers = this.events.get(eventName);
    handlers = handlers.filter((handler) => handler.fn !== fn);

    console.log(`Shutting off ${eventName}...`);
    this.events.set(eventName, handlers);
  }

  clear() {
    this.events.clear();
  }

  emit(eventName, payload = null) {
    console.log(`${eventName} event emitted... `);
    const handlers = this.events.get(eventName) || [];

    handlers.forEach((handler) => {
      handler.fn.call(null, payload);

      if (handler.options && handler.options.once) {
        this.off(eventName, handler.fn);
      }
    });
  }
}

const event = new EventEmitter();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (event);


/***/ }),

/***/ "./src/pages/Contact.js":
/*!******************************!*\
  !*** ./src/pages/Contact.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/component.js");


const Contact = () => _component__WEBPACK_IMPORTED_MODULE_0__.html`<h1>This is my contact</h1>`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Contact);


/***/ }),

/***/ "./src/pages/Error.js":
/*!****************************!*\
  !*** ./src/pages/Error.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/component.js");


const Error = () => _component__WEBPACK_IMPORTED_MODULE_0__.html`<h1>Page not found</h1>`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Error);


/***/ }),

/***/ "./src/pages/Home.js":
/*!***************************!*\
  !*** ./src/pages/Home.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/component.js");


const Home = () => _component__WEBPACK_IMPORTED_MODULE_0__.html`<h1>This is my home</h1>`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Home);


/***/ }),

/***/ "./src/pages/Menu.js":
/*!***************************!*\
  !*** ./src/pages/Menu.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./src/component.js");


const Menu = () => _component__WEBPACK_IMPORTED_MODULE_0__.html`<h1>This is my Menu</h1>`;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Menu);


/***/ }),

/***/ "./src/pages/index.js":
/*!****************************!*\
  !*** ./src/pages/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Home": () => (/* reexport safe */ _Home__WEBPACK_IMPORTED_MODULE_0__.default),
/* harmony export */   "Menu": () => (/* reexport safe */ _Menu__WEBPACK_IMPORTED_MODULE_1__.default),
/* harmony export */   "Contact": () => (/* reexport safe */ _Contact__WEBPACK_IMPORTED_MODULE_2__.default),
/* harmony export */   "Error": () => (/* reexport safe */ _Error__WEBPACK_IMPORTED_MODULE_3__.default)
/* harmony export */ });
/* harmony import */ var _Home__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Home */ "./src/pages/Home.js");
/* harmony import */ var _Menu__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Menu */ "./src/pages/Menu.js");
/* harmony import */ var _Contact__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Contact */ "./src/pages/Contact.js");
/* harmony import */ var _Error__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Error */ "./src/pages/Error.js");








/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App */ "./src/App.js");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component */ "./src/component.js");
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./event */ "./src/event.js");




window.addEventListener('hashchange', () => {
  _event__WEBPACK_IMPORTED_MODULE_2__.default.emit('hashchange', window.location.hash.replace('#', ''));
});

document.body.appendChild((0,_component__WEBPACK_IMPORTED_MODULE_1__.render)((0,_App__WEBPACK_IMPORTED_MODULE_0__.default)()));

})();

/******/ })()
;
//# sourceMappingURL=main.js.map