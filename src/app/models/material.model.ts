import { Deserializable } from './deserialize.model';

export class Material implements Deserializable {
  user: any;
  team: any;
  title: string;
  description: string;
  url: string;
  path: string;
  type: string;
  material_type: string;
  folder: string;
  shared_materials: string[];
  role: string;
  company: string;
  preview: string;
  thumbnail: string;
  thumbnail_path: string;
  custom_thumbnail: boolean;
  site_image: string;
  material_theme: string;
  priority: number;
  converted: string; // none | progress | completed
  uploaded: boolean;
  recording: boolean;
  duration: number;
  default_edited: boolean;
  default_video: string;
  del: boolean;
  created_at: Date;
  updated_at: Date;
  views: number;
  _id: string;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
