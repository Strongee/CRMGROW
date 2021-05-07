import { Deserializable } from './deserialize.model';

export class User implements Deserializable {
  _id?: string = '';
  user_name?: string = '';
  nick_name?: string = '';
  email?: string = '';
  cell_phone?: string = '';
  phone?: {
    number?: string;
    internationalNumber?: string;
    nationalNumber?: string;
    countryCode?: string;
    areaCode?: string;
    dialCode?: string;
  } = {};
  payment?: string = '';
  time_zone_info?: string = '';
  time_zone?: string = '';
  location: string;
  email_signature?: string = '';
  proxy_number?: string = '';
  proxy_number_id?: string = '';
  twilio_number?: string = '';
  proxy_phone?: {
    number?: string;
    is_released: false;
  } = { is_released: false };
  picture_profile: string;
  learn_more: string;
  role: string;
  outlook_refresh_token: string;
  google_refresh_token: string;
  yahoo_refresh_token: string;
  other_emailer: any;
  connected_email_type: string;
  connected_email: string;
  connect_calendar = false;
  primary_connected = false;
  daily_report = false;
  weekly_report = false;
  admin_notification = 0;
  desktop_notification = false;
  desktop_notification_subscription: string;
  text_notification = false;
  contact_info = {
    is_limit: true,
    max_count: 3000
  };
  text_info = {
    additional_credit: {
      amount: 0,
      updated_at: Date
    },
    is_limit: true,
    max_count: 3000,
    count: 0
  };
  email_info = {
    is_limit: true,
    max_count: 3000,
    count: 0
  };
  welcome_email = false;
  is_trial = false;
  is_free = false;
  subscription?: {
    is_failed: false;
    updated_at: Date;
    is_suspended: false;
    suspended_at: Date;
    attempt_count: 0;
    period: 'month';
  };
  package_level: string;
  expired_at: Date;
  created_at: Date;
  updated_at: Date;
  last_logged: Date;
  sub_domain: string;
  social_link?: {
    facebook: string;
    twitter: string;
    linkedin: string;
  } = {
    facebook: '',
    twitter: '',
    linkedin: ''
  };
  company = 'eXp Realty';
  affiliate?: {
    id?: string;
    link?: string;
    paypal?: string;
  };
  hasPassword?: boolean;
  calendar_list?: {
    connected_email: string;
    connected_calendar_type: string;
    google_refresh_token?: string;
    outlook_refresh_token?: string;
  }[];
  assistant_info?: {
    is_limit: boolean;
    max_count: 1;
  };

  deserialize(input: any): this {
    return Object.assign(this, input);
  }

  get avatarName(): string {
    const names = this.user_name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    } else {
      return names[0][0];
    }
  }
}
