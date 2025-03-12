import { User } from '../user/user.model';
import { Regular } from '../user/user.roles';
import { UserAction } from '../user/user.types';
import { ActivityObserver, ActivitySubject } from './activity.observer';

export class UserActivitySubject implements ActivitySubject {
  private static instance: UserActivitySubject;
  private observers: ActivityObserver[] = [];

  private constructor() {}

  public static getInstance(): UserActivitySubject {
    if (!UserActivitySubject.instance) {
      UserActivitySubject.instance = new UserActivitySubject();
    }
    return UserActivitySubject.instance;
  }

  public attach(observer: ActivityObserver): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  public detach(observer: ActivityObserver): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
  }

  public notify<T extends Regular>(user: T, action: UserAction, metadata?: Record<string, any>): void {
    for (const observer of this.observers) {
      observer.update(user, action, metadata);
    }
  }
}