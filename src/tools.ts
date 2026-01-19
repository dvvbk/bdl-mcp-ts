// MCP Tools definitions for BDL API

import { z } from 'zod';

// Common schemas
const languageSchema = z.enum(['pl', 'en']).optional().describe('Response language (pl or en)');
const sortOrderSchema = z.enum(['Id', '-Id', 'Name', '-Name']).optional().describe('Sort order');
const pageSchema = z.number().int().positive().optional().describe('Page number');
const pageSizeSchema = z.number().int().positive().max(100).optional().describe('Number of results per page (max 100)');

// Tool definitions
export const tools = {
  // ========== Aggregates ==========
  get_aggregates: {
    name: 'get_aggregates',
    description: 'Get list of aggregation levels from BDL API. Aggregation levels define territorial groupings (e.g., voivodeship, county, commune).',
    inputSchema: z.object({
      sort: sortOrderSchema,
      lang: languageSchema,
    }),
  },

  get_aggregate: {
    name: 'get_aggregate',
    description: 'Get details of a specific aggregation level by ID.',
    inputSchema: z.object({
      id: z.number().int().describe('Aggregation level ID'),
      lang: languageSchema,
    }),
  },

  // ========== Attributes ==========
  get_attributes: {
    name: 'get_attributes',
    description: 'Get list of data attributes/flags from BDL API.',
    inputSchema: z.object({
      sort: sortOrderSchema,
      lang: languageSchema,
    }),
  },

  get_attribute: {
    name: 'get_attribute',
    description: 'Get details of a specific attribute by ID.',
    inputSchema: z.object({
      id: z.number().int().describe('Attribute ID'),
      lang: languageSchema,
    }),
  },

  // ========== Levels ==========
  get_levels: {
    name: 'get_levels',
    description: 'Get list of territorial levels (e.g., country, voivodeship, county, commune).',
    inputSchema: z.object({
      sort: sortOrderSchema,
      lang: languageSchema,
    }),
  },

  get_level: {
    name: 'get_level',
    description: 'Get details of a specific territorial level by ID.',
    inputSchema: z.object({
      id: z.number().int().describe('Level ID'),
      lang: languageSchema,
    }),
  },

  // ========== Measures ==========
  get_measures: {
    name: 'get_measures',
    description: 'Get list of measurement units used in BDL data.',
    inputSchema: z.object({
      sort: sortOrderSchema,
      lang: languageSchema,
    }),
  },

  get_measure: {
    name: 'get_measure',
    description: 'Get details of a specific measurement unit by ID.',
    inputSchema: z.object({
      id: z.number().int().describe('Measure unit ID'),
      lang: languageSchema,
    }),
  },

  // ========== Subjects ==========
  get_subjects: {
    name: 'get_subjects',
    description: 'Get list of statistical subjects/categories. Subjects are organized hierarchically.',
    inputSchema: z.object({
      parentId: z.string().optional().describe('Parent subject ID to get children'),
      lang: languageSchema,
    }),
  },

  get_subject: {
    name: 'get_subject',
    description: 'Get details of a specific subject by ID.',
    inputSchema: z.object({
      id: z.string().describe('Subject ID (e.g., "K1", "P2354")'),
      lang: languageSchema,
    }),
  },

  search_subjects: {
    name: 'search_subjects',
    description: 'Search subjects by name.',
    inputSchema: z.object({
      name: z.string().describe('Search term for subject name'),
      lang: languageSchema,
    }),
  },

  // ========== Units ==========
  get_units: {
    name: 'get_units',
    description: 'Get list of territorial units (administrative divisions of Poland).',
    inputSchema: z.object({
      level: z.number().int().optional().describe('Territorial level filter'),
      parentId: z.string().optional().describe('Parent unit ID to get children'),
      name: z.string().optional().describe('Name filter'),
      sort: sortOrderSchema,
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  get_unit: {
    name: 'get_unit',
    description: 'Get details of a specific territorial unit by ID.',
    inputSchema: z.object({
      id: z.string().describe('Unit ID (TERYT code)'),
      lang: languageSchema,
    }),
  },

  search_units: {
    name: 'search_units',
    description: 'Search territorial units by name.',
    inputSchema: z.object({
      name: z.string().describe('Search term for unit name'),
      level: z.number().int().optional().describe('Territorial level filter'),
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  // ========== Localities ==========
  get_localities: {
    name: 'get_localities',
    description: 'Get list of localities (cities, towns, villages).',
    inputSchema: z.object({
      parentId: z.string().optional().describe('Parent unit ID'),
      name: z.string().optional().describe('Name filter'),
      year: z.number().int().optional().describe('Year filter'),
      sort: sortOrderSchema,
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  get_locality: {
    name: 'get_locality',
    description: 'Get details of a specific locality by ID.',
    inputSchema: z.object({
      id: z.string().describe('Locality ID'),
      year: z.number().int().optional().describe('Year'),
      lang: languageSchema,
    }),
  },

  search_localities: {
    name: 'search_localities',
    description: 'Search localities by name.',
    inputSchema: z.object({
      name: z.string().describe('Search term for locality name'),
      year: z.number().int().optional().describe('Year filter'),
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  // ========== Variables ==========
  get_variables: {
    name: 'get_variables',
    description: 'Get list of statistical variables/indicators.',
    inputSchema: z.object({
      subjectId: z.string().optional().describe('Filter by subject ID'),
      level: z.number().int().optional().describe('Aggregation level filter'),
      year: z.number().int().optional().describe('Year filter'),
      sort: sortOrderSchema,
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  get_variable: {
    name: 'get_variable',
    description: 'Get details of a specific variable by ID, including available years.',
    inputSchema: z.object({
      id: z.number().int().describe('Variable ID'),
      lang: languageSchema,
    }),
  },

  search_variables: {
    name: 'search_variables',
    description: 'Search statistical variables by name.',
    inputSchema: z.object({
      name: z.string().describe('Search term for variable name'),
      subjectId: z.string().optional().describe('Filter by subject ID'),
      level: z.number().int().optional().describe('Aggregation level filter'),
      year: z.number().int().optional().describe('Year filter'),
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  // ========== Data ==========
  get_data_by_variable: {
    name: 'get_data_by_variable',
    description: 'Get statistical data for a specific variable across territorial units.',
    inputSchema: z.object({
      varId: z.number().int().describe('Variable ID'),
      unitLevel: z.number().int().optional().describe('Territorial level for results'),
      unitParentId: z.string().optional().describe('Parent unit ID to filter results'),
      year: z.union([
        z.number().int(),
        z.array(z.number().int()),
      ]).optional().describe('Year or array of years'),
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  get_data_by_unit: {
    name: 'get_data_by_unit',
    description: 'Get statistical data for a specific territorial unit.',
    inputSchema: z.object({
      unitId: z.string().describe('Unit ID (TERYT code)'),
      varId: z.union([
        z.number().int(),
        z.array(z.number().int()),
      ]).optional().describe('Variable ID or array of variable IDs'),
      year: z.union([
        z.number().int(),
        z.array(z.number().int()),
      ]).optional().describe('Year or array of years'),
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  get_locality_data_by_variable: {
    name: 'get_locality_data_by_variable',
    description: 'Get locality-level statistical data for a specific variable.',
    inputSchema: z.object({
      varId: z.number().int().describe('Variable ID'),
      unitParentId: z.string().optional().describe('Parent unit ID to filter results'),
      year: z.number().int().optional().describe('Year'),
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  get_locality_data_by_unit: {
    name: 'get_locality_data_by_unit',
    description: 'Get locality-level statistical data for a specific unit.',
    inputSchema: z.object({
      unitId: z.string().describe('Unit ID'),
      varId: z.union([
        z.number().int(),
        z.array(z.number().int()),
      ]).optional().describe('Variable ID or array of variable IDs'),
      year: z.number().int().optional().describe('Year'),
      page: pageSchema,
      pageSize: pageSizeSchema,
      lang: languageSchema,
    }),
  },

  // ========== Years ==========
  get_years: {
    name: 'get_years',
    description: 'Get list of available years in BDL database.',
    inputSchema: z.object({
      lang: languageSchema,
    }),
  },

  get_year: {
    name: 'get_year',
    description: 'Get details of a specific year.',
    inputSchema: z.object({
      id: z.number().int().describe('Year (e.g., 2023)'),
      lang: languageSchema,
    }),
  },

  // ========== Version ==========
  get_api_version: {
    name: 'get_api_version',
    description: 'Get BDL API version information.',
    inputSchema: z.object({}),
  },
} as const;

export type ToolName = keyof typeof tools;
