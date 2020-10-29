import { Deserializable } from './deserialize.model';
export class Activity implements Deserializable {
  _id: string;

  deserialize(input: any): this {
    return Object.assign(this, input);
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
