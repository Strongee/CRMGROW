import { Deserializable } from './deserialize.model';
import { Activity } from './activity.model';

export class Deal implements Deserializable {
  _id: string;
  user: string;
  activity: Activity[];
  deal_stage: string;
  title: string;
  value: number;
  created_at: Date;
  updated_at: Date;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
