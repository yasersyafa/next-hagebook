import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name required").max(80),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 chars").max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const submitAssignmentSchema = z.object({
  pageSlug: z.string().min(1),
  url: z
    .string()
    .url("Must be a valid URL")
    .max(500)
    .refine((u) => /^https?:\/\//.test(u), "URL must start with http:// or https://"),
});

export const gradeSubmissionSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PASS", "FAIL"]),
  feedback: z.string().max(1000).optional(),
});

export const approveUserSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "DEACTIVATE", "REACTIVATE"]),
});

export const deleteUserSchema = z.object({
  userId: z.string().min(1),
  confirmEmail: z.string().email(),
});

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const tagSlugRegex = slugRegex;

export const pageBaseSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug required")
    .max(80)
    .regex(slugRegex, "Slug must be lowercase letters, numbers, dashes only"),
  title: z.string().min(1, "Title required").max(200),
  description: z.string().max(500).optional().nullable(),
  order: z.coerce.number().int().min(0).max(9999).default(0),
  contentHtml: z.string().min(1, "Content required").max(200_000),
  assignmentPrompt: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform((v) => (v && v.trim().length > 0 ? v : null)),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  categoryId: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  tagSlugs: z
    .array(z.string().min(1).max(40).regex(slugRegex))
    .max(10)
    .default([]),
});

export const pageCreateSchema = pageBaseSchema;

export const pageUpdateSchema = pageBaseSchema.extend({
  id: z.string().min(1),
});

export const pageStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const pageDeleteSchema = z.object({
  id: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Missing token"),
    password: z.string().min(8, "Min 8 chars").max(100),
    confirm: z.string().min(1),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type ApproveUserInput = z.infer<typeof approveUserSchema>;
export type PageCreateInput = z.infer<typeof pageCreateSchema>;
export type PageUpdateInput = z.infer<typeof pageUpdateSchema>;
