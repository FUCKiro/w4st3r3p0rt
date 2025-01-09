import { Observable, Dialogs } from '@nativescript/core';
import { Accuracy } from '@nativescript/core/ui/enums';
import * as Geolocation from '@nativescript/geolocation';
import { supabase } from '../../services/supabase';
import type { WasteReport } from '../../services/supabase';

export class MapViewModel extends Observable {
    private _userLatitude = 0;
    private _userLongitude = 0;
    private _isReporting = false;
    private _selectedWasteType = 0;
    private _selectedWasteSize = 0;
    private _notes = '';
    private _map: any;
    private _markers: any[] = [];

    readonly wasteTypes = [
        'Urban Waste',
        'Bulky Items',
        'Hazardous Materials',
        'Illegal Dumping',
        'Green Waste'
    ];

    readonly wasteSizes = [
        'Small (fits in a bag)',
        'Medium (fits in a car)',
        'Large (needs a truck)',
        'Very Large (illegal dump site)'
    ];

    constructor() {
        super();
        this.getCurrentLocation();
        this.loadReports();
    }

    async getCurrentLocation() {
        try {
            const hasPermission = await Geolocation.enableLocationRequest();
            if (!hasPermission) {
                throw new Error('Location permission denied');
            }

            const location = await Geolocation.getCurrentLocation({
                desiredAccuracy: Accuracy.high,
                maximumAge: 5000,
                timeout: 20000
            });

            this._userLatitude = location.latitude;
            this._userLongitude = location.longitude;
            
            this.notifyPropertyChange('userLatitude', location.latitude);
            this.notifyPropertyChange('userLongitude', location.longitude);
        } catch (error) {
            console.error('Location error:', error);
            await Dialogs.alert({
                title: 'Location Error',
                message: 'Unable to get your location. Please enable location services.',
                okButtonText: 'OK'
            });
        }
    }

    async loadReports() {
        try {
            const { data: reports, error } = await supabase
                .from('waste_reports')
                .select('*');

            if (error) throw error;

            this.updateMapMarkers(reports);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    }

    updateMapMarkers(reports: WasteReport[]) {
        if (!this._map) return;

        // Clear existing markers
        this._markers.forEach(marker => marker.remove());
        this._markers = [];

        // Add new markers
        reports.forEach(report => {
            const marker = this._map.addMarker({
                latitude: report.latitude,
                longitude: report.longitude,
                title: this.wasteTypes[report.waste_type],
                snippet: report.notes,
                userData: report
            });
            this._markers.push(marker);
        });
    }

    onMapReady(args: any) {
        this._map = args.map;
        this.loadReports();
    }

    onMarkerSelect(args: any) {
        const marker = args.marker;
        const report = marker.userData;
        
        Dialogs.alert({
            title: this.wasteTypes[report.waste_type],
            message: `Status: ${report.status}\nNotes: ${report.notes}`,
            okButtonText: 'OK'
        });
    }

    async submitReport() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase.from('waste_reports').insert({
                user_id: user.id,
                latitude: this._userLatitude,
                longitude: this._userLongitude,
                waste_type: this._selectedWasteType,
                size: this._selectedWasteSize,
                notes: this._notes,
                status: 'new'
            });

            if (error) throw error;

            this._isReporting = false;
            this.notifyPropertyChange('isReporting', false);
            this.loadReports();

            await Dialogs.alert({
                title: 'Success',
                message: 'Report submitted successfully',
                okButtonText: 'OK'
            });
        } catch (error) {
            console.error('Error submitting report:', error);
            await Dialogs.alert({
                title: 'Error',
                message: 'Failed to submit report. Please try again.',
                okButtonText: 'OK'
            });
        }
    }

    // Getters and setters
    get userLatitude(): number {
        return this._userLatitude;
    }

    get userLongitude(): number {
        return this._userLongitude;
    }

    get isReporting(): boolean {
        return this._isReporting;
    }

    get selectedWasteType(): number {
        return this._selectedWasteType;
    }

    get selectedWasteSize(): number {
        return this._selectedWasteSize;
    }

    get notes(): string {
        return this._notes;
    }

    set selectedWasteType(value: number) {
        if (this._selectedWasteType !== value) {
            this._selectedWasteType = value;
            this.notifyPropertyChange('selectedWasteType', value);
        }
    }

    set selectedWasteSize(value: number) {
        if (this._selectedWasteSize !== value) {
            this._selectedWasteSize = value;
            this.notifyPropertyChange('selectedWasteSize', value);
        }
    }

    set notes(value: string) {
        if (this._notes !== value) {
            this._notes = value;
            this.notifyPropertyChange('notes', value);
        }
    }

    onNewReport() {
        this._isReporting = true;
        this.notifyPropertyChange('isReporting', true);
    }

    cancelReport() {
        this._isReporting = false;
        this.notifyPropertyChange('isReporting', false);
    }
}