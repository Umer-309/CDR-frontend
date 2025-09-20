import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Satellite, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  site: string;
  cellId: string;
  callCount: number;
  lastActivity: string;
}

interface LocationMapProps {
  locations?: LocationPoint[];
}

export const LocationMap = ({ locations }: LocationMapProps) => {
  const [mapApiKey, setMapApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);
  const [liveLocations, setLiveLocations] = useState<LocationPoint[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const axios = (await import('axios')).default;
        const { API_BASE_URL } = await import('@/lib/utils');
        const res = await axios.get(`${API_BASE_URL}/api/towers`);
        const list = (res.data.data || []).map((t: any, idx: number) => ({
          id: t._id || String(idx),
          latitude: t.latitude,
          longitude: t.longitude,
          site: t.siteName || t.site,
          cellId: t.cellId,
          callCount: t.count || 0,
          lastActivity: t.importedAt || new Date().toISOString()
        }));
        setLiveLocations(list);
      } catch (e) {
        setLiveLocations(null);
      }
    }
    load();
  }, []);

  const displayLocations = locations || liveLocations || [];

  const handleMapboxSetup = () => {
    if (mapApiKey.trim()) {
      setShowApiInput(false);
      // In a real implementation, this would initialize the Mapbox map
      console.log('Mapbox initialized with key:', mapApiKey);
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActivityColor = (callCount: number) => {
    if (callCount >= 50) return 'bg-chart-1';
    if (callCount >= 30) return 'bg-chart-3';
    return 'bg-chart-2';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Cell Tower Locations
        </CardTitle>
        <CardDescription>
          Geographic distribution of cellular activity and tower locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Location Data Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <h4 className="font-medium">Tower Activity Summary</h4>
          </div>
          
          <div className="grid gap-3">
            {displayLocations.map((location) => (
              <div 
                key={location.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-secondary/50 ${
                  selectedLocation?.id === location.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{location.site}</h5>
                      <Badge variant="secondary" className="text-xs">
                        {location.cellId}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last activity: {formatLastActivity(location.lastActivity)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getActivityColor(location.callCount)}`}>
                      <span>{location.callCount}</span>
                      <span>calls</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedLocation && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h5 className="font-medium mb-2">Selected Tower: {selectedLocation.site}</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cell ID:</span>
                <span className="ml-2 font-medium">{selectedLocation.cellId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Call Count:</span>
                <span className="ml-2 font-medium">{selectedLocation.callCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Latitude:</span>
                <span className="ml-2 font-mono">{selectedLocation.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Longitude:</span>
                <span className="ml-2 font-mono">{selectedLocation.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};