import { Deserializable } from './deserialize.model';

export class Pdf implements Deserializable {
  

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
