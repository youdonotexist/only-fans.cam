import React from 'react';
import { View, Text, Image } from 'react-native';

const FanDetails = ({ route }) => {
    const { fan } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.detailTitle}>Fan Details: {fan.name}</Text>
            <Image source={fan.image} style={styles.selectedFanImage} />
            <View style={styles.specsContainer}>
                <Text style={styles.specText}>RPMs: {fan.specs.RPMs}</Text>
                <Text style={styles.specText}>Airflow: {fan.specs.airflow}</Text>
                <Text style={styles.specText}>Energy Usage: {fan.specs.energyUsage}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    selectedFanImage: {
        width: 150,
        height: 150,
        marginBottom: 20
    },
    specsContainer: {
        alignItems: 'center'
    },
    specText: {
        fontSize: 16,
        marginVertical: 5
    }
});

export default FanDetails;

