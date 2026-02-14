import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, useTheme, Surface, List, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCollection, Car } from '../context/CollectionContext';

const CarDetailScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { cars } = useCollection();

    const { carId } = route.params;
    const car = cars.find((c) => c.id === carId);

    if (!car) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Error" />
                </Appbar.Header>
                <View style={styles.center}>
                    <Text variant="bodyLarge">Car not found</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={`${car.brand} ${car.model}`} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface} elevation={1}>
                    <List.Item
                        title="Brand"
                        description={car.brand}
                        left={(props) => <List.Icon {...props} icon="car" />}
                    />
                    <Divider />
                    <List.Item
                        title="Model"
                        description={car.model}
                        left={(props) => <List.Icon {...props} icon="tag" />}
                    />
                    <Divider />
                    <List.Item
                        title="Scale"
                        description={car.scale}
                        left={(props) => <List.Icon {...props} icon="magnify-plus-outline" />}
                    />
                    <Divider />
                    {car.year && (
                        <>
                            <List.Item
                                title="Year"
                                description={car.year}
                                left={(props) => <List.Icon {...props} icon="calendar" />}
                            />
                            <Divider />
                        </>
                    )}
                    <List.Item
                        title="Condition"
                        description={car.condition}
                        left={(props) => <List.Icon {...props} icon="shield-check" />}
                    />
                    {car.notes && (
                        <>
                            <Divider />
                            <View style={styles.notesContainer}>
                                <Text variant="titleMedium" style={styles.notesTitle}>Notes</Text>
                                <Text variant="bodyMedium">{car.notes}</Text>
                            </View>
                        </>
                    )}
                </Surface>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    surface: {
        padding: 8,
        borderRadius: 8,
    },
    notesContainer: {
        padding: 16,
    },
    notesTitle: {
        marginBottom: 8,
        opacity: 0.7,
    },
});

export default CarDetailScreen;
