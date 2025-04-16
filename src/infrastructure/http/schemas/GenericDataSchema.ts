export const SaveDataRequest = {
  type: 'object',
  required: ['type', 'data'],
  properties: {
    type: { type: 'string' },
    data: { type: 'object', additionalProperties: true }
  }
} as const;

export const GetDataResponse = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: { type: 'string' },
    data: { type: 'object', additionalProperties: true },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  }
} as const;

export const GetDataListResponse = {
  type: 'array',
  items: GetDataResponse
} as const;
