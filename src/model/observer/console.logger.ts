import { User } from '../user/user.model';
import { UserAction } from '../user/user.types';
import { ActivityObserver } from './activity.observer';

export class ConsoleActivityLogger implements ActivityObserver {
  update(user: User, action: UserAction, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const url = metadata?.url || 'Unknown URL';
    const username = user?.username || 'Anonymous';
    
    console.log(`[${timestamp}] User ${username} visited: ${url}`);
  }
}
