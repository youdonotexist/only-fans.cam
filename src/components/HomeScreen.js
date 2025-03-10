import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

const fansData = [
    {
        category: "Mini Fans",
        items: [
            {
                name: "Micro Fan",
                image: require('../assets/fan1.png'),
                specs: {
                    RPMs: 2000,
                    airflow: "50 CFM",
                    energyUsage: "3W"
                }
            },
            {
                name: "Nano Fan",
                image: require('../assets/fan2.png'),
                specs: {
                    RPMs: 1500,
                    airflow: "100 CFM",
                    energyUsage: "8W"
                }
            }
        ]
    },
    {
        category: "Table Fans",
        items: [
            {
                name: "Standard Table Fan",
                image: require('../assets/fan3.png'),
                specs: {
                    RPMs: 2500,
                    airflow: "200 CFM",
                    energyUsage: "12W"
                }
            },
            {
                name: "Luxury Table Fan",
                image: require('../assets/fan4.png'),
                specs: {
                    RPMs: 3000,
                    airflow: "300 CFM",
                    energyUsage: "15W"
                }
            }
        ]
    }
];

const HomeScreen = ({ navigation }) => {
    return (
        <ScrollView style={styles.container}>
            {fansData.map((category, index) => (
                <View key={index} style={styles.categoryContainer}>
                    <Text style={styles.categoryTitle}>{category.category}</Text>
                    {category.items.map((fan, fanIndex) => (
                        <TouchableOpacity
                            key={fanIndex}
                            style={styles.fanItem}
                            onPress={() => navigation.navigate('FanDetails', { fan })}
                        >
                            <Image source={fan.image} style={styles.fanImage} />
                            <Text style={styles.fanName}>{fan.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    categoryContainer: {
        marginVertical: 20,
        paddingHorizontal: 20
    },
    categoryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    fanItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    fanImage: {
        width: 50,
        height: 50,
        marginRight: 20
    },
    fanName: {
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default HomeScreen;

