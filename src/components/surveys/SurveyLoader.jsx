import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

console.log('Skeleton', Skeleton);
console.log('Card', Card);
console.log('CardContent', CardContent);

export default function SurveyLoader() {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </div>

      {/* Simula 3 perguntas carregando */}
      {[1, 2, 3].map((index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <Skeleton className="h-5 w-4/5 mb-2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end mt-6">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}