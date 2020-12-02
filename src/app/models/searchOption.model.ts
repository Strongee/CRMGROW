import { Deserializable } from './deserialize.model';

class LastMaterialCondition implements Deserializable {
  send_video: { flag: boolean; material: string } = {
    flag: false,
    material: undefined
  };
  send_image: { flag: boolean; material: string } = {
    flag: false,
    material: undefined
  };
  send_pdf: { flag: boolean; material: string } = {
    flag: false,
    material: undefined
  };
  watched_video: { flag: boolean; material: string } = {
    flag: false,
    material: undefined
  };
  watched_image: { flag: boolean; material: string } = {
    flag: false,
    material: undefined
  };
  watched_pdf: { flag: boolean; material: string } = {
    flag: false,
    material: undefined
  };

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
export class SearchOption implements Deserializable {
  _id: string;
  str: any = '';
  recruitingStageCondition: string[] = [];
  countryCondition: string;
  regionCondition: string[] = [];
  cityCondition: string;
  zipcodeCondition: string;
  tagsCondition: string[] = [];
  sourceCondition: string[] = [];
  brokerageCondition: string[] = [];
  activityCondition: string[] = [];
  labelCondition: string[] = [];
  lastMaterial: LastMaterialCondition = new LastMaterialCondition();
  materialCondition: any;
  includeLabel: boolean = true;
  includeLastActivity: boolean = true;
  includeBrokerage: boolean = true;
  includeSource: boolean = true;
  includeStage: boolean = true;
  includeTag: boolean = true;
  includeFollowUps: boolean = true;
  activityStart: Date;
  activityEnd: Date;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }

  isEmpty(): boolean {
    return (
      this.labelCondition.length &&
      this.recruitingStageCondition.length &&
      this.countryCondition &&
      this.regionCondition.length &&
      this.cityCondition &&
      this.zipcodeCondition &&
      this.tagsCondition.length &&
      this.brokerageCondition.length &&
      this.activityCondition.length &&
      this.sourceCondition.length &&
      this.lastMaterial.send_pdf.flag &&
      this.lastMaterial.send_video.flag &&
      this.lastMaterial.send_image.flag &&
      this.lastMaterial.watched_video.flag &&
      this.lastMaterial.watched_pdf.flag &&
      this.lastMaterial.watched_image.flag &&
      this.activityStart &&
      this.activityEnd &&
      this.materialCondition
    );
  }
}
