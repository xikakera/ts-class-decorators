import { DecoratorUtil } from '../src/decorators/DecoratorUtil/DecoratorUtil';

namespace tclassutil {
  export const util = new DecoratorUtil();
  export const all: { [name: string]: Function } = {};

  export const getMeta = util.getMeta.bind(util);

  export namespace Class {
    export const init = util
      .class<string>('name')
      .func(c => {
        all[c.name] = c;
        console.log('class init 1');
      })
      .func(c => {
        console.log('class init 2');
      })
      .defaultValueFunc(c => c.name)
      .make();

    export const use = util
      .class<string>('use')
      .func(c => {
        console.log('class use 2');
      })
      .func(c => {
        console.log('class use 2');
      })
      .make();
  }

  export namespace Method {
    export const fn = util
      .method('test', '{key}')
      .func(() => {
        console.log('method fn 1');
      })
      .func(() => {
        console.log('method fn 2');
      })
      .make();

    export const override = util
      .method<boolean>('override', '{key}')
      .value(true)
      .func(() => {
        console.log('method override 1');
      })
      .func(() => {
        console.log('method override 2');
      })
      .make();

    let stepFn_i = 0;
    export const stepFn = util
      .method<string>('step-fn', '{key}')
      .func(() => {
        console.log('stepFn:', stepFn_i++);
      })
      .arrayDesc()
      .make();

    export const setting = util
      .method<{ test: number; str: string }>('setting')
      .assign()
      .make();
    export const setting2 = util
      .method<{ bool: boolean }>('setting')
      .assign()
      .make();
  }

  // 执行顺序
  //
  // method fn 1
  // method fn 2
  // method fn 1
  // method fn 2
  // method override 1
  // method override 2
  // stepFn: 0
  // stepFn: 1
  // stepFn: 2
  // class use 2
  // class use 2
  // class init 1
  // class init 2
}

@tclassutil.Class.init('测试') // name: '测试'
@tclassutil.Class.use('test') // use: 'test'
class t {
  // "test": {
  //   "test": "test",
  //   "getValue": {
  //     "this_val": true
  //   }
  // }
  @tclassutil.Method.fn('test')
  test() {}

  // "test": {
  //   "test": "test",
  //   "getValue": {
  //     "this_val": true
  //   }
  // }
  @tclassutil.Method.fn({ this_val: true })
  getValue() {}

  @tclassutil.Method.override() // override: { toString: true }
  @tclassutil.Method.setting2({ bool: false }) // assign 插入: /// { bool: false, test: 1, str: 'test' }
  toString() {
    return 'class t;';
  }

  @tclassutil.Method.stepFn('val1') // 倒序装载 [ 'val1', 'val2', 'val3' ]
  @tclassutil.Method.stepFn('val2')
  @tclassutil.Method.stepFn('val3')
  @tclassutil.Method.setting({ test: 1, str: 'test' }) // assign 插入: /// { bool: false, test: 1, str: 'test' }
  step() {}
}

console.log(t);
const meta = tclassutil.getMeta(t);
console.log(meta);
console.log(JSON.stringify(meta, null, 2));
// meta == {
//   "test": {
//     "test": "test",
//     "getValue": {
//       "this_val": true
//     }
//   },
//   "setting": {
//     "bool": false,
//     "test": 1,
//     "str": "test"
//   },
//   "override": {
//     "toString": true
//   },
//   "step-fn": {
//     "step": [
//       "val1",
//       "val2",
//       "val3"
//     ]
//   },
//   "use": "test",
//   "name": "测试"
// }

console.log('end');
