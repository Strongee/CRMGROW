import { Deserializable } from './deserialize.model';

export class Garbage implements Deserializable {
  user: string;
  canned_message: {
    sms: string;
    email: string;
  };
  edited_video: string;
  edited_pdf: string;
  edited_image: string;
  edited_automation: string[];
  edited_label: string[];
  desktop_notification = {
    material: false,
    email: false,
    follow_up: false,
    lead_capture: false,
    unsubscription: false,
    resubscription: false
  };
  email_notification = {
    material: true,
    email: true,
    follow_up: true,
    lead_capture: false,
    unsubscription: true,
    resubscription: true
  };
  text_notification = {
    material: true,
    email: false,
    follow_up: false,
    lead_capture: false,
    unsubscription: false,
    resubscription: false
  };
  reminder_before = 30;
  capture_dialog = false;
  capture_delay = 0;
  capture_videos: any[];
  capture_images: any[];
  capture_pdfs: any[];
  capture_field = {
    email: true,
    cell_phone: true,
    first_name: true
  };
  index_page: string;
  logo: string;
  material_theme = 'theme2';
  auto_follow_up = {
    enabled: false,
    period: 0,
    content: ''
  };
  auto_resent = {
    enabled: false,
    period: 24,
    sms_canned_message: '',
    email_canned_message: ''
  };
  material_themes: any;
  highlights: [];
  brands: [];
  intro_video: string;
  calendly: {
    id: string;
    token: string;
    email: string;
    link: string;
  };

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
