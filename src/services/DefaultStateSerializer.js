import _ from 'lodash';

export default class DefaultStateSerializer {
  constructor() {
    this.serialize = this.serialize.bind(this);
    this.deserialize = this.deserialize.bind(this);
  }

  serialize(state) {
    return _.cloneDeep(state);
  }

  deserialize(state) {
    return _.cloneDeep(state);
  }
}
