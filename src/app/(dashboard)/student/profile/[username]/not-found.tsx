import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-4 text-6xl">👤</div>
            <h1 className="mb-2 text-3xl font-bold">Profile Not Found</h1>
            <p className="mb-6 text-gray-600">
              The profile you're looking for doesn't exist or has been set to private.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">Return Home</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/explore">Explore Profiles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}