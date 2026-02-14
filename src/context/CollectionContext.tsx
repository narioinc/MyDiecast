import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Car {
    id: string;
    brand: string;
    model: string;
    scale: string;
    year?: string;
    condition: string;
    imageUrl?: string;
    notes?: string;
}

const INITIAL_BRANDS = [
    'Hot Wheels', 'Matchbox', 'MINIGT', 'Pop race', 'CCA', 'Para64',
    'Inno64', 'KaidoHouse', 'Bburago', 'Maisto', 'BBR', 'Tomica',
    'Tarmac Works', 'Solido', 'Greenlight'
];

interface CollectionContextType {
    cars: Car[];
    brands: string[];
    addCar: (car: Omit<Car, 'id'>) => void;
    removeCar: (id: string) => void;
    updateCar: (car: Car) => void;
    addBrand: (brand: string) => void;
    shareCollection: () => Promise<void>;
    importCollection: () => Promise<boolean>;
    clearCollection: () => Promise<void>;
    isLoading: boolean;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

const CARS_STORAGE_KEY = '@mydiecast_cars';
const BRANDS_STORAGE_KEY = '@mydiecast_brands';

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
    const [cars, setCars] = useState<Car[]>([]);
    const [brands, setBrands] = useState<string[]>(INITIAL_BRANDS);
    const [isLoading, setIsLoading] = useState(true);

    // Load data from AsyncStorage on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedCars = await AsyncStorage.getItem(CARS_STORAGE_KEY);
                const storedBrands = await AsyncStorage.getItem(BRANDS_STORAGE_KEY);

                if (storedCars) setCars(JSON.parse(storedCars));
                if (storedBrands) {
                    const parsedBrands = JSON.parse(storedBrands);
                    // Combine initial and stored brands, avoiding duplicates
                    setBrands([...new Set([...INITIAL_BRANDS, ...parsedBrands])]);
                }
            } catch (e) {
                console.error('Failed to load data from storage', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Save cars whenever they change
    useEffect(() => {
        if (!isLoading) {
            AsyncStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(cars));
        }
    }, [cars, isLoading]);

    // Save brands whenever they change
    useEffect(() => {
        if (!isLoading) {
            const customBrands = brands.filter(b => !INITIAL_BRANDS.includes(b));
            AsyncStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(customBrands));
        }
    }, [brands, isLoading]);

    const addCar = (car: Omit<Car, 'id'>) => {
        const newCar = { ...car, id: Math.random().toString(36).substr(2, 9) };
        setCars(prevCars => [...prevCars, newCar]);
    };

    const removeCar = (id: string) => {
        setCars(prevCars => prevCars.filter((car) => car.id !== id));
    };

    const updateCar = (updatedCar: Car) => {
        setCars(prevCars => prevCars.map((car) => (car.id === updatedCar.id ? updatedCar : car)));
    };

    const shareCollection = async () => {
        const RNFS = require('react-native-fs');
        const Share = require('react-native-share').default;

        const collectionData = {
            exportedAt: new Date().toISOString(),
            cars,
            customBrands: brands.filter(b => !INITIAL_BRANDS.includes(b))
        };

        const jsonPath = `${RNFS.TemporaryDirectoryPath}/MyDiecast_Collection.json`;

        try {
            await RNFS.writeFile(jsonPath, JSON.stringify(collectionData, null, 2), 'utf8');

            await Share.open({
                url: `file://${jsonPath}`,
                type: 'application/json',
                title: 'Share MyDiecast Collection',
                message: 'Here is my diecast car collection!',
                failOnCancel: false,
            });
        } catch (error) {
            console.error('Sharing failed', error);
        }
    };

    const addBrand = (newBrand: string) => {
        if (newBrand && !brands.includes(newBrand)) {
            setBrands(prevBrands => [...prevBrands, newBrand].sort());
        }
    };

    const importCollection = async () => {
        const { pick } = require('@react-native-documents/picker');
        const RNFS = require('react-native-fs');

        try {
            const [result] = await pick({
                type: ['application/json'],
            });

            if (result && result.uri) {
                const content = await RNFS.readFile(result.uri, 'utf8');
                const importedData = JSON.parse(content);

                if (importedData.cars && Array.isArray(importedData.cars)) {
                    setCars(importedData.cars);
                    if (importedData.customBrands) {
                        setBrands([...new Set([...INITIAL_BRANDS, ...importedData.customBrands])]);
                    }
                    return true;
                }
            }
        } catch (error: any) {
            if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
                console.error('Import failed', error);
            }
        }
        return false;
    };

    const clearCollection = async () => {
        setCars([]);
        setBrands(INITIAL_BRANDS);
        await AsyncStorage.removeItem(CARS_STORAGE_KEY);
        await AsyncStorage.removeItem(BRANDS_STORAGE_KEY);
    };

    return (
        <CollectionContext.Provider value={{
            cars,
            brands,
            addCar,
            removeCar,
            updateCar,
            addBrand,
            shareCollection,
            importCollection,
            clearCollection,
            isLoading
        }}>
            {children}
        </CollectionContext.Provider>
    );
};

export const useCollection = () => {
    const context = useContext(CollectionContext);
    if (context === undefined) {
        throw new Error('useCollection must be used within a CollectionProvider');
    }
    return context;
};
