import React, { useState } from 'react';
import { View, Text, TextInput, Button, ProgressBarAndroid, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!url) return Alert.alert('Paste a valid URL first');

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required to save file');
      return;
    }

    const filename = url.split('/').pop();
    const fileUri = FileSystem.documentDirectory + filename;

    setDownloading(true);

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setProgress(progress);
      }
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
      Alert.alert('Download complete', `File saved to Downloads: ${filename}`);
    } catch (e) {
      Alert.alert('Download failed', e.message);
    }

    setDownloading(false);
    setProgress(0);
    setUrl('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Downloader</Text>
      <TextInput
        placeholder="Paste download link"
        style={styles.input}
        value={url}
        onChangeText={setUrl}
      />
      <Button title="Download" onPress={handleDownload} disabled={downloading} />
      {downloading && <ProgressBarAndroid styleAttr="Horizontal" progress={progress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 20 }
});
