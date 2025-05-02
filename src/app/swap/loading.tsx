import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-32 bg-[#151515] mb-8" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Chart */}
            <div className="lg:col-span-2">
              <Card className="bg-[#151515] border-[#222222]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-6 w-40 bg-[#222222]" />
                  <Skeleton className="h-8 w-32 bg-[#222222]" />
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <Skeleton className="h-[300px] w-full bg-[#222222]" />
                  </div>
                </CardContent>
              </Card>

              {/* Market Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-[#151515] border-[#222222]">
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-24 bg-[#222222] mb-2" />
                      <Skeleton className="h-6 w-16 bg-[#222222]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right Column - Swap Interface */}
            <div className="lg:col-span-1">
              <Card className="bg-[#151515] border-[#222222]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-6 w-32 bg-[#222222]" />
                  <Skeleton className="h-8 w-8 rounded-full bg-[#222222]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full bg-[#222222] mb-4 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-full bg-[#222222] mx-auto mb-4" />
                  <Skeleton className="h-32 w-full bg-[#222222] mb-4 rounded-lg" />
                  <Skeleton className="h-24 w-full bg-[#222222] mb-4 rounded-lg" />
                  <Skeleton className="h-12 w-full bg-[#222222] rounded-lg" />
                </CardContent>
              </Card>

              <Card className="bg-[#151515] border-[#222222] mt-6">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-40 bg-[#222222]" />
                </CardHeader>
                <CardContent>
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-16 w-full bg-[#222222] mb-3 rounded-lg"
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
