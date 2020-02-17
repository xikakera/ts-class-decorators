import _ from 'lodash';
import 'reflect-metadata';

export class Meta {
  constructor(public readonly mainKey: Meta.KeyType = Symbol()) {}
}

export namespace Meta {
  export type KeyType = string | symbol | number;

  export type Many<T = any> = T[] | T;

  export type ManyKeyType = Many<KeyType>;
}
