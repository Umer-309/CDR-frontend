import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L, { Map as LeafletMap } from "leaflet";

interface MapViewInnerProps {
	batchId?: string;
}

interface MapPoint {
	_id?: string;
	latitude: number;
	longitude: number;
	site?: string;
	aNumber?: string;
	bNumber?: string;
	callType?: string;
}

const defaultCenter: [number, number] = [30.3753, 69.3451];

const markerIcon = new L.Icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

function idle(cb: () => void) {
	if (typeof (window as any).requestIdleCallback === 'function') {
		(window as any).requestIdleCallback(cb);
	} else {
		setTimeout(cb, 0);
	}
}

function ImperativeMarkers({ records }: { records: MapPoint[] }) {
	const map = useMap();
	const layerRef = useRef<L.LayerGroup | null>(null);

	useEffect(() => {
		if (!map) return;
		// Disable scroll wheel zoom by default to reduce wheel handler work
		map.scrollWheelZoom.disable();
	}, [map]);

	useEffect(() => {
		if (!map) return;
		// cleanup old layer
		if (layerRef.current) {
			layerRef.current.clearLayers();
			layerRef.current.remove();
			layerRef.current = null;
		}
		const canvasRenderer = L.canvas({ padding: 0.5 });
		const group = L.layerGroup([], { renderer: canvasRenderer });
		group.addTo(map);
		layerRef.current = group;

		const chunkSize = 300;
		let i = 0;
		let bounds: L.LatLngBounds | null = null;

		function addChunk() {
			const slice = records.slice(i, i + chunkSize);
			const toAdd: L.Layer[] = [];
			for (const r of slice) {
				if (typeof r.latitude !== 'number' || typeof r.longitude !== 'number') continue;
				const marker = L.circleMarker([r.latitude, r.longitude], { radius: 6, renderer: canvasRenderer })
					.bindPopup(
						`<div class="space-y-1 text-sm">
							<div><span class="text-muted-foreground">Site:</span> ${r.site || '-'} </div>
							<div><span class="text-muted-foreground">A:</span> ${r.aNumber || '-'} </div>
							<div><span class="text-muted-foreground">B:</span> ${r.bNumber || '-'} </div>
							<div><span class="text-muted-foreground">Type:</span> ${r.callType || '-'} </div>
						</div>`
					);
				toAdd.push(marker);
				if (!bounds) bounds = L.latLngBounds([r.latitude, r.longitude], [r.latitude, r.longitude]);
				else bounds.extend([r.latitude, r.longitude]);
			}
			toAdd.forEach((l) => l.addTo(group));
			i += chunkSize;
			if (i < records.length) {
				idle(addChunk);
			} else {
				if (bounds && bounds.isValid()) {
					map.fitBounds(bounds, { padding: [40, 40] });
				}
			}
		}

		addChunk();
		return () => {
			group.clearLayers();
			group.remove();
		};
	}, [map, records]);

	return null;
}

export default function MapViewInner({ batchId }: MapViewInnerProps) {
	const [records, setRecords] = useState<MapPoint[]>([]);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const axios = (await import("axios")).default;
				const { API_BASE_URL } = await import("@/lib/utils");
				const url = `${API_BASE_URL}/api/calls/map${batchId ? `?batchId=${encodeURIComponent(batchId)}` : ""}`;
				const res = await axios.get(url);
				if (cancelled) return;
				startTransition(() => {
					setRecords(res.data?.data || []);
				});
			} catch (e) {
				startTransition(() => setRecords([]));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [batchId]);

	const center = useMemo<[number, number]>(() => {
		const first = records.find((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number');
		return first ? [first.latitude, first.longitude] : defaultCenter;
	}, [records]);

	return (
		<div className="h-[500px] w-full rounded-md overflow-hidden border">
			<MapContainer center={center} zoom={11} className="h-full w-full">
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<ImperativeMarkers records={records} />
			</MapContainer>
		</div>
	);
}



