import { Deserializable } from './deserialize.model';

export class Team implements Deserializable {
  _id: string;
  owner: any[];
  name: string;
  picture: string;
  description: string;
  email: string;
  cell_phone: string;
  highlights: string[];
  brands: string[];
  members: any[];
  invites: any[];
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

  get memberCount(): number {
    return this.editors.length + this.members.length;
  }
  get materialCount(): number {
    return this.videos.length + this.pdfs.length + this.images.length;
  }
}
