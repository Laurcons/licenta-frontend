import { DxBoolean } from './dx-has-service.enum';

export interface DxCalendar {
  service_id: string;
  monday: DxBoolean;
  tuesday: DxBoolean;
  wednesday: DxBoolean;
  thursday: DxBoolean;
  friday: DxBoolean;
  saturday: DxBoolean;
  sunday: DxBoolean;
  start_date: string;
  end_date: string;
}
