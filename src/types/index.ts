export * from './user.types';
export * from './post.types';
export * from './message.types';
export * from './community.types';
export * from './notification.types';
export * from './point.types';
export * from './admin.types';

/** Generic loading state wrapper used by hooks to avoid nullable ambiguity. */
export interface AsyncState<TData> {
  readonly data: TData | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

/** Standard API/service result shape that avoids throwing inside UI handlers. */
export type ServiceResult<TData> =
  | { readonly ok: true; readonly data: TData }
  | { readonly ok: false; readonly error: string; readonly code?: string };
