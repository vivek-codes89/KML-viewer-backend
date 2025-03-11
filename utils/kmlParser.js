const xml2js = require('xml2js');

class KmlParser {
    static async parseKMLFile(buffer) {
        const parser = new xml2js.Parser();
        try {
            const result = await parser.parseStringPromise(buffer);
            const elements = this.extractElements(result);
            return {
                elements,
                summary: this.generateSummary(elements),
                detailed: this.generateDetailed(elements)
            };
        } catch (error) {
            console.log(">>>>>>>>>errors",error)
            throw new Error('Failed to parse KML file');
        }
    }

    static extractElements(kmlData) {
        const elements = [];
        if (kmlData.kml && kmlData.kml.Document) {
            const document = kmlData.kml.Document[0];
            this.processPlacemarks(document.Placemark || [], elements);
            this.processFolders(document.Folder || [], elements);
        }
        return elements;
    }

    static processPlacemarks(placemarks, elements) {
        placemarks.forEach(placemark => {
            const element = this.createElementFromPlacemark(placemark);
            if (element) {
                elements.push(element);
            }
        });
    }

    static processFolders(folders, elements) {
        folders.forEach(folder => {
            if (folder.Placemark) {
                this.processPlacemarks(folder.Placemark, elements);
            }
        });
    }

    static createElementFromPlacemark(placemark) {
        const properties = {
            name: placemark.name?.[0],
            description: placemark.description?.[0]
        };

        if (placemark.Point) {
            return {
                type: 'Point',
                coordinates: this.parseCoordinates(placemark.Point[0].coordinates[0]),
                properties
            };
        } else if (placemark.LineString) {
            const coordinates = this.parseCoordinates(placemark.LineString[0].coordinates[0]);
            return {
                type: 'LineString',
                coordinates,
                properties,
                length: this.calculateLength(coordinates)
            };
        } else if (placemark.Polygon) {
            return {
                type: 'Polygon',
                coordinates: this.parseCoordinates(placemark.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0]),
                properties
            };
        }
        return null;
    }

    static parseCoordinates(coordString) {
        return coordString.trim().split(/\s+/).map(coord => {
            const [lng, lat, alt] = coord.split(',').map(Number);
            return [lat, lng]; // Convert to [lat, lng] for Leaflet
        });
    }

    static calculateLength(coordinates) {
        let length = 0;
        for (let i = 1; i < coordinates.length; i++) {
            length += this.getDistance(coordinates[i-1], coordinates[i]);
        }
        return length;
    }

    static getDistance(coord1, coord2) {
        // Haversine formula for distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(coord2[0] - coord1[0]);
        const dLon = this.toRad(coord2[1] - coord1[1]);
        const lat1 = this.toRad(coord1[0]);
        const lat2 = this.toRad(coord2[0]);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    static toRad(degrees) {
        return degrees * Math.PI / 180;
    }

    static generateSummary(elements) {
        const summary = {};
        elements.forEach(element => {
            summary[element.type] = (summary[element.type] || 0) + 1;
        });
        return summary;
    }

    static generateDetailed(elements) {
        return elements.map(element => ({
            type: element.type,
            length: element.length || 0,
            properties: element.properties
        }));
    }
}

module.exports = KmlParser;