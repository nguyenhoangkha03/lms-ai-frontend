import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';

export default function Test() {
  return (
    <div>
      <Button variant="destructive">Test</Button>
      <Tooltip>Tooltip</Tooltip>
      <Input />
    </div>
  );
}
