// Types based on BDL API Swagger specification

export interface Metadata {
  title?: string;
  description?: string;
  copyright?: string;
  disclaimer?: string;
}

export interface Version {
  id?: string;
  major: number;
  minor: number;
  modificationDate: string;
  deprecated?: string;
}

export interface PageLinks {
  first?: string;
  self?: string;
  next?: string;
  prev?: string;
  last?: string;
}

export interface Aggregate {
  metadata?: Metadata;
  version?: Version;
  id: number;
  name?: string;
  description?: string;
  levels?: number[];
}

export interface AggregateList {
  totalRecords?: number;
  results?: Aggregate[];
  metadata?: Metadata;
  version?: Version;
}

export interface Attribute {
  metadata?: Metadata;
  version?: Version;
  id: number;
  name?: string;
  description?: string;
  symbol?: string;
}

export interface AttributeList {
  totalRecords?: number;
  results?: Attribute[];
  metadata?: Metadata;
  version?: Version;
}

export interface Level {
  metadata?: Metadata;
  version?: Version;
  id: number;
  name?: string;
}

export interface LevelList {
  totalRecords?: number;
  results?: Level[];
  metadata?: Metadata;
  version?: Version;
}

export interface Measure {
  metadata?: Metadata;
  version?: Version;
  id: number;
  name?: string;
}

export interface MeasureList {
  totalRecords?: number;
  results?: Measure[];
  metadata?: Metadata;
  version?: Version;
}

export interface Subject {
  metadata?: Metadata;
  version?: Version;
  id: string;
  name?: string;
  hasVariables: boolean;
  children?: Subject[];
  level?: number;
}

export interface SubjectList {
  results?: Subject[];
  metadata?: Metadata;
  version?: Version;
}

export interface Unit {
  metadata?: Metadata;
  version?: Version;
  id: string;
  name?: string;
  level?: number;
  parentId?: string;
  kind?: number;
  hasVariables?: boolean;
}

export interface UnitList {
  totalRecords?: number;
  page?: number;
  pageSize?: number;
  links?: PageLinks;
  results?: Unit[];
  metadata?: Metadata;
  version?: Version;
}

export interface Locality {
  metadata?: Metadata;
  version?: Version;
  id: string;
  name?: string;
  parentId?: string;
  level?: number;
  kind?: number;
}

export interface LocalityList {
  totalRecords?: number;
  page?: number;
  pageSize?: number;
  links?: PageLinks;
  results?: Locality[];
  metadata?: Metadata;
  version?: Version;
}

export interface Variable {
  metadata?: Metadata;
  version?: Version;
  id: number;
  subjectId?: string;
  n1?: string;
  n2?: string;
  n3?: string;
  n4?: string;
  n5?: string;
  level: number;
  measureUnitId: number;
  measureUnitName?: string;
}

export interface VariableDetails extends Variable {
  description?: string;
  years?: number[];
}

export interface VariableList {
  totalRecords?: number;
  page?: number;
  pageSize?: number;
  links?: PageLinks;
  results?: Variable[];
  metadata?: Metadata;
  version?: Version;
}

export interface YearValue {
  year?: string;
  value: number;
  valueFormatted?: string;
  attrId?: number;
  precision: number;
}

export interface DataValue {
  id?: string;
  name?: string;
  year?: string;
  values?: YearValue[];
}

export interface DataByVariable {
  totalRecords?: number;
  page?: number;
  pageSize?: number;
  links?: PageLinks;
  results?: DataValue[];
  metadata?: Metadata;
  version?: Version;
}

export interface DataByUnit {
  totalRecords?: number;
  page?: number;
  pageSize?: number;
  links?: PageLinks;
  results?: DataValue[];
  metadata?: Metadata;
  version?: Version;
}

export interface Year {
  metadata?: Metadata;
  version?: Version;
  id: number;
  hasLocalities: boolean;
  quarterly?: string;
}

export interface YearList {
  totalRecords?: number;
  results?: Year[];
  metadata?: Metadata;
  version?: Version;
}

export interface ErrorResponseMessage {
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
}

// Query parameter types
export type Language = 'pl' | 'en';
export type Format = 'json' | 'jsonapi' | 'xml';
export type SortOrder = 'Id' | '-Id' | 'Name' | '-Name' | 'Id,Name' | 'Id,-Name' | '-Id,Name' | '-Id,-Name' | 'Name,Id' | 'Name,-Id' | '-Name,Id' | '-Name,-Id';
