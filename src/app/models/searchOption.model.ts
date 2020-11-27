import { Deserializable } from './deserialize.model';

export class SearchOption implements Deserializable {
  _id: string;
  recruitingStageCondition: any;
  countryCondition: any;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
