import { Meta } from '../Meta';
import _ from 'lodash';
import { ClassBuilder } from './ClassBuilder';
import { MethodBuilder } from './MethodBuilder';

export class DecoratorUtil {
  constructor(public readonly meta: Meta = new Meta()) {}

  class<T = any>(...paths: Meta.KeyType[]) {
    return new ClassBuilder<T>(this.root).addPaths(paths);
  }

  method<T = any>(...paths: Meta.KeyType[]) {
    return new MethodBuilder<T>(this.root).addPaths(paths);
  }

  getMeta<T = any>(constructor: Function, ...paths: Meta.KeyType[]): T {
    return _.get(constructor, [this.root, ...paths], {});
  }

  get root() {
    return this.meta.mainKey;
  }
}
