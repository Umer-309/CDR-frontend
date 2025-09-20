import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const MapViewInner = lazy(() => import("@/components/dashboard/MapViewInner"));

interface MapViewProps {
	batchId?: string;
}


export const MapView = ({ batchId }: MapViewProps) => {
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Map</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Suspense
					fallback={
						<div className="h-[500px] w-full grid place-items-center border rounded-md">
							<Loader2 className="h-5 w-5 animate-spin" />
						</div>
					}
				>
					<MapViewInner batchId={batchId} />
				</Suspense>
			</CardContent>
		</Card>
	);
};


