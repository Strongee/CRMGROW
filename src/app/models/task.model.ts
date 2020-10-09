import { Deserializable } from './deserialize.model';

export class Task implements Deserializable {
  content: string;
  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
