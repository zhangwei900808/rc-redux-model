"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @desc 对每一个 model 自动注册 action 与 reducers
 * @summary 每一个 state 字段，都提供一个修改的 action
 * @param {object} model
 * @returns {object} newModel
 */
const autoAction = model => {
  let _wrapAutoAction = {};
  let _wrapAutoReducers = {};
  const {
    namespace,
    state = {},
    action = {},
    reducers = {}
  } = model;
  const stateKeys = Object.keys(state); // 如果是空state，那么直接返回 model

  if (stateKeys.length === 0) return model; // 遍历 state，给每一个值都自动注册修改此state的action

  stateKeys.forEach(key => {
    const actionType = generateActionType(namespace, key);

    if (!_wrapAutoAction["change".concat(key)]) {
      _wrapAutoAction["change".concat(key)] = registerAction(actionType);
    }

    if (!_wrapAutoReducers["".concat(actionType)]) {
      _wrapAutoReducers["".concat(actionType)] = registerReducers();
    }
  }); // 允许重名情况下覆盖，以用户定义的为主

  _wrapAutoAction = _objectSpread(_objectSpread({}, _wrapAutoAction), action);
  _wrapAutoReducers = _objectSpread(_objectSpread({}, _wrapAutoReducers), reducers); // 为了防止太多个state对应action，所以提供一个默认的action，根据用户传递的key，策略模式分配到对应的action

  _wrapAutoAction['setStoreLib'] = generateDefaultAction(namespace);
  return _objectSpread(_objectSpread({}, model), {}, {
    action: _wrapAutoAction,
    reducers: _wrapAutoReducers
  });
};
/**
 * @desc 生成 action.type
 * @summary action 发出的 action.type 需对应 reducer 中的 action.type
 * @param {string} namespace - 命名空间
 * @param {string} key - 当前的state key值
 * @returns {string} actionType
 */


const generateActionType = (namespace, key) => {
  return "".concat(namespace.toUpperCase(), "_STORE_LIB_").concat(key.toUpperCase());
};
/**
 * @desc 自动注册 action
 * @param {string} actionType
 * @returns {function} actionFunction
 */


const registerAction = actionType => {
  return (_ref) => {
    let {
      currentAction,
      commit
    } = _ref;
    commit({
      type: actionType,
      payload: currentAction.payload
    });
  };
};
/**
 * @desc 自动注册 reducers
 * @param {string} namespace - 命名空间
 * @param {string} key - 当前的state key值
 */


const registerReducers = () => {
  return (state, payload) => {
    return _objectSpread(_objectSpread({}, state), payload);
  };
};
/**
 * @desc 注册生成默认的action
 * @summary 使用方式
 * this.props.dispatch({
 *   type: '[model.namespace]/setStoreLib',
 *   payload: {
 *     key: [model.state.key]
 *     value: [your values]
 *   }
 * })
 */


const generateDefaultAction = namespace => {
  return (_ref2) => {
    let {
      currentAction,
      dispatch
    } = _ref2;
    // 根据key，触发对应的action
    const keyProps = currentAction.payload && currentAction.payload.key;
    dispatch({
      type: "".concat(namespace, "/change").concat(keyProps),
      payload: currentAction.payload.values
    });
  };
};

var _default = autoAction;
exports.default = _default;