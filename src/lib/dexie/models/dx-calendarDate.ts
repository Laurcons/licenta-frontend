import { DxBoolean } from './dx-has-service.enum';

export interface DxCalendarDate {
  service_id: string;
  date: string;
  /** `true` if has service, `false` otherwise */
  exception_type: DxBoolean;
}
