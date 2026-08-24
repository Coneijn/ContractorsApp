export const GHL_CONTRACTOR_STAGE_MAP: Record<string, string> = {
    '2c10cb76-ca6b-45a6-918f-c07a2b727f6b': 'PENDING_ESTIMATE',         // Pending Estimate
    '405dbb97-2bdd-4a8b-88de-ddeca34fc6ff': 'ASSIGNED_OR_TO_DO',        // Assigned / To Do
    'e8fbe7ab-7d3f-4b8c-b3d8-10b06cf82b5b': 'IN_PROGRESS',               // In Progress
    '97aa3dd3-115e-471f-a33c-c54860450f10': 'PENDING_INSPECTION_OR_QA',  // Pending Inspection / QA
    '9dea21c1-4849-4dbb-85b0-04445831f0c1': 'INVOICE_SUBMITTED',         // Invoice Submitted
    '581841b4-7435-469c-86ee-b3011bebdbff': 'UNASSIGNED',                // Unassigned
    'd163304d-8f8e-4717-9176-540f8a9d45dd': 'WON',                       // Won
    'bf2b4f72-7aa7-470f-bf1f-47ab3cef147a': 'LOST',                      // Lost
  };
  
  export const REVERSE_GHL_CONTRACTOR_STAGE_MAP: Record<string, string> = Object.fromEntries(
    Object.entries(GHL_CONTRACTOR_STAGE_MAP).map(([key, value]) => [value, key])
  );