import { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import qrcode from 'qrcode-generator';
export function QrCode({ value }: { value: string }) {
  const { width } = useWindowDimensions();
  const svg = useMemo(() => {
    const code = qrcode(0, 'M');
    code.addData(value, 'Byte');
    code.make();
    return code.createSvgTag({ cellSize: 4, margin: 16, scalable: true });
  }, [value]);
  const size = Math.min(width - 48, 480);
  return (
    <View style={{ alignItems: 'center', backgroundColor: '#FFFFFF', padding: 4 }}>
      <SvgXml xml={svg} width={size} height={size} />
    </View>
  );
}
