import { User } from '../user/user.model';
import { UserAction } from '../user/user.types';

export interface ActivityObserver {
  update(user: User, action: UserAction, metadata?: Record<string, any>): void;
}

export interface ActivitySubject {
  attach(observer: ActivityObserver): void;
  detach(observer: ActivityObserver): void;
  notify(user: User, action: UserAction, metadata?: Record<string, any>): void;
}