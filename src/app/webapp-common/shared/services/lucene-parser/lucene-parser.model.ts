export const IMPLICIT = '<implicit>';

export const OPERATORS = ['and', 'or', 'not', 'AND', 'OR', 'NOT', '||', '&&'];

export interface ILuceneNode {
  left: ILuceneField | ILuceneNode;
  operator: string;
  right: ILuceneField | ILuceneNode;
}

export interface ILuceneField {
  boost: string;
  field: string;
  fieldLocation: ILuceneLocation;
  prefix: string;
  quoted: boolean;
  similarity: null; // TODO:?
  term: string;
  termLocation: ILuceneLocation;
}

export interface ILuceneLocation {
  end: ILuceneLocationPosition;
  start: ILuceneLocationPosition;
}

export interface ILuceneLocationPosition {
  column: number;
  line: number;
  offset: number;
}
