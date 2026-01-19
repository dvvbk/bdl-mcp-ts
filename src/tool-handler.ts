// Tool handler - executes BDL API calls based on tool invocations

import { BDLClient } from './bdl-client';
import type { ToolName } from './tools';
import type { Language, SortOrder } from './types';

export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export class ToolHandler {
  private client: BDLClient;

  constructor(client: BDLClient) {
    this.client = client;
  }

  async execute(toolName: ToolName, args: Record<string, unknown>): Promise<ToolResult> {
    try {
      const result = await this.callTool(toolName, args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: `Error: ${errorMessage}`,
        }],
        isError: true,
      };
    }
  }

  private async callTool(toolName: ToolName, args: Record<string, unknown>): Promise<unknown> {
    const lang = args.lang as Language | undefined;
    const sort = args.sort as SortOrder | undefined;
    const page = args.page as number | undefined;
    const pageSize = args.pageSize as number | undefined;

    switch (toolName) {
      // ========== Aggregates ==========
      case 'get_aggregates':
        return this.client.getAggregates({ sort, lang });

      case 'get_aggregate':
        return this.client.getAggregate(args.id as number, lang);

      // ========== Attributes ==========
      case 'get_attributes':
        return this.client.getAttributes({ sort, lang });

      case 'get_attribute':
        return this.client.getAttribute(args.id as number, lang);

      // ========== Levels ==========
      case 'get_levels':
        return this.client.getLevels({ sort, lang });

      case 'get_level':
        return this.client.getLevel(args.id as number, lang);

      // ========== Measures ==========
      case 'get_measures':
        return this.client.getMeasures({ sort, lang });

      case 'get_measure':
        return this.client.getMeasure(args.id as number, lang);

      // ========== Subjects ==========
      case 'get_subjects':
        return this.client.getSubjects({
          parentId: args.parentId as string | undefined,
          lang,
        });

      case 'get_subject':
        return this.client.getSubject(args.id as string, lang);

      case 'search_subjects':
        return this.client.searchSubjects(args.name as string, lang);

      // ========== Units ==========
      case 'get_units':
        return this.client.getUnits({
          level: args.level as number | undefined,
          parentId: args.parentId as string | undefined,
          name: args.name as string | undefined,
          sort,
          page,
          pageSize,
          lang,
        });

      case 'get_unit':
        return this.client.getUnit(args.id as string, lang);

      case 'search_units':
        return this.client.searchUnits(args.name as string, {
          level: args.level as number | undefined,
          page,
          pageSize,
          lang,
        });

      // ========== Localities ==========
      case 'get_localities':
        return this.client.getLocalities({
          parentId: args.parentId as string | undefined,
          name: args.name as string | undefined,
          year: args.year as number | undefined,
          sort,
          page,
          pageSize,
          lang,
        });

      case 'get_locality':
        return this.client.getLocality(args.id as string, {
          year: args.year as number | undefined,
          lang,
        });

      case 'search_localities':
        return this.client.searchLocalities(args.name as string, {
          year: args.year as number | undefined,
          page,
          pageSize,
          lang,
        });

      // ========== Variables ==========
      case 'get_variables':
        return this.client.getVariables({
          subjectId: args.subjectId as string | undefined,
          level: args.level as number | undefined,
          year: args.year as number | undefined,
          sort,
          page,
          pageSize,
          lang,
        });

      case 'get_variable':
        return this.client.getVariable(args.id as number, lang);

      case 'search_variables':
        return this.client.searchVariables(args.name as string, {
          subjectId: args.subjectId as string | undefined,
          level: args.level as number | undefined,
          year: args.year as number | undefined,
          page,
          pageSize,
          lang,
        });

      // ========== Data ==========
      case 'get_data_by_variable':
        return this.client.getDataByVariable(args.varId as number, {
          unitLevel: args.unitLevel as number | undefined,
          unitParentId: args.unitParentId as string | undefined,
          year: args.year as number | number[] | undefined,
          page,
          pageSize,
          lang,
        });

      case 'get_data_by_unit':
        return this.client.getDataByUnit(args.unitId as string, {
          varId: args.varId as number | number[] | undefined,
          year: args.year as number | number[] | undefined,
          page,
          pageSize,
          lang,
        });

      case 'get_locality_data_by_variable':
        return this.client.getLocalityDataByVariable(args.varId as number, {
          unitParentId: args.unitParentId as string | undefined,
          year: args.year as number | undefined,
          page,
          pageSize,
          lang,
        });

      case 'get_locality_data_by_unit':
        return this.client.getLocalityDataByUnit(args.unitId as string, {
          varId: args.varId as number | number[] | undefined,
          year: args.year as number | undefined,
          page,
          pageSize,
          lang,
        });

      // ========== Years ==========
      case 'get_years':
        return this.client.getYears(lang);

      case 'get_year':
        return this.client.getYear(args.id as number, lang);

      // ========== Version ==========
      case 'get_api_version':
        return this.client.getVersion();

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
