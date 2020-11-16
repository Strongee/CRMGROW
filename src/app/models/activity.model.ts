import { Contact } from './contact.model';
import { Deserializable } from './deserialize.model';

export class PureActivity implements Deserializable {
  _id: string;
  user: string;
  content: string;
  type: string;
  appointments: string;
  follow_ups: string;
  notes: string;
  phone_logs: string;
  videos: string;
  video_trackers: string;
  pdfs: string;
  pdf_trackers: string;
  images: string;
  image_trackers: string;
  emails: string;
  email_trackers: string;
  sms: string;
  contacts: string;
  material_last: number;
  full_watched: boolean;
  send_type: number;
  subject: string;
  description: string;
  created_at: Date;
  updated_at: Date;

  deserialize(input: any): this {
    Object.assign(this, input);
    return this;
  }
}
export class Activity implements Deserializable {
  _id: string;
  user: string;
  content: string;
  type: string;
  appointments: string;
  follow_ups: string;
  notes: string;
  phone_logs: string;
  videos: string;
  video_trackers: string;
  pdfs: string;
  pdf_trackers: string;
  images: string;
  image_trackers: string;
  emails: string;
  email_trackers: string;
  sms: string;
  contacts: Contact;
  material_last: number;
  full_watched: boolean;
  send_type: number;
  subject: string;
  description: string;
  created_at: Date;
  updated_at: Date;

  deserialize(input: any): this {
    Object.assign(this, input);
    this.contacts = new Contact().deserialize(input.contacts);
    return this;
  }
}

export class ActivityDetail implements Deserializable {
  _id: string;
  user: string;
  content: string;
  type: string;
  appointments: string;
  follow_ups: string;
  notes: string;
  phone_logs: string;
  videos: string;
  video_trackers: string;
  pdfs: string;
  pdf_trackers: string;
  images: string;
  image_trackers: string;
  emails: string;
  email_trackers: string;
  sms: string;
  contacts: any;
  material_last: number;
  full_watched: boolean;
  send_type: number;
  subject: string;
  description: string;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}

export class DetailActivity extends PureActivity {
  activity_detail: any[];

  deserialize(input: any): this {
    Object.assign(this, input);
    this.activity_detail = input.activity_detail;
    return this;
  }
}
