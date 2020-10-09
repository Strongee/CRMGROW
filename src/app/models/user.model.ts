import { Deserializable } from './deserialize.model';

export class User implements Deserializable {
  user_name?: string;
  nick_name?: string;
  email?: string;
  cell_phone?: string;
  phone?: {
    number?: string;
    internationalNumber?: string;
    nationalNumber?: string;
    countryCode?: string;
    areaCode?: string;
    dialCode?: string;
  };
  payment?: string;
  time_zone_info?: string;
  time_zone?: string;
  email_signature?: string;
  proxy_number?: string;
  proxy_number_id?: string;
  twilio_number?: string;
  proxy_phone?: {
    number?: string;
    is_released: false;
  };
  picture_profile =
    'https://lh3.googleusercontent.com/proxy/NRpN3V5W9fIvDBNRLe91DDGJxLDCwHYHiy02xKO6K7TsfHqN2u5Qb3A_FPasYEbIgQN0qqPqAUySLJZJHdYHCYv9lDa0dw';
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
  expired_at: Date;
  created_at: Date;
  updated_at: Date;
  last_logged: Date;
  sub_domain: string;
  social_link?: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  company = 'eXp Realty';
  affiliate?: {
    id?: string;
    link?: string;
    paypal?: string;
  };

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
