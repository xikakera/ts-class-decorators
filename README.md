# ts-class-decorators

## Getting Start

### 安装

```bash
# npm
npm i ts-class-decorators

# yarn
yarn add ts-class-decorators
```

### tsconfig.json

必须打开装饰器开关

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 说明

为了快速书写装饰器

### 例子

#### 为快速加入类

[基础使用模式](example/DecoratorUtil.ts)

[装载一种类型的类](example/loadClass.ts)

### 文档

#### 装饰器基础

```typescript
export declare class DecoratorUtil {
  // 获取一个 类装饰器
  class<T = any>(
    ...paths: Meta.KeyType[]
  ): ClassBuilder<T, import('./ClassBuilder').ClassDecorator<T>>;
  // 创建一个 函数装饰器
  method<T = any>(
    ...paths: Meta.KeyType[]
  ): MethodBuilder<T, import('./MethodBuilder').MethodDecorator<T>>;
  // 获取一个类的元数据
  getMeta<T = any>(constructor: Function, ...paths: Meta.KeyType[]): T;

  // 类元数据的根,建议使用symbol,不轻易被外界修改
  get root(): string | number | symbol;
}
```

#### 类装饰器

```typescript
export declare class ClassBuilder<T = any, R = ClassDecorator<T>> {
  readonly _root: Meta.KeyType;
  // 使用 Object.assign 插入到数据中
  assign(): this;
  // 作为一个数组进行插入,倒序
  arrayDesc(): this;
  // 作为一个数组进行插入,正序
  arrayAsc(): this;
  // 作为一个数组进行插入,正序
  array(): this;
  /**
   * 加入路径
   * root.foo.bar 则 util.addPaths('foo','bar')
   *
   * 注意:
   * * `{name}` 为构造函数名 constructor.name
   **/
  addPaths(paths: Meta.ManyKeyType): this;
  // 给出默认数据
  value(value: T): ClassBuilder<T, ClassDecorator_hasDefault<T>>;
  // 给出默认数据的函数
  defaultValueFunc(
    valFunc: NonNullable<this['_def']['fn']>
  ): ClassBuilder<T, ClassDecorator_hasDefault<T>>;
  // 可以执行函数
  func(fn: this['_fns'][0]): this;
  // 生成装饰器
  make(): R;
}
```

#### 函数装饰器

```typescript
export declare class MethodBuilder<T = any, R = MethodDecorator<T>> {
  readonly _root: Meta.KeyType;
  // 使用 Object.assign 插入到数据中
  assign(): this;
  // 作为一个数组进行插入,倒序
  arrayDesc(): this;
  // 作为一个数组进行插入,正序
  arrayAsc(): this;
  // 作为一个数组进行插入,正序
  array(): this;
  /**
   * 加入路径
   * root.foo.bar 则 util.addPaths('foo','bar')
   *
   * 注意:
   * * `{key}` 为函数名
   **/
  addPaths(paths: Meta.ManyKeyType): this;
  // 给出默认数据
  value(value: T): MethodBuilder<T, MethodDecorator_hasDefault<T>>;
  // 给出默认数据的函数
  defaultValueFunc(
    valFunc: NonNullable<this['_def']['fn']>
  ): MethodBuilder<T, MethodDecorator_hasDefault<T>>;
  // 可以执行函数
  func(fn: this['_fns'][0]): this;
  // 生成装饰器
  make(): R;
}
```
