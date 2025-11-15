
import { Project } from '../types';
import { RAINFALL_DURATIONS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

export const createNewProject = (): Project => ({
    id: uuidv4(),
    metadata: {
        name: 'New Project',
        number: '',
        location: '',
        engineer: '',
        references: 'Maricopa County Drainage Design Manual',
    },
    rainfall: {
        returnPeriods: ['2-yr', '10-yr', '100-yr'],
        depths: RAINFALL_DURATIONS.map(duration => ({
            duration,
            '2-yr': 0, '10-yr': 0, '100-yr': 0,
        })),
    },
    lotCalculator: {
        minLotArea: 4950, lotWidth: 45, lotDepth: 110,
        frontYard: 20, rearYard: 15, sideYard: 5, maxLotCoverage: 50,
        surfaces: [
            { name: 'Lawn', coverage: 15, cValue: 0.15 },
            { name: 'Desert Landscape', coverage: 20, cValue: 0.10 },
            { name: 'Driveway', coverage: 10, cValue: 0.90 },
            { name: 'House', coverage: 40, cValue: 0.95 },
            { name: 'Sidewalk', coverage: 5, cValue: 0.90 },
            { name: 'Landscape Parkway', coverage: 10, cValue: 0.10 },
        ],
        c100Multiplier: 1.15,
        c100Cap: 0.95,
    },
    collectorStreet: {
        rwWidth: 60, streetWidth: 36, curbWidth: 2, sidewalkWidth: 5, parkwayWidth: 8.5, medianWidth: 0,
        surfaces: [
            { name: 'Curb & Gutter', width: 2, cValue: 0.95 },
            { name: 'Asphalt', width: 18, cValue: 0.90 },
            { name: 'Sidewalk', width: 5, cValue: 0.90 },
            { name: 'Landscape Parkway', width: 8.5, cValue: 0.10 },
            { name: 'Median', width: 0, cValue: 0.10 },
        ],
    },
    weightedC: {
        landUses: [
            { name: 'Medium Lot Residential', c10: 0.45 },
            { name: 'Pavement and Rooftops', c10: 0.90 },
            { name: 'Undeveloped Desert Rangeland, slopes < 5%', c10: 0.15 },
            { name: 'Mountain Terrain, slopes > 10%', c10: 0.30 },
            { name: 'Landscaping without Impervious Underlayment', c10: 0.10 },
            { name: 'Turf', c10: 0.20 },
        ],
        subbasins: [
            { id: 'A1', area: 2.5, percentages: { 'Medium Lot Residential': 100, 'Pavement and Rooftops': 0, 'Undeveloped Desert Rangeland, slopes < 5%': 0, 'Mountain Terrain, slopes > 10%': 0, 'Landscaping without Impervious Underlayment': 0, 'Turf': 0 } },
            { id: 'B1', area: 1.8, percentages: { 'Medium Lot Residential': 0, 'Pavement and Rooftops': 70, 'Undeveloped Desert Rangeland, slopes < 5%': 0, 'Mountain Terrain, slopes > 10%': 0, 'Landscaping without Impervious Underlayment': 30, 'Turf': 0 } },
        ],
        c100Multiplier: 1.15,
        c100Cap: 0.95,
    },
});

export const sampleProject: Project = {
    ...createNewProject(),
    id: 'sample-project-1',
    metadata: {
        name: 'Westwing Mountain - Phase 1',
        number: '5599.10',
        location: 'Peoria, AZ',
        engineer: 'J. Doe, P.E.',
        references: 'FCDMC Drainage Design Manual, Hydrology (2013)\nCity of Peoria Stormwater Design Manual (2018)',
    },
    rainfall: {
        returnPeriods: ['2-yr', '10-yr', '100-yr'],
        depths: [
            { duration: '5-min', '2-yr': 0.39, '10-yr': 0.55, '100-yr': 0.81 },
            { duration: '10-min', '2-yr': 0.62, '10-yr': 0.88, '100-yr': 1.29 },
            { duration: '15-min', '2-yr': 0.77, '10-yr': 1.09, '100-yr': 1.60 },
            { duration: '30-min', '2-yr': 1.05, '10-yr': 1.48, '100-yr': 2.18 },
            { duration: '60-min', '2-yr': 1.32, '10-yr': 1.86, '100-yr': 2.73 },
            { duration: '2-hr', '2-yr': 1.51, '10-yr': 2.13, '100-yr': 3.13 },
            { duration: '3-hr', '2-yr': 1.61, '10-yr': 2.26, '100-yr': 3.33 },
            { duration: '6-hr', '2-yr': 1.84, '10-yr': 2.59, '100-yr': 3.81 },
            { duration: '12-hr', '2-yr': 2.09, '10-yr': 2.94, '100-yr': 4.32 },
            { duration: '24-hr', '2-yr': 2.37, '10-yr': 3.33, '100-yr': 4.90 },
        ],
    },
};
