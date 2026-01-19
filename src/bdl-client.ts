// BDL API Client for Cloudflare Workers

import type {
  Aggregate,
  AggregateList,
  Attribute,
  AttributeList,
  DataByUnit,
  DataByVariable,
  Language,
  Level,
  LevelList,
  Locality,
  LocalityList,
  Measure,
  MeasureList,
  Metadata,
  SortOrder,
  Subject,
  SubjectList,
  Unit,
  UnitList,
  Variable,
  VariableDetails,
  VariableList,
  Version,
  Year,
  YearList,
} from './types';

export interface BDLClientConfig {
  baseUrl: string;
  defaultLanguage?: Language;
}

export class BDLClient {
  private baseUrl: string;
  private defaultLanguage: Language;

  constructor(config: BDLClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.defaultLanguage = config.defaultLanguage || 'pl';
  }

  private async fetch<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    // Always request JSON format
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': this.defaultLanguage,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BDL API Error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  // ========== Aggregates ==========
  
  async getAggregatesMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/aggregates/metadata', { lang });
  }

  async getAggregate(id: number, lang?: Language): Promise<Aggregate> {
    return this.fetch<Aggregate>(`/aggregates/${id}`, { lang });
  }

  async getAggregates(options?: { sort?: SortOrder; lang?: Language }): Promise<AggregateList> {
    return this.fetch<AggregateList>('/aggregates', options);
  }

  // ========== Attributes ==========

  async getAttributesMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/attributes/metadata', { lang });
  }

  async getAttribute(id: number, lang?: Language): Promise<Attribute> {
    return this.fetch<Attribute>(`/attributes/${id}`, { lang });
  }

  async getAttributes(options?: { sort?: SortOrder; lang?: Language }): Promise<AttributeList> {
    return this.fetch<AttributeList>('/attributes', options);
  }

  // ========== Levels ==========

  async getLevelsMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/levels/metadata', { lang });
  }

  async getLevel(id: number, lang?: Language): Promise<Level> {
    return this.fetch<Level>(`/levels/${id}`, { lang });
  }

  async getLevels(options?: { sort?: SortOrder; lang?: Language }): Promise<LevelList> {
    return this.fetch<LevelList>('/levels', options);
  }

  // ========== Measures ==========

  async getMeasuresMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/measures/metadata', { lang });
  }

  async getMeasure(id: number, lang?: Language): Promise<Measure> {
    return this.fetch<Measure>(`/measures/${id}`, { lang });
  }

  async getMeasures(options?: { sort?: SortOrder; lang?: Language }): Promise<MeasureList> {
    return this.fetch<MeasureList>('/measures', options);
  }

  // ========== Subjects ==========

  async getSubjectsMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/subjects/metadata', { lang });
  }

  async getSubjects(options?: { parentId?: string; lang?: Language }): Promise<SubjectList> {
    return this.fetch<SubjectList>('/subjects', { 'parent-id': options?.parentId, lang: options?.lang });
  }

  async searchSubjects(name: string, lang?: Language): Promise<SubjectList> {
    return this.fetch<SubjectList>('/subjects/search', { name, lang });
  }

  async getSubject(id: string, lang?: Language): Promise<Subject> {
    return this.fetch<Subject>(`/subjects/${id}`, { lang });
  }

  // ========== Units ==========

  async getUnitsMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/units/metadata', { lang });
  }

  async getUnit(id: string, lang?: Language): Promise<Unit> {
    return this.fetch<Unit>(`/units/${id}`, { lang });
  }

  async getUnits(options?: {
    level?: number;
    parentId?: string;
    name?: string;
    sort?: SortOrder;
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<UnitList> {
    return this.fetch<UnitList>('/units', {
      level: options?.level,
      'parent-id': options?.parentId,
      name: options?.name,
      sort: options?.sort,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  async searchUnits(name: string, options?: {
    level?: number;
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<UnitList> {
    return this.fetch<UnitList>('/units/search', {
      name,
      level: options?.level,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  // ========== Localities ==========

  async getLocalities(options?: {
    parentId?: string;
    name?: string;
    year?: number;
    sort?: SortOrder;
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<LocalityList> {
    return this.fetch<LocalityList>('/units/localities', {
      'parent-id': options?.parentId,
      name: options?.name,
      year: options?.year,
      sort: options?.sort,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  async getLocality(id: string, options?: { year?: number; lang?: Language }): Promise<Locality> {
    return this.fetch<Locality>(`/units/localities/${id}`, {
      year: options?.year,
      lang: options?.lang,
    });
  }

  async searchLocalities(name: string, options?: {
    year?: number;
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<LocalityList> {
    return this.fetch<LocalityList>('/units/localities/search', {
      name,
      year: options?.year,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  // ========== Variables ==========

  async getVariablesMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/variables/metadata', { lang });
  }

  async getVariable(id: number, lang?: Language): Promise<VariableDetails> {
    return this.fetch<VariableDetails>(`/variables/${id}`, { lang });
  }

  async getVariables(options?: {
    subjectId?: string;
    level?: number;
    year?: number;
    sort?: SortOrder;
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<VariableList> {
    return this.fetch<VariableList>('/variables', {
      'subject-id': options?.subjectId,
      level: options?.level,
      year: options?.year,
      sort: options?.sort,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  async searchVariables(name: string, options?: {
    subjectId?: string;
    level?: number;
    year?: number;
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<VariableList> {
    return this.fetch<VariableList>('/variables/search', {
      name,
      'subject-id': options?.subjectId,
      level: options?.level,
      year: options?.year,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  // ========== Data ==========

  async getDataMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/data/metadata', { lang });
  }

  async getDataByVariable(varId: number, options?: {
    unitLevel?: number;
    unitParentId?: string;
    year?: number | number[];
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<DataByVariable> {
    const yearParam = Array.isArray(options?.year) ? options.year.join(',') : options?.year;
    return this.fetch<DataByVariable>(`/data/by-variable/${varId}`, {
      'unit-level': options?.unitLevel,
      'unit-parent-id': options?.unitParentId,
      year: yearParam,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  async getDataByUnit(unitId: string, options?: {
    varId?: number | number[];
    year?: number | number[];
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<DataByUnit> {
    const varIdParam = Array.isArray(options?.varId) ? options.varId.join(',') : options?.varId;
    const yearParam = Array.isArray(options?.year) ? options.year.join(',') : options?.year;
    return this.fetch<DataByUnit>(`/data/by-unit/${unitId}`, {
      'var-id': varIdParam,
      year: yearParam,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  async getLocalityDataByVariable(varId: number, options?: {
    unitParentId?: string;
    year?: number;
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<DataByVariable> {
    return this.fetch<DataByVariable>(`/data/localities/by-variable/${varId}`, {
      'unit-parent-id': options?.unitParentId,
      year: options?.year,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  async getLocalityDataByUnit(unitId: string, options?: {
    varId?: number | number[];
    year?: number;
    page?: number;
    pageSize?: number;
    lang?: Language;
  }): Promise<DataByUnit> {
    const varIdParam = Array.isArray(options?.varId) ? options.varId.join(',') : options?.varId;
    return this.fetch<DataByUnit>(`/data/localities/by-unit/${unitId}`, {
      'var-id': varIdParam,
      year: options?.year,
      page: options?.page,
      'page-size': options?.pageSize,
      lang: options?.lang,
    });
  }

  // ========== Years ==========

  async getYearsMetadata(lang?: Language): Promise<Metadata> {
    return this.fetch<Metadata>('/years/metadata', { lang });
  }

  async getYear(id: number, lang?: Language): Promise<Year> {
    return this.fetch<Year>(`/years/${id}`, { lang });
  }

  async getYears(lang?: Language): Promise<YearList> {
    return this.fetch<YearList>('/years', { lang });
  }

  // ========== Version ==========

  async getVersion(): Promise<Version> {
    return this.fetch<Version>('/version');
  }
}
