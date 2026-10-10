/**
 * One zod schema per form, shared by the KendoReact field validators and the
 * server action. The browser gets instant feedback; the server re-checks the
 * same rules, because client-side validation is a convenience, not a guarantee.
 */
import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  dueDate: z.date().nullable(),
  assignedTo: z
    .string()
    .trim()
    .max(120, 'Name cannot exceed 120 characters')
    .refine(v => v === '' || /^[A-Za-z .'-]+$/.test(v), 'Letters, spaces, . - and apostrophes only'),
  estimatedHours: z
    .number({ invalid_type_error: 'Estimated hours must be a number' })
    .min(0, 'Cannot be negative')
    .max(1000, 'Cannot exceed 1000 hours'),
  projectId: z.number().int().positive('Pick a project').nullable(),
  isCompleted: z.boolean().default(false)
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export const projectSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(120),
  code: z
    .string()
    .trim()
    .regex(/^[A-Z]{2,6}-\d{2,4}$/, 'Use the format ABC-123'),
  owner: z.string().trim().min(2, 'Owner is required').max(120),
  startDate: z.date(),
  isActive: z.boolean().default(true)
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

/**
 * Turns a zod schema into the per-field validator signature KendoReact's
 * <Field validator={...} /> expects: return a message string, or undefined.
 */
export function fieldValidator<S extends z.ZodObject<z.ZodRawShape>>(
  schema: S,
  field: keyof z.infer<S> & string
) {
  return (value: unknown): string | undefined => {
    const shape = schema.shape[field];
    if (!shape) return undefined;
    const result = shape.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  };
}

/** Flattens zod errors into { field: message } for whole-form validation. */
export function formErrors(schema: z.ZodTypeAny, values: unknown): Record<string, string> {
  const result = schema.safeParse(values);
  if (result.success) return {};

  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
