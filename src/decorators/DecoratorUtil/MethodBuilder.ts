import { Meta } from '../Meta';
import _ from 'lodash';
import { toArray } from './util';

export type MethodDecorator<T> = (
  value: T
) => (target: any, key: string) => void;
export type MethodDecorator_hasDefault<T> = (
  value?: T
) => (target: any, key: string) => void;

export type MethodDecorator_root = (target: any, key: string) => void;

export class MethodBuilder<T = any, R = MethodDecorator<T>> {
  _val?: T;
  _paths: Meta.KeyType[] = [];
  _fns: ((
    this: MethodBuilder<T, R>,
    constructor: Function,
    key: string
  ) => void)[] = [];
  _def: {
    type: 'none' | 'fn' | 'value';
    fn?: (this: MethodBuilder<T, R>, constructor: Function, key: string) => T;
    value?: T;
  } = {
    type: 'none'
  };

  _is_key_value: boolean = false;

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
   * * `{key}` 为函数名
   **/
  addPaths(paths: Meta.ManyKeyType) {
    this._paths = _.concat(this._paths, toArray(paths));
    return this;
  }

  value(value: T): MethodBuilder<T, MethodDecorator_hasDefault<T>> {
    this._def = {
      type: 'value',
      value: value
    };

    return this as any;
  }

  defaultValueFunc(
    valFunc: NonNullable<this['_def']['fn']>
  ): MethodBuilder<T, MethodDecorator_hasDefault<T>> {
    this._def = {
      type: 'fn',
      fn: valFunc
    };
    return this as any;
  }

  key(): MethodBuilder<string, MethodDecorator_root> {
    this.defaultValueFunc(((c: any, name: string) => name) as any);
    this._is_key_value = true;
    return this as any;
  }

  func(fn: this['_fns'][0]) {
    this._fns.push(fn);
    return this;
  }

  make(): R {
    const dec = this.makeDecorator();
    if (this._is_key_value) {
      return dec();
    }
    return dec;
  }

  protected makeDecorator(): any {
    return (value?: T) => {
      return (target: any, key: string) => {
        const constructor: Function = target.constructor;
        let val = this.getValue(constructor, key, value);
        if (_.isUndefined(val)) {
          val = true as any;
        }
        this.setValue(constructor, key, val);
        this.runFns(constructor, key);
      };
    };
  }

  protected setValue(constructor: Function, key: string, value: T) {
    const path = this.getPaths(key);
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

  protected getValue(target: any, key: string, value?: T) {
    if (!_.isUndefined(value)) {
      return value;
    }
    let result: T;

    // 默认
    if (this._def.type != 'none') {
      switch (this._def.type) {
        case 'fn':
          result = this._def.fn!.apply(this, [target, key]);
          break;
        case 'value':
          result = this._def.value!;
          break;
      }
    }

    return result!;
  }

  protected getPaths(key: string) {
    return [this._root, ...this._paths].map(k => {
      switch (k) {
        case '{key}':
          k = key;
          break;
      }
      return k;
    });
  }

  protected runFns(constructor: Function, key: string) {
    if (this._fns.length) {
      for (const fn of this._fns) {
        fn.apply(this, [constructor, key]);
      }
    }
  }
}
