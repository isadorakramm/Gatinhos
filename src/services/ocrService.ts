import TextRecognition from '@react-native-ml-kit/text-recognition';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export async function extrairTextoReceita(imagemUri: string): Promise<string> {
  let uri = imagemUri;

  if (Platform.OS === 'android' && imagemUri.startsWith('content://')) {
    const destPath = `${RNFS.CachesDirectoryPath}/receita_temp.jpg`;
    await RNFS.copyFile(imagemUri, destPath);
    uri = `file://${destPath}`;
  }

  const result = await TextRecognition.recognize(uri);
  return result.text;
}
