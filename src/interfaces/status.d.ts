import {
  ACTIVE_STATUS,
  INACTIVE_STATUS,
  BANNED_STATUS
} from '@constants/status.constant'

export type IStatus =
  | typeof ACTIVE_STATUS
  | typeof INACTIVE_STATUS
  | typeof BANNED_STATUS
