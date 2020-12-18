import { Deserializable } from './deserialize.model';
import { Deal } from './deal.model';

export class DealStage implements Deserializable {
  _id: string;
  user: string;
  title: string;
  deals: Deal[];
  created_at: Date;
  updated_at: Date;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
