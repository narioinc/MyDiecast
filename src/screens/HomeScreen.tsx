import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, FAB, Appbar, useTheme, Button, Searchbar } from 'react-native-paper';
import { useCollection } from '../context/CollectionContext';
import { useNavigation } from '@react-navigation/native';
import CarCard from '../components/CarCard';
import ImagePreviewModal from '../components/ImagePreviewModal';
import SideDrawer from '../components/SideDrawer';

const HomeScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const { cars, removeCar, shareCollection, importCollection } = useCollection();

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const renderItem = ({ item }: { item: any }) => (
        <CarCard
            car={item}
            onPress={() => navigation.navigate('CarDetail', { carId: item.id })}
            onDelete={() => removeCar(item.id)}
            onImagePress={() => setPreviewUrl(item.imageUrl || null)}
        />
    );

    const handleDrawerAction = async (action: string) => {
        setDrawerVisible(false);
        switch (action) {
            case 'search':
                navigation.navigate('Search');
                break;
            case 'share':
            case 'export':
                await shareCollection();
                break;
            case 'import':
                const success = await importCollection();
                if (success) {
                    Alert.alert('Success', 'Collection imported successfully!');
                }
                break;
            case 'settings':
                navigation.navigate('Settings');
                break;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.Action icon="menu" onPress={() => setDrawerVisible(true)} />
                <Appbar.Content title="MyDiecast" titleStyle={styles.appTitle} />
                <Appbar.Action icon="magnify" onPress={() => navigation.navigate('Search')} />
            </Appbar.Header>

            {cars.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=2670&auto=format&fit=crop' }}
                        style={styles.emptyImage}
                    />
                    <Text variant="headlineSmall" style={styles.emptyText}>
                        Collection Empty
                    </Text>
                    <Text variant="bodyMedium" style={styles.emptySubText}>
                        Start your journey by adding a diecast.
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('AddCar')}
                        style={styles.addNowButton}
                    >
                        Add Your First Car
                    </Button>
                </View>
            ) : (
                <FlatList
                    data={cars}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color={theme.colors.onPrimary}
                onPress={() => navigation.navigate('AddCar')}
            />

            <ImagePreviewModal
                visible={!!previewUrl}
                imageUrl={previewUrl || ''}
                onDismiss={() => setPreviewUrl(null)}
            />

            <SideDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                onItemPress={handleDrawerAction}
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
        letterSpacing: 0.5,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyImage: {
        width: 200,
        height: 120,
        borderRadius: 12,
        marginBottom: 24,
        opacity: 0.8,
    },
    emptyText: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubText: {
        opacity: 0.6,
        textAlign: 'center',
        marginBottom: 24,
    },
    addNowButton: {
        borderRadius: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        borderRadius: 16,
        elevation: 4,
    },
});

export default HomeScreen;
