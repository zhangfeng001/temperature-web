
// 提交 mutations是更改Vuex状态的唯一合法方法
import * as types from './mutation-types'
const matutaions = {
    [types.SET_KDLIMIT](state, obj) {
      state.KDobj = obj // 把方法传递过来的参数，赋值给state中的KDobj
    }
  }
  export default matutaions