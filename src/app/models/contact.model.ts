import { PureActivity } from './activity.model';
import { Deserializable } from './deserialize.model';

export class Contact implements Deserializable {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  user: string;
  last_activity: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  label: string;
  cell_phone: string;
  country: string;
  auto_follow_up: string;
  source: string;
  brokerage: string;
  tags: string[];
  recruiting_stage: string;
  website: string;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }

  get fullName(): string {
    if (this.first_name && this.last_name) {
      return this.first_name + ' ' + this.last_name;
    } else if (this.first_name) {
      return this.first_name;
    } else if (this.last_activity) {
      return this.last_name;
    } else {
      return 'Unnamed Contact';
    }
  }

  get avatarName(): string {
    if (this.first_name && this.last_name) {
      return this.first_name[0] + this.last_name[0];
    } else if (this.first_name) {
      return this.first_name.substring(0, 2);
    } else if (this.last_activity) {
      return this.last_name.substring(0, 2);
    } else {
      return 'UN';
    }
  }

  get shortName(): string {
    if (this.first_name && this.last_name) {
      return this.first_name + ' ' + this.last_name[0];
    } else if (this.first_name) {
      return this.first_name;
    } else if (this.last_activity) {
      return this.last_name;
    } else {
      return 'Unnamed';
    }
  }
}

export class ContactActivity implements Deserializable {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  user: string;
  last_activity: PureActivity;
  address: string;
  city: string;
  state: string;
  zip: string;
  label: string;
  cell_phone: string;
  country: string;
  auto_follow_up: string;
  source: string;
  brokerage: string;
  tags: string[];
  recruiting_stage: string;
  website: string;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }

  get fullName(): string {
    if (this.first_name && this.last_name) {
      return this.first_name + ' ' + this.last_name;
    } else if (this.first_name) {
      return this.first_name;
    } else if (this.last_activity) {
      return this.last_name;
    } else {
      return 'Unnamed Contact';
    }
  }

  get avatarName(): string {
    if (this.first_name && this.last_name) {
      return this.first_name[0] + this.last_name[0];
    } else if (this.first_name) {
      return this.first_name.substring(0, 2);
    } else if (this.last_activity) {
      return this.last_name.substring(0, 2);
    } else {
      return 'UN';
    }
  }

  get shortName(): string {
    if (this.first_name && this.last_name) {
      return this.first_name + ' ' + this.last_name[0];
    } else if (this.first_name) {
      return this.first_name;
    } else if (this.last_activity) {
      return this.last_name;
    } else {
      return 'Unnamed';
    }
  }

  get moreTag(): string {
    if (this.tags.length > 1) {
      return '+' + (this.tags.length - 1) + ' more';
    }
    return '';
  }
}
