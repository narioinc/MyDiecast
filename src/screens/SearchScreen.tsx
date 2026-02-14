import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Appbar, useTheme, Surface, Text, List, Card } from 'react-native-paper';
import { useCollection, Car } from '../context/CollectionContext';
import { useNavigation } from '@react-navigation/native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { parseOCRText } from '../utils/ocrParser';
import ImagePreviewModal from '../components/ImagePreviewModal';
import Fuse from 'fuse.js';

const SearchScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { cars } = useCollection();

    const [searchQuery, setSearchQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ found: boolean; car?: Car } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fuse = useMemo(() => {
        return new Fuse(cars, {
            keys: ['brand', 'model', 'notes'],
            threshold: 0.4,
            includeScore: true,
        });
    }, [cars]);

    const fuzzyResults = useMemo(() => {
        if (!searchQuery) return [];
        return fuse.search(searchQuery).map(result => result.item);
    }, [fuse, searchQuery]);

    const handleScanSearch = async () => {
        const options = { mediaType: 'photo' as const, quality: 1 as const };
        const result = await launchCamera(options);

        if (result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            if (uri) {
                setIsScanning(true);
                try {
                    const visionResult = await TextRecognition.recognize(uri);
                    const info = parseOCRText(visionResult.text);
                    const searchKey = `${info.brand} ${info.model} ${info.modelId}`;
                    const results = fuse.search(searchKey);

                    if (results.length > 0 && results[0].score! < 0.5) {
                        setScanResult({ found: true, car: results[0].item });
                    } else {
                        setScanResult({ found: false });
                    }
                } catch (e) {
                    console.error('OCR Search failed', e);
                } finally {
                    setIsScanning(false);
                }
            }
        }
    };

    const renderCarItem = ({ item }: { item: Car }) => (
        <View style={styles.resultCardContainer}>
            <Card
                style={styles.resultCard}
                onPress={() => (navigation as any).navigate('CarDetail', { carId: item.id })}
            >
                <View style={styles.cardContentRow}>
                    <TouchableOpacity onPress={() => item.imageUrl && setPreviewUrl(item.imageUrl)}>
                        <View style={styles.imageWrapper}>
                            {item.imageUrl ? (
                                <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                            ) : (
                                <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <List.Icon icon="car" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    <View style={styles.textWrapper}>
                        <Text variant="titleMedium" style={styles.itemTitle}>{item.brand} {item.model}</Text>
                        <Text variant="bodySmall" style={styles.itemSubtitle}>{item.scale} | {item.condition}</Text>
                    </View>
                </View>
            </Card>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Search Collection" titleStyle={styles.appTitle} />
            </Appbar.Header>

            <View style={styles.searchHeader}>
                <TextInput
                    label="Search models, brands..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor={theme.colors.primary}
                    left={<TextInput.Icon icon="magnify" />}
                    right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : null}
                />
                <Button
                    icon="camera"
                    mode="contained"
                    onPress={handleScanSearch}
                    loading={isScanning}
                    style={styles.scanButton}
                    contentStyle={styles.scanButtonContent}
                >
                    Scan Box Art
                </Button>
            </View>

            {scanResult && (
                <View style={styles.scanResultWrapper}>
                    {scanResult.found ? (
                        <Card style={[styles.resultCard, styles.successBorder]}>
                            <Card.Title
                                title="Car Found!"
                                subtitle="Matched in your collection"
                                left={(props) => <List.Icon {...props} icon="check-circle" color={theme.colors.primary} />}
                                right={() => <IconButton icon="close" onPress={() => setScanResult(null)} />}
                            />
                            {renderCarItem({ item: scanResult.car! })}
                        </Card>
                    ) : (
                        <Surface style={[styles.surface, styles.errorBorder]} elevation={1}>
                            <List.Item
                                title="Not Found"
                                description="This car isn't in your collection yet."
                                left={(props) => <List.Icon {...props} icon="alert-circle" color={theme.colors.error} />}
                                right={() => <Button onPress={() => setScanResult(null)}>Clear</Button>}
                            />
                        </Surface>
                    )}
                </View>
            )}

            <FlatList
                data={fuzzyResults}
                renderItem={renderCarItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    searchQuery && !fuzzyResults.length ? (
                        <View style={styles.emptyResults}>
                            <Text variant="bodyMedium" style={{ opacity: 0.6 }}>No matches found</Text>
                        </View>
                    ) : null
                }
            />

            <ImagePreviewModal
                visible={!!previewUrl}
                imageUrl={previewUrl || ''}
                onDismiss={() => setPreviewUrl(null)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    appTitle: {
        fontWeight: 'bold',
    },
    searchHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    searchInput: {
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    scanButton: {
        borderRadius: 8,
    },
    scanButtonContent: {
        height: 48,
    },
    surface: {
        padding: 16,
        borderRadius: 12,
    },
    scanResultWrapper: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    resultCardContainer: {
        marginBottom: 4,
    },
    resultCard: {
        marginBottom: 12,
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
    },
    cardContentRow: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    imageWrapper: {
        width: 64,
        height: 64,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrapper: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: 'bold',
    },
    itemSubtitle: {
        opacity: 0.7,
    },
    successBorder: {
        borderColor: '#4CAF50',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    errorBorder: {
        borderColor: '#F44336',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyResults: {
        padding: 40,
        alignItems: 'center',
    }
});

import { IconButton } from 'react-native-paper';

export default SearchScreen;
