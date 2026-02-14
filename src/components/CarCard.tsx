import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Card, Text, IconButton, useTheme, List } from 'react-native-paper';
import { Car } from '../context/CollectionContext';

interface CarCardProps {
    car: Car;
    onPress: () => void;
    onDelete: () => void;
    onImagePress?: () => void;
}

const CarCard = ({ car, onPress, onDelete, onImagePress }: CarCardProps) => {
    const theme = useTheme();

    return (
        <Card style={styles.card} onPress={onPress}>
            <View style={styles.contentRow}>
                {car.imageUrl && (
                    <TouchableOpacity onPress={onImagePress} style={styles.imageContainer}>
                        <Image source={{ uri: car.imageUrl }} style={styles.thumbnail} />
                    </TouchableOpacity>
                )}
                <View style={styles.textContainer}>
                    <Card.Title
                        title={`${car.brand} ${car.model}`}
                        titleStyle={styles.title}
                        subtitle={`${car.scale} | ${car.condition}`}
                        right={(props) => (
                            <IconButton
                                {...props}
                                icon="delete-outline"
                                onPress={onDelete}
                                iconColor={theme.colors.error}
                            />
                        )}
                    />
                    <Card.Content>
                        {car.year && <Text variant="bodySmall">Year: {car.year}</Text>}
                        {car.notes && (
                            <Text variant="bodySmall" numberOfLines={1} style={styles.notes}>
                                {car.notes}
                            </Text>
                        )}
                    </Card.Content>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        overflow: 'hidden',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        width: 80,
        height: 80,
        marginLeft: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    notes: {
        marginTop: 2,
        opacity: 0.6,
        fontStyle: 'italic',
    },
});

export default CarCard;
