import { EmailTemplate, DEFAULT_TEMPLATES, AVAILABLE_VARIABLES } from './invoiceEmailTemplates'

export const sampleEmailTemplates: EmailTemplate[] = DEFAULT_TEMPLATES.map((template, index) => ({
  ...template,
  id: `email-template-${index + 1}`,
  createdAt: Date.now() - (6 - index) * 24 * 60 * 60 * 1000,
  updatedAt: Date.now() - (3 - Math.min(index, 2)) * 24 * 60 * 60 * 1000,
  createdBy: 'system-admin',
}))
