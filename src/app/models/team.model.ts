import { Deserializable } from './deserialize.model';

export class Team implements Deserializable {
  _id: string;
  owner: any[];
  name: string;
  description: string;
  email: string;
  cell_phone: string;
  highlights: string[];
  brands: string[];
  members: any[];
  inivites: any[];
  requests: any[];
  referrals: any[];
  editors: any[];
  videos: string[];
  pdfs: string[];
  images: string[];
  automations: string[];
  email_templates: string[];
  contacts: any[];
  created_at: string;
  updated_at: string;
  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
