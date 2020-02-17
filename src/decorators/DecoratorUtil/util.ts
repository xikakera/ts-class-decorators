import { Meta } from "../Meta";
import _ from "lodash";

export function toArray(val: Meta.ManyKeyType) {
  return _.isArray(val) ? val : [val];
}
