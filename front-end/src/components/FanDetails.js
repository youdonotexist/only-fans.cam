import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './FanDetails.css';

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

const findFan = (name) => {
    for (const category of fansData) {
        const fan = category.items.find(item => item.name === name);
        if (fan) return fan;
    }
    return null;
};

const FanDetails = () => {
    let { name } = useParams();
    const fan = findFan(name);

    return (
        <div className={styles.container}>
            {fan ? (
                <>
                    <h1>Fan Details: {fan.name}</h1>
                    <img src={fan.image} alt={fan.name} className={styles.selectedFanImage} />
                    <div className={styles.specsContainer}>
                        <p>RPMs: {fan.specs.RPMs}</p>
                        <p>Airflow: {fan.specs.airflow}</p>
                        <p>Energy Usage: {fan.specs.energyUsage}</p>
                    </div>
                </>
            ) : (
                <h1>Fan not found</h1>
            )}
        </div>
    );
};

export default FanDetails;
