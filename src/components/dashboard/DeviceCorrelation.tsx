import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Search, Network, Phone, MessageSquare } from "lucide-react";

interface DeviceConnection {
  id: string;
  type: 'number' | 'imei' | 'imsi';
  value: string;
  connections: {
    type: 'number' | 'imei' | 'imsi';
    value: string;
    callCount: number;
    smsCount: number;
    lastActivity: string;
  }[];
}

interface DeviceCorrelationProps {
  searchQuery?: string;
}

export const DeviceCorrelation = ({ searchQuery }: DeviceCorrelationProps) => {
  const [activeQuery, setActiveQuery] = useState(searchQuery || '');
  const [searchResults, setSearchResults] = useState<DeviceConnection | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  const handleSearch = () => {
    setSearchResults(null);
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'imei':
        return <Smartphone className="h-4 w-4" />;
      case 'imsi':
        return <Network className="h-4 w-4" />;
      case 'number':
        return <Phone className="h-4 w-4" />;
      default:
        return <Network className="h-4 w-4" />;
    }
  };

  const getConnectionLabel = (type: string) => {
    switch (type) {
      case 'imei':
        return 'Device IMEI';
      case 'imsi':
        return 'SIM IMSI';
      case 'number':
        return 'Phone Number';
      default:
        return 'Unknown';
    }
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'imei':
        return 'bg-chart-1';
      case 'imsi':
        return 'bg-chart-2';
      case 'number':
        return 'bg-chart-3';
      default:
        return 'bg-muted';
    }
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateActivityStrength = (callCount: number, smsCount: number) => {
    const total = callCount + smsCount;
    if (total >= 40) return 'High';
    if (total >= 20) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Device Correlation Analysis
        </CardTitle>
        <CardDescription>
          Explore connections between phone numbers, devices (IMEI), and SIM cards (IMSI)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Interface */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter phone number, IMEI, or IMSI..."
              value={activeQuery}
              onChange={(e) => setActiveQuery(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!activeQuery.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Search for any identifier to see its network of connected devices and numbers
          </p>
        </div>

        {!searchResults ? (
          <div className="text-center py-12 space-y-4">
            <Network className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-medium mb-2">Start Your Investigation</h3>
              <p className="text-muted-foreground">
                Enter a phone number, IMEI, or IMSI to discover connected devices and communication patterns
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search Result Header */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {getConnectionIcon(searchResults.type)}
                <h3 className="font-medium">Analysis Results for:</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {searchResults.value}
                </Badge>
                <Badge variant="secondary">
                  {getConnectionLabel(searchResults.type)}
                </Badge>
              </div>
            </div>

            {/* Network Graph Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connection Network</CardTitle>
                <CardDescription>
                  Visual representation of device and number relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 bg-secondary/30 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Network className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">Interactive Network Graph</p>
                    <p className="text-sm text-muted-foreground">
                      D3.js or Cytoscape.js visualization would render here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connections List */}
            <div className="space-y-4">
              <h4 className="font-medium">Connected Identifiers ({searchResults.connections.length})</h4>
              
              <div className="grid gap-3">
                {searchResults.connections.map((connection, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-secondary/50 ${
                      selectedConnection === connection.value ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedConnection(selectedConnection === connection.value ? null : connection.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getConnectionIcon(connection.type)}
                          <span className="font-mono text-sm">{connection.value}</span>
                          <Badge variant="outline" className="text-xs">
                            {getConnectionLabel(connection.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{connection.callCount} calls</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{connection.smsCount} SMS</span>
                          </div>
                          <span>Last: {formatLastActivity(connection.lastActivity)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="secondary" 
                          className={`${getConnectionColor(connection.type)} text-white text-xs`}
                        >
                          {calculateActivityStrength(connection.callCount, connection.smsCount)} Activity
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedConnection === connection.value && (
                      <div className="mt-4 pt-4 border-t border-muted">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Calls:</span>
                            <div className="font-medium">{connection.callCount}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total SMS:</span>
                            <div className="font-medium">{connection.smsCount}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Activity:</span>
                            <div className="font-medium">{connection.callCount + connection.smsCount}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Contact:</span>
                            <div className="font-medium text-xs">{new Date(connection.lastActivity).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveQuery(connection.value);
                              // In real implementation, this would trigger a new search
                            }}
                          >
                            Analyze This Connection
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};