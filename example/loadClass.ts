// 装饰器文件
import { DecoratorUtil } from '../src/decorators/DecoratorUtil/DecoratorUtil';
import _ from 'lodash';
const util = new DecoratorUtil();
export namespace TestDecorator {
  export interface TestSetting {
    /** 标记 */
    name: string;
    /** 函数名称 */
    say: string;
  }
  export const all: { [name: string]: Function } = {};

  // /** 初始化一个类装饰器 */
  // export function DInit(name?: string) {
  //   return function(constructor: Function) {
  //     _.set(constructor, [util.root, 'name'], name || constructor.name);
  //     all[constructor.name] = constructor;
  //     /** do something */
  //   };
  // }
  // 上面代码和下面代码执行效果一样

  /** 初始化一个类装饰器 */
  export const DInit = util
    // 标记初始化
    .class<string>('name')
    // 设置默认内容
    .defaultValueFunc(constructor => constructor.name)
    // 需要执行的任务
    .func(constructor => {
      all[constructor.name] = constructor;
    })
    // 生成装饰器
    .make();

  /** 初始化一个方法装饰器 */
  export const MSay = util
    // 标记初始化
    .method('say')
    // 设置默认为函数名
    .defaultValueFunc((c, key) => key)
    // 生成装饰器
    .make();

  // 获取元数据
  export const getMeta = (constructor: Function) =>
    util.getMeta<TestSetting>(constructor);
}

// 类文件1

// 设置 meta.name = '测试1'
@TestDecorator.DInit('测试1')
class test1 {
  // 标记一个函数名
  @TestDecorator.MSay()
  say1() {
    return 'hello test1';
  }
}

// 类文件2

// 设置 meta.name = class2 <-- 类本身的名称
@TestDecorator.DInit()
class class2 {
  // 标记一个函数名
  @TestDecorator.MSay()
  say2() {
    return 'hello test2';
  }
}

// 使用文件

// 循环所有类, 并不需要知道类叫什么名称
for (const constructor of Object.values(TestDecorator.all)) {
  // 创建一个类
  const test = new (constructor as any)();
  // 获取类的元数据
  const meta = TestDecorator.getMeta(constructor);

  // 2 个函数名不一样,但是因为设置是一致的,所以可以区别开来
  console.log(meta.name, 'say:', test[meta.say]());
}
