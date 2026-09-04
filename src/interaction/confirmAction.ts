import type { ConfirmationDependencies, ConfirmationRequest } from './types.js';

/*** Confirm an action with an injected synchronous confirm implementation or fallback alert buttons. */
export function confirmAction(
  request: ConfirmationRequest,
  dependencies: ConfirmationDependencies,
  onConfirm: () => void,
): void {
  if (dependencies.preferConfirm && dependencies.confirm) {
    if (dependencies.confirm(request.message)) onConfirm();
    return;
  }

  dependencies.alert(request.title, request.message, [
    { text: request.cancelText ?? 'Cancel', style: 'cancel' },
    {
      text: request.confirmText,
      style: request.destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}
