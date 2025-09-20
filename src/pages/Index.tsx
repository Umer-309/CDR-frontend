import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { LocationMap } from "@/components/dashboard/LocationMap";
import { MapView } from "@/components/dashboard/MapView";
import { DeviceCorrelation } from "@/components/dashboard/DeviceCorrelation";
import { DataFilters } from "@/components/dashboard/DataFilters";
import { BarChart3, Upload, Map, Network, Filter } from "lucide-react";

const Index = () => {
  const [processedData, setProcessedData] = useState<any>(null);
  const [filters, setFilters] = useState<any>({});
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);

  const handleFileProcessed = (data: any) => {
    setProcessedData(data);
    loadHistory();
  };

  const loadHistory = async () => {
    const axios = (await import('axios')).default;
    const { API_BASE_URL } = await import('@/lib/utils');
    const res = await axios.get(`${API_BASE_URL}/api/uploads/history`);
    setUploadHistory(res.data.data || []);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">CDR Analytics Platform</h1>
          <p className="text-muted-foreground">
            Professional Call Detail Record analysis and telecommunications intelligence system
          </p>
        </header>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Correlation
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <FileUpload onFileProcessed={handleFileProcessed} />
            {uploadHistory.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Saved Uploads</h3>
                <div className="space-y-1">
                  {uploadHistory.map((u) => (
                    <button
                      key={u.batchId}
                      className="text-left w-full px-3 py-2 rounded-md border hover:bg-accent"
                      onClick={() => setProcessedData({ batchId: u.batchId })}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{u.fileName || u.batchId}</span>
                        <span className="text-sm text-muted-foreground">{new Date(u.importedAt).toLocaleString()} • {u.count} records</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsCharts data={processedData} />
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <MapView batchId={processedData?.batchId} />
            <LocationMap />
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <DeviceCorrelation />
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <DataFilters onFiltersChange={handleFiltersChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;