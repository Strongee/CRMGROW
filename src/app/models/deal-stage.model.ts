import { Deserializable } from './deserialize.model';
import { Deal } from './deal.model';

export class DealStage implements Deserializable {
  _id: string;
  user: string;
  title: string;
  deals: Deal[];
  created_at: Date;
  updated_at: Date;
  deals_count: number = 0;
  static deserilize: any;

  deserialize(input: any): this {
    Object.assign(this, input);
    this.deals_count = this.deals.length;
    return this;
  }
}
