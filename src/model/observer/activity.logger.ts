import { User } from '../user/user.model';
import { UserAction } from '../user/user.types';
import { UserService } from '../user/user.service';
import { ActivityObserver } from './activity.observer';
import { Regular } from '../user/user.roles';

export class DatabaseActivityLogger implements ActivityObserver {
  async update<T extends Regular>(user: T, action: UserAction, metadata?: Record<string, any>): Promise<void> {
      if (action !== UserAction.PAGE_VIEW) {
        const r = await user.logAction(action);
        console.log('action logged' + r);
      }
  }
}