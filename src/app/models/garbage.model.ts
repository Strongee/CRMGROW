import { Deserializable } from "./deserialize.model";

export class Garbage implements Deserializable {
  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
