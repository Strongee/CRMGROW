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
  auto_resend = {
    enabled: false,
    period: 24,
    sms_canned_message: '',
    email_canned_message: ''
  };
  auto_follow_up2 = {
    enabled: false,
    period: 0,
    content: ''
  };
  auto_resend2 = {
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
  additional_fields: {
    id: string;
    type: string;
    name: string;
    placeholder: string;
    status: boolean;
    options: { value: string; label: string }[];
  }[] = [
    {
      id: '0',
      name: 'Name',
      options: [],
      placeholder: 'name',
      status: true,
      type: 'text'
    },
    {
      id: '1',
      name: 'Text',
      options: [],
      placeholder: 'text',
      status: true,
      type: 'text'
    },
    {
      id: '2',
      name: 'Email',
      options: [],
      placeholder: 'email',
      status: true,
      type: 'text'
    }
  ];

  deserialize(input: any): this {
    Object.entries(input).forEach(([key, value]) => {
      if (!value && typeof this[key] === 'object') {
        input[key] = this[key];
        return;
      }
    });
    return Object.assign(this, input);
  }

  notification_fields = [
    'material',
    'email',
    'follow_up',
    'lead_capture',
    'unsubscription'
  ];

  get entire_desktop_notification(): number {
    if (!this.desktop_notification) {
      return -1;
    }
    let all_checked = true;
    let some_checked = false;
    this.notification_fields.forEach((e) => {
      all_checked = all_checked && this.desktop_notification[e];
      some_checked = some_checked || this.desktop_notification[e];
    });
    return all_checked ? 1 : some_checked ? 0 : -1;
  }
  get entire_text_notification(): number {
    if (!this.text_notification) {
      return -1;
    }
    let all_checked = true;
    let some_checked = false;
    this.notification_fields.forEach((e) => {
      all_checked = all_checked && this.text_notification[e];
      some_checked = some_checked || this.text_notification[e];
    });
    return all_checked ? 1 : some_checked ? 0 : -1;
  }
  get entire_email_notification(): number {
    if (!this.email_notification) {
      return -1;
    }
    let all_checked = true;
    let some_checked = false;
    this.notification_fields.forEach((e) => {
      all_checked = all_checked && this.email_notification[e];
      some_checked = some_checked || this.email_notification[e];
    });
    return all_checked ? 1 : some_checked ? 0 : -1;
  }
}
