import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Appbar, useTheme, Surface, Portal, Dialog, Text, List, Menu, Divider } from 'react-native-paper';
import { useCollection } from '../context/CollectionContext';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { parseOCRText, ParsedDiecastInfo } from '../utils/ocrParser';
import { detectAndCrop } from '../utils/CropUtils';
import { Snackbar } from 'react-native-paper';

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

    const [cropMessageVisible, setCropMessageVisible] = useState(false);

    const [ocrDialogVisible, setOcrDialogVisible] = useState(false);
    const [parsedInfo, setParsedInfo] = useState<ParsedDiecastInfo | null>(null);

    // Editable OCR Fields
    const [editBrand, setEditBrand] = useState('');
    const [editModel, setEditModel] = useState('');
    const [editScale, setEditScale] = useState('');
    const [editModelId, setEditModelId] = useState('');
    const [editManufacturer, setEditManufacturer] = useState('');

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
            const uri = result.assets[0].uri;
            if (uri) {
                // Attempt auto-crop
                const cropResult = await detectAndCrop(uri);
                if (cropResult) {
                    setImageUri(cropResult.uri);
                    setCropMessageVisible(true);
                } else {
                    setImageUri(uri);
                }
            }
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
                let finalUri = uri;
                // Attempt auto-crop first to improve OCR
                const cropResult = await detectAndCrop(uri);
                if (cropResult) {
                    finalUri = cropResult.uri;
                    setCropMessageVisible(true);
                }

                setImageUri(finalUri);
                try {
                    const visionResult = await TextRecognition.recognize(finalUri);
                    const info = parseOCRText(visionResult.text);
                    setParsedInfo(info);

                    // Populate editable fields
                    setEditBrand(info.brand || '');
                    setEditModel(info.model || '');
                    setEditScale(info.scale || '1:64');
                    setEditModelId(info.modelId || '');
                    setEditManufacturer(info.manufacturer || '');

                    setOcrDialogVisible(true);
                } catch (e) {
                    console.error('OCR failed', e);
                }
            }
        }
    };

    const confirmOCR = () => {
        setBrand(editBrand || editManufacturer);
        setModel(editModel);
        setScale(editScale);
        if (editModelId) {
            setNotes(prev => `Model ID: ${editModelId}\n${prev}`);
        }
        setOcrDialogVisible(false);
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
                    <Dialog.Title>Verify Detection</Dialog.Title>
                    <Dialog.Content>
                        <ScrollView style={{ maxHeight: 300 }}>
                            <Text variant="bodySmall" style={{ marginBottom: 16, opacity: 0.7 }}>
                                Review and correct the information detected from the box art.
                            </Text>

                            <TextInput
                                label="Brand"
                                value={editBrand}
                                onChangeText={setEditBrand}
                                mode="outlined"
                                dense
                                style={styles.dialogInput}
                            />

                            <TextInput
                                label="Model"
                                value={editModel}
                                onChangeText={setEditModel}
                                mode="outlined"
                                dense
                                style={styles.dialogInput}
                            />

                            <TextInput
                                label="Manufacturer"
                                value={editManufacturer}
                                onChangeText={setEditManufacturer}
                                mode="outlined"
                                dense
                                style={styles.dialogInput}
                            />

                            <View style={styles.row}>
                                <TextInput
                                    label="Scale"
                                    value={editScale}
                                    onChangeText={setEditScale}
                                    mode="outlined"
                                    dense
                                    style={[styles.dialogInput, { flex: 1, marginRight: 8 }]}
                                />
                                <TextInput
                                    label="Model ID"
                                    value={editModelId}
                                    onChangeText={setEditModelId}
                                    mode="outlined"
                                    dense
                                    style={[styles.dialogInput, { flex: 1 }]}
                                />
                            </View>
                        </ScrollView>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setOcrDialogVisible(false)}>Cancel</Button>
                        <Button onPress={confirmOCR}>Confirm & Fill</Button>
                    </Dialog.Actions>
                </Dialog>
                <Snackbar
                    visible={cropMessageVisible}
                    onDismiss={() => setCropMessageVisible(false)}
                    duration={3000}
                    action={{
                        label: 'OK',
                        onPress: () => setCropMessageVisible(false),
                    }}
                >
                    Auto-cropped to car/box 📸
                </Snackbar>
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
    dialogInput: {
        marginBottom: 12,
    },
});

export default AddCarScreen;
