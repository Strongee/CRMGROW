import { Deserializable } from './deserialize.model';

export class Template implements Deserializable {
  _id: string;
  user: string;
  title: string = '';
  subject: string = '';
  content: string = '';
  role: string;
  type: string = 'email';
  default: boolean;
  created_at: string;
  updated_at: string;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
