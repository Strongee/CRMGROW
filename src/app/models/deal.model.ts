import { Deserializable } from './deserialize.model';
import { Activity } from './activity.model';

export class Deal implements Deserializable {
  _id: string;
  user: string;
  activity: Activity[];
  title: string;
  created_at: Date;
  updated_at: Date;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
