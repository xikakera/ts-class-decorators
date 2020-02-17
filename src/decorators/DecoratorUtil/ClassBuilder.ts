import { Meta } from '../Meta';
import _ from 'lodash';
import { toArray } from './util';

export type ClassDecorator<T> = (value: T) => (constructor: Function) => void;
export type ClassDecorator_hasDefault<T> = (
  value?: T
) => (constructor: Function) => void;

export class ClassBuilder<T = any, R = ClassDecorator<T>> {
  _val?: T;
  _paths: Meta.KeyType[] = [];
  _fns: ((this: ClassBuilder<T, R>, constructor: Function) => void)[] = [];
  _def: {
    type: 'none' | 'fn' | 'value';
    fn?: (this: ClassBuilder<T, R>, constructor: Function) => T;
    value?: T;
  } = {
    type: 'none'
  };

  _setType: 'set' | 'assign' | 'array desc' | 'array asc' = 'set';

  constructor(readonly _root: Meta.KeyType = Symbol()) {}

  assign() {
    this._setType = 'assign';
    return this;
  }

  arrayDesc() {
    this._setType = 'array desc';
    return this;
  }

  arrayAsc() {
    this._setType = 'array asc';
    return this;
  }

  array() {
    return this.arrayAsc();
  }

  /**
   * 注意:
   * * `{name}` 为构造函数名 constructor.name
   **/
  addPaths(paths: Meta.ManyKeyType) {
    this._paths = _.concat(this._paths, toArray(paths));
    return this;
  }

  value(value: T): ClassBuilder<T, ClassDecorator_hasDefault<T>> {
    this._def = {
      type: 'value',
      value: value
    };

    return this as any;
  }

  defaultValueFunc(
    valFunc: NonNullable<this['_def']['fn']>
  ): ClassBuilder<T, ClassDecorator_hasDefault<T>> {
    this._def = {
      type: 'fn',
      fn: valFunc
    };
    return this as any;
  }

  func(fn: this['_fns'][0]) {
    this._fns.push(fn);
    return this;
  }

  make(): R {
    return this.makeDecorator();
  }

  protected makeDecorator(): any {
    return (value?: T) => {
      return (constructor: Function) => {
        let val = this.getValue(constructor, value);
        if (_.isUndefined(val)) {
          val = true as any;
        }
        this.setValue(constructor, val);
        this.runFns(constructor);
      };
    };
  }

  protected setValue(constructor: Function, value: T) {
    const path = this.getPaths(constructor.name);
    switch (this._setType) {
      case 'array desc':
      case 'array asc':
        const arr = _.get(constructor, path, []);
        switch (this._setType) {
          case 'array desc':
            _.set(constructor, path, [value].concat(arr));
            break;
          case 'array asc':
            _.set(constructor, path, arr.concat([value]));
            break;
        }
        break;
      case 'assign':
        const obj = _.assign({}, _.get(constructor, path, {}), value);
        _.set(constructor, path, obj);
        break;
      case 'set':
      default:
        _.set(constructor, path, value);
        break;
    }
  }

  protected getValue(constructor: Function, value?: T) {
    if (!_.isUndefined(value)) {
      return value;
    }
    let result: T;

    // 默认
    if (this._def.type != 'none') {
      switch (this._def.type) {
        case 'fn':
          result = this._def.fn!.apply(this, [constructor]);
          break;
        case 'value':
          result = this._def.value!;
          break;
      }
    }

    return result!;
  }

  protected getPaths(name: string) {
    return [this._root, ...this._paths].map(k => {
      switch (k) {
        case '{name}':
          k = name;
          break;
      }
      return k;
    });
  }

  protected runFns(constructor: Function) {
    if (this._fns.length) {
      for (const fn of this._fns) {
        fn.apply(this, [constructor]);
      }
    }
  }
}
