import { Deserializable } from './deserialize.model';

export class Image implements Deserializable {


  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
