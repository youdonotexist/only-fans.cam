import React from 'react';
import Sidebar from './Sidebar';
import styles from './FanWiki.module.css';

const FanWiki = () => {
    return (
        <div className={styles.container}>
            {/* Left Sidebar */}
            <Sidebar />
            
            <main className={styles.content}>
                <h1 className={styles.title}>Fan Wiki</h1>
                <p className={styles.intro}>
                    Welcome to the comprehensive guide to fans! This wiki provides information about 
                    different types of fans that exist in the world, their history, uses, and interesting facts.
                </p>
                
                <section className={styles.fanSection}>
                    <h2>Ceiling Fans</h2>
                    <p>
                        Ceiling fans are mounted to the ceiling of a room and circulate air to create a cooling effect.
                        They typically have 3-5 blades and can be operated at different speeds.
                    </p>
                    <h3>History</h3>
                    <p>
                        The first ceiling fans appeared in the 1860s and 1870s, powered by a stream of running water
                        that drove a turbine. Electric ceiling fans were introduced in the 1880s.
                    </p>
                    <h3>Benefits</h3>
                    <p>
                        - Creates air circulation in rooms
                        <br />
                        - Energy efficient compared to air conditioning
                        <br />
                        - Can be reversed in winter to circulate warm air
                    </p>
                </section>
                
                <section className={styles.fanSection}>
                    <h2>Table Fans</h2>
                    <p>
                        Table fans are portable electric fans designed to sit on a table or desk. They typically
                        have a circular base, adjustable tilt, and oscillation features.
                    </p>
                    <h3>Features</h3>
                    <p>
                        - Portable and lightweight
                        <br />
                        - Adjustable speed settings
                        <br />
                        - Oscillation for wider air distribution
                    </p>
                </section>
                
                <section className={styles.fanSection}>
                    <h2>Tower Fans</h2>
                    <p>
                        Tower fans are tall, slim fans with a vertical design that takes up minimal floor space.
                        They often include features like timers, remote controls, and air purification.
                    </p>
                    <h3>Advantages</h3>
                    <p>
                        - Space-saving design
                        <br />
                        - Quieter operation than many other fan types
                        <br />
                        - Often include additional features like air purification
                    </p>
                </section>
                
                <section className={styles.fanSection}>
                    <h2>Box Fans</h2>
                    <p>
                        Box fans are square-shaped, portable fans designed to sit on the floor or in a window.
                        They're known for their high airflow and simple design.
                    </p>
                    <h3>Uses</h3>
                    <p>
                        - Cooling rooms
                        <br />
                        - Improving air circulation
                        <br />
                        - Exhausting hot or stale air when placed in windows
                    </p>
                </section>
                
                <section className={styles.fanSection}>
                    <h2>Industrial Fans</h2>
                    <p>
                        Industrial fans are heavy-duty fans designed for commercial and industrial applications.
                        They come in various sizes and configurations for different purposes.
                    </p>
                    <h3>Types</h3>
                    <p>
                        - Centrifugal fans (blowers)
                        <br />
                        - Axial fans
                        <br />
                        - Drum fans
                        <br />
                        - Exhaust fans
                    </p>
                </section>
                
                <section className={styles.fanSection}>
                    <h2>Bladeless Fans</h2>
                    <p>
                        Bladeless fans use air multiplier technology to draw in air and amplify it without
                        exposed blades. They're known for their modern design and safety features.
                    </p>
                    <h3>Benefits</h3>
                    <p>
                        - Safer around children and pets (no exposed blades)
                        <br />
                        - Easier to clean
                        <br />
                        - Smoother airflow
                    </p>
                </section>
                
                <section className={styles.fanSection}>
                    <h2>Hand Fans</h2>
                    <p>
                        Hand fans are portable, manually operated devices used to create airflow by waving them back and forth.
                        They have been used across cultures for thousands of years.
                    </p>
                    <h3>Cultural Significance</h3>
                    <p>
                        Hand fans have played important roles in many cultures:
                        <br />
                        - In Japan, folding fans (sensu) are used in ceremonies and traditional dance
                        <br />
                        - In China, fans were associated with scholars and contained calligraphy or paintings
                        <br />
                        - In Europe, decorative fans became fashion accessories in the 17th-19th centuries
                    </p>
                </section>
                
                <section className={styles.fanSection}>
                    <h2>Computer Cooling Fans</h2>
                    <p>
                        Computer cooling fans are small fans used to remove heat from computer components
                        like CPUs, GPUs, and power supplies to prevent overheating.
                    </p>
                    <h3>Specifications</h3>
                    <p>
                        - Size: Typically measured in millimeters (80mm, 120mm, 140mm being common)
                        <br />
                        - Airflow: Measured in cubic feet per minute (CFM)
                        <br />
                        - Noise level: Measured in decibels (dB)
                        <br />
                        - Speed: Measured in revolutions per minute (RPM)
                    </p>
                </section>
            </main>
        </div>
    );
};

export default FanWiki;