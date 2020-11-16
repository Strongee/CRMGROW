import { DetailActivity, PureActivity } from './activity.model';
import { Deserializable } from './deserialize.model';
import { Task } from './task.model';
import { Timeline } from './timeline.model';

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

  get fullAddress(): string {
    return `${this.address ? this.address + ' ' : ''}${
      this.city ? this.city + ' ' : ''
    }${this.state ? this.state + ' ' : ''}${
      this.country ? this.country + ' ' : ''
    }${this.zip ? this.zip + ' ' : ''}`;
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

export class ContactDetail extends Contact {
  activity: DetailActivity[];
  automation: {
    _id: string;
    title: string;
  };
  follow_up: Task[];
  time_lines: Timeline[];
  next: string;
  prev: string;

  created_at: Date;
  updated_at: Date;

  deserialize(input: any): this {
    Object.assign(this, input);
    this.activity = input.activity.map((e) =>
      new DetailActivity().deserialize(e)
    );
    return this;
  }

  get last_activity_time(): Date {
    if (!this.activity || !this.activity.length) {
      return new Date();
    }
    const last_activity = this.activity.slice(-1)[0];
    return last_activity.created_at;
  }
}
