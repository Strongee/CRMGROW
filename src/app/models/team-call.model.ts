import { Deserializable } from './deserialize.model';

export class TeamCall implements Deserializable {
  _id: string;
  user: string;
  leader: string;
  team: string;
  guests: string[];
  contacts: string[];
  invites: any[];
  subject: string;
  description: string;
  duration: number;
  location: string;
  note: string;
  status: string;
  link: string;
  due_start: string;
  due_end: string;
  updated_at: string;
  created_at: string;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
