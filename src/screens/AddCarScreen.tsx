import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Appbar, useTheme, Surface, Portal, Dialog, Text, List, Menu, Divider } from 'react-native-paper';
import { useCollection } from '../context/CollectionContext';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { parseOCRText, ParsedDiecastInfo } from '../utils/ocrParser';

const AddCarScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { addCar, brands, addBrand } = useCollection();

    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [scale, setScale] = useState('1:64');
    const [year, setYear] = useState('');
    const [condition, setCondition] = useState('New');
    const [notes, setNotes] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    const [ocrDialogVisible, setOcrDialogVisible] = useState(false);
    const [parsedInfo, setParsedInfo] = useState<ParsedDiecastInfo | null>(null);

    const [brandMenuVisible, setBrandMenuVisible] = useState(false);
    const [isCustomBrand, setIsCustomBrand] = useState(false);

    const handleAdd = () => {
        if (brand && model) {
            if (isCustomBrand) {
                addBrand(brand);
            }
            addCar({ brand, model, scale, year, condition, notes, imageUrl: imageUri || undefined });
            navigation.goBack();
        }
    };

    const handlePickImage = async (useCamera: boolean) => {
        const options = {
            mediaType: 'photo' as const,
            quality: 0.8 as const,
        };

        const result = useCamera ? await launchCamera(options) : await launchImageLibrary(options);

        if (result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri || null);
        }
    };

    const handleScanBox = async () => {
        const options = {
            mediaType: 'photo' as const,
            quality: 1 as const,
        };

        const result = await launchCamera(options);

        if (result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            if (uri) {
                setImageUri(uri);
                try {
                    const visionResult = await TextRecognition.recognize(uri);
                    const info = parseOCRText(visionResult.text);
                    setParsedInfo(info);
                    setOcrDialogVisible(true);
                } catch (e) {
                    console.error('OCR failed', e);
                }
            }
        }
    };

    const confirmOCR = () => {
        if (parsedInfo) {
            setBrand(parsedInfo.brand || parsedInfo.manufacturer);
            setModel(parsedInfo.model);
            setScale(parsedInfo.scale);
            if (parsedInfo.modelId) {
                setNotes(prev => `Model ID: ${parsedInfo.modelId}\n${prev}`);
            }
            setOcrDialogVisible(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Add New Car" />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface} elevation={1}>
                    <View style={styles.imageContainer}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.image} />
                        ) : (
                            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Text variant="bodyMedium">No image selected</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.buttonRow}>
                        <Button icon="camera" mode="contained-tonal" style={styles.flexButton} onPress={() => handlePickImage(true)}>
                            Photo
                        </Button>
                        <Button icon="image" mode="contained-tonal" style={styles.flexButton} onPress={() => handlePickImage(false)}>
                            Gallery
                        </Button>
                        <Button icon="scan-helper" mode="contained" style={styles.flexButton} onPress={handleScanBox}>
                            Scan Box
                        </Button>
                    </View>

                    <View style={styles.inputContainer}>
                        <Menu
                            visible={brandMenuVisible}
                            onDismiss={() => setBrandMenuVisible(false)}
                            anchor={
                                <TouchableOpacity onPress={() => setBrandMenuVisible(true)}>
                                    <TextInput
                                        label="Brand"
                                        value={brand}
                                        editable={isCustomBrand}
                                        onChangeText={setBrand}
                                        style={styles.input}
                                        mode="outlined"
                                        right={<TextInput.Icon icon="chevron-down" onPress={() => setBrandMenuVisible(true)} />}
                                    />
                                </TouchableOpacity>
                            }
                        >
                            {brands.map((b) => (
                                <Menu.Item key={b} onPress={() => { setBrand(b); setIsCustomBrand(false); setBrandMenuVisible(false); }} title={b} />
                            ))}
                            <Divider />
                            <Menu.Item onPress={() => { setBrand(''); setIsCustomBrand(true); setBrandMenuVisible(false); }} title="Add Custom Brand..." />
                        </Menu>

                        <TextInput
                            label="Model"
                            value={model}
                            onChangeText={setModel}
                            style={styles.input}
                            mode="outlined"
                        />

                        <View style={styles.row}>
                            <TextInput
                                label="Scale"
                                value={scale}
                                onChangeText={setScale}
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                                mode="outlined"
                            />
                            <TextInput
                                label="Year"
                                value={year}
                                onChangeText={setYear}
                                keyboardType="numeric"
                                style={[styles.input, { flex: 1 }]}
                                mode="outlined"
                            />
                        </View>

                        <TextInput
                            label="Condition"
                            value={condition}
                            onChangeText={setCondition}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Notes"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                            mode="outlined"
                        />
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleAdd}
                        style={styles.button}
                        disabled={!brand || !model}
                    >
                        Add to Collection
                    </Button>
                </Surface>
            </ScrollView>

            <Portal>
                <Dialog visible={ocrDialogVisible} onDismiss={() => setOcrDialogVisible(false)}>
                    <Dialog.Title>OCR Result</Dialog.Title>
                    <Dialog.Content>
                        {parsedInfo && (
                            <>
                                <Text variant="bodyMedium">Detected following info from box art:</Text>
                                <List.Item title="Make/Artist" description={parsedInfo.brand || 'Unknown'} />
                                <Divider />
                                <List.Item title="Model" description={parsedInfo.model || 'Unknown'} />
                                <Divider />
                                <List.Item title="Manufacturer" description={parsedInfo.manufacturer || 'Unknown'} />
                                <Divider />
                                <List.Item title="Scale" description={parsedInfo.scale} />
                                <Divider />
                                <List.Item title="Model ID" description={parsedInfo.modelId || 'None'} />
                            </>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setOcrDialogVisible(false)}>Cancel</Button>
                        <Button onPress={confirmOCR}>Confirm & Fill</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    surface: {
        padding: 16,
        borderRadius: 8,
    },
    imageContainer: {
        height: 200,
        width: '100%',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 8,
    },
    flexButton: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    button: {
        marginTop: 8,
    },
});

export default AddCarScreen;
