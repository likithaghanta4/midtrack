import { z } from 'zod';

export const facultyLoginSchema = z.object({
  facultyId: z.string({
    required_error: 'Faculty ID is required',
  }).trim().min(1, 'Faculty ID cannot be empty'),
  password: z.string({
    required_error: 'Password is required',
  }).min(1, 'Password cannot be empty'),
});

export const studentLoginSchema = z.object({
  registerNumber: z.string({
    required_error: 'Register number is required',
  }).trim().min(1, 'Register number cannot be empty'),
  password: z.string({
    required_error: 'Password is required',
  }).min(1, 'Password cannot be empty'),
});

export type FacultyLoginInput = z.infer<typeof facultyLoginSchema>;
export type StudentLoginInput = z.infer<typeof studentLoginSchema>;
