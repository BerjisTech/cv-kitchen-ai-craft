
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { MinimalTemplate } from './MinimalTemplate';

// Export a map of all available templates
export const cvTemplates: Record<string, React.FC<{ data: any, id?: string }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
};

export * from './ModernTemplate';
export * from './ClassicTemplate';
export * from './CreativeTemplate';
export * from './MinimalTemplate';
