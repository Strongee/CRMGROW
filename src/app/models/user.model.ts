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
  assistant_info?: {
    is_enabled: boolean;
    is_limit: boolean;
    max_count: number;
  };
  contact_info?: {
    is_limit: boolean;
    max_count: number;
  };
  text_info?: {
    is_enabled: boolean;
    is_limit: boolean;
    max_count: number;
    count: number;
    additional_credit?: {
      amount: number;
      updated_at: Date;
    };
  };
  email_info?: {
    mass_enable: boolean;
    is_limit: boolean;
    max_count: number;
    count: number;
  };
  automation_info?: {
    is_enabled: boolean;
    is_limit: boolean;
    max_count: number;
  };
  material_info?: {
    is_enabled: boolean;
    is_limit: boolean;
    upload_max_count: number;
    record_max_duration: number;
  };
  team_info?: {
    owner_enabled: boolean;
  };
  calendar_info?: {
    is_enabled: boolean;
    is_limit: boolean;
    max_count: number;
  };
  capture_enabled: boolean;
  email_verified: boolean;
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
  user_version: string;
  expired_at: Date;
  created_at: Date;
  updated_at: Date;
  last_logged: Date;
  del: boolean;
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
