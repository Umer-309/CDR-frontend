import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter, X, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface FilterState {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  phoneNumber: string;
  callType: string;
  direction: string;
  minDuration: string;
  cellId: string;
}

interface DataFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export const DataFilters = ({ onFiltersChange }: DataFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: undefined,
      to: undefined
    },
    phoneNumber: '',
    callType: '',
    direction: '',
    minDuration: '',
    cellId: ''
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update active filters list
    const active: string[] = [];
    if (newFilters.dateRange.from || newFilters.dateRange.to) active.push('dateRange');
    if (newFilters.phoneNumber) active.push('phoneNumber');
    if (newFilters.callType) active.push('callType');
    if (newFilters.direction) active.push('direction');
    if (newFilters.minDuration) active.push('minDuration');
    if (newFilters.cellId) active.push('cellId');
    
    setActiveFilters(active);
    onFiltersChange(newFilters);
  };

  const clearFilter = (filterKey: keyof FilterState) => {
    const newFilters = { ...filters };
    if (filterKey === 'dateRange') {
      newFilters.dateRange = { from: undefined, to: undefined };
    } else {
      (newFilters as any)[filterKey] = '';
    }
    setFilters(newFilters);
    
    const active = activeFilters.filter(f => f !== filterKey);
    setActiveFilters(active);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters: FilterState = {
      dateRange: { from: undefined, to: undefined },
      phoneNumber: '',
      callType: '',
      direction: '',
      minDuration: '',
      cellId: ''
    };
    setFilters(resetFilters);
    setActiveFilters([]);
    onFiltersChange(resetFilters);
  };

  const getFilterLabel = (filterKey: string): string => {
    switch (filterKey) {
      case 'dateRange':
        const { from, to } = filters.dateRange;
        if (from && to) return `${format(from, 'MMM dd')} - ${format(to, 'MMM dd')}`;
        if (from) return `From ${format(from, 'MMM dd')}`;
        if (to) return `Until ${format(to, 'MMM dd')}`;
        return 'Date Range';
      case 'phoneNumber':
        return `Number: ${filters.phoneNumber}`;
      case 'callType':
        return `Type: ${filters.callType}`;
      case 'direction':
        return `Direction: ${filters.direction}`;
      case 'minDuration':
        return `Min Duration: ${filters.minDuration}s`;
      case 'cellId':
        return `Cell: ${filters.cellId}`;
      default:
        return filterKey;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Data Filters
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeFilters.length} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Active Filters</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-1 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filterKey) => (
                <Badge
                  key={filterKey}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="text-xs">{getFilterLabel(filterKey)}</span>
                  <button
                    onClick={() => clearFilter(filterKey as keyof FilterState)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={(range) => updateFilter('dateRange', range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="e.g., +1234567890"
              value={filters.phoneNumber}
              onChange={(e) => updateFilter('phoneNumber', e.target.value)}
            />
          </div>

          {/* Call Type */}
          <div className="space-y-2">
            <Label>Call Type</Label>
            <Select value={filters.callType} onValueChange={(value) => updateFilter('callType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voice">Voice Call</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="data">Data Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={filters.direction} onValueChange={(value) => updateFilter('direction', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outgoing">Outgoing</SelectItem>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Minimum Duration */}
          <div className="space-y-2">
            <Label htmlFor="minDuration">Minimum Duration (seconds)</Label>
            <Input
              id="minDuration"
              type="number"
              placeholder="e.g., 30"
              value={filters.minDuration}
              onChange={(e) => updateFilter('minDuration', e.target.value)}
            />
          </div>

          {/* Cell ID */}
          <div className="space-y-2">
            <Label htmlFor="cellId">Cell Tower ID</Label>
            <Input
              id="cellId"
              placeholder="e.g., C001"
              value={filters.cellId}
              onChange={(e) => updateFilter('cellId', e.target.value)}
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('dateRange', {
                from: new Date(Date.now() - 24 * 60 * 60 * 1000),
                to: new Date()
              })}
            >
              Last 24 Hours
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('dateRange', {
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                to: new Date()
              })}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('dateRange', {
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                to: new Date()
              })}
            >
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('callType', 'voice')}
            >
              Voice Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('callType', 'sms')}
            >
              SMS Only
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};