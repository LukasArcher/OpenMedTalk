import { Button, Notice, Stack } from './ui';
import { useApp } from '../state/app-state';
import { Modal, View } from 'react-native';
export function ConfirmAction({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t, colors } = useApp();
  return (
    <Modal transparent visible animationType="fade" onRequestClose={onCancel}>
      <View
        style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#00000066' }}
        accessibilityViewIsModal
      >
        <View style={{ padding: 24, borderRadius: 16, backgroundColor: colors.background }}>
          <Stack>
            <Notice text={message} />
            <Button primary label={t.confirm} onPress={onConfirm} />
            <Button label={t.cancel} onPress={onCancel} />
          </Stack>
        </View>
      </View>
    </Modal>
  );
}
