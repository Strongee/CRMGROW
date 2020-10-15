import { Deserializable } from './deserialize.model';

export class Video implements Deserializable {
  user: string;
  title: string;
  company: string;
  description: string;
  converted: string; // none | progress | completed
  uploaded: boolean;
  thumbnail: string;
  thumbnail_path: string;
  site_image: string;
  custom_thumbnail: boolean;
  preview: string;
  recording: boolean;
  path: string;
  type: string;
  duration: number;
  url: string;
  role: string;
  material_theme: string;
  default_edited: boolean;
  default_video: string;
  priority: number;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
